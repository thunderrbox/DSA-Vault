/** @jest-environment node */
import { POST } from "./route.js";
import { db } from "@/lib/db";
import crypto from "crypto";

const SYNC_SECRET = "local_shared_sync_secret_key";
process.env.SYNC_SECRET = SYNC_SECRET;
jest.setTimeout(30000);

function signPayload(payload, secret) {
  const hmac = crypto.createHmac("sha256", secret);
  return "sha256=" + hmac.update(payload).digest("hex");
}

describe("GitHub Synchronizer Webhook Route Handler", () => {
  beforeEach(async () => {
    await db.solution.deleteMany();
    await db.bookmark.deleteMany();
    await db.progress.deleteMany();
    await db.problem.deleteMany();
    await db.syncEvent.deleteMany();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it("should reject requests with missing signature headers with 401", async () => {
    const payload = JSON.stringify({ commitSha: "123", files: [] });
    const req = new Request("http://localhost/api/sync/github", {
      method: "POST",
      body: payload,
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should reject signature mismatch payloads with 401", async () => {
    const payload = JSON.stringify({ commitSha: "123", files: [] });
    const req = new Request("http://localhost/api/sync/github", {
      method: "POST",
      headers: {
        "X-Hub-Signature-256": "sha256=invalid_signature_here",
      },
      body: payload,
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should accept valid signatures and parse new problems idempotently", async () => {
    // 1. Send first payload to add a problem
    const payloadObject = {
      commitSha: "sha_commit_1",
      files: [
        {
          path: "Problem - 120. Triangle/README.md",
          status: "added",
          content: "# Triangle (Medium)\n\n---\n\n<p>Problem body</p>\n\n 📝 Notes \n ---\n",
        },
        {
          path: "Problem - 120. Triangle/Triangle.cpp",
          status: "added",
          content: "class Solution {};",
        },
      ],
    };

    const rawPayload = JSON.stringify(payloadObject);
    const signature = signPayload(rawPayload, SYNC_SECRET);

    const req = new Request("http://localhost/api/sync/github", {
      method: "POST",
      headers: {
        "X-Hub-Signature-256": signature,
      },
      body: rawPayload,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.created).toBe(1);

    // Verify database has problem
    const problem = await db.problem.findUnique({
      where: { slug: "triangle" },
      include: { solutions: true },
    });
    expect(problem).not.toBeNull();
    expect(problem?.title).toBe("Triangle");
    expect(problem?.difficulty).toBe("Medium");
    expect(problem?.solutions).toHaveLength(1);
    expect(problem?.solutions[0].codeContent).toBe("class Solution {};");

    // 2. Send the exact same payload again (idempotency check)
    const reqDuplicate = new Request("http://localhost/api/sync/github", {
      method: "POST",
      headers: {
        "X-Hub-Signature-256": signature,
      },
      body: rawPayload,
    });

    const resDuplicate = await POST(reqDuplicate);
    expect(resDuplicate.status).toBe(200);

    const bodyDuplicate = await resDuplicate.json();
    expect(bodyDuplicate.success).toBe(true);
    expect(bodyDuplicate.created).toBe(0);
    expect(bodyDuplicate.updated).toBe(1); // idempotent upsert

    // Count problems (should still be 1, no duplicate entries created!)
    const count = await db.problem.count();
    expect(count).toBe(1);
  });

  it("should incrementally update solution content without resetting metadata", async () => {
    // First, insert problem metadata via mock payload
    const p1 = JSON.stringify({
      commitSha: "commit_1",
      files: [
        {
          path: "Problem and Understanding 1. Two Sum/README.md",
          status: "added",
          content: "# Two Sum (Easy)\n\n---\n\n<p>Original body</p>\n\n 📝 Notes \n ---\n",
        },
      ],
    });

    await POST(
      new Request("http://localhost/api/sync/github", {
        method: "POST",
        headers: { "X-Hub-Signature-256": signPayload(p1, SYNC_SECRET) },
        body: p1,
      })
    );

    // Now, push solution code file updates separately
    const p2 = JSON.stringify({
      commitSha: "commit_2",
      files: [
        {
          path: "Problem and Understanding 1. Two Sum/Two_Sum.cpp",
          status: "added",
          content: "class Solution { int twoSum; };",
        },
      ],
    });

    const res = await POST(
      new Request("http://localhost/api/sync/github", {
        method: "POST",
        headers: { "X-Hub-Signature-256": signPayload(p2, SYNC_SECRET) },
        body: p2,
      })
    );
    expect(res.status).toBe(200);

    // Verify metadata remains intact, and solution code was successfully merged
    const problem = await db.problem.findUnique({
      where: { slug: "two-sum" },
      include: { solutions: true },
    });
    expect(problem?.title).toBe("Two Sum");
    expect(problem?.description).toBe("<p>Original body</p>");
    expect(problem?.solutions).toHaveLength(1);
    expect(problem?.solutions[0].codeContent).toBe("class Solution { int twoSum; };");
  });
});
