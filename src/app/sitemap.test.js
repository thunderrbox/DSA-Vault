import sitemap from "./sitemap.js";

// Mock the db client
jest.mock("../lib/db.js", () => ({
  db: {
    problem: {
      findMany: jest.fn().mockResolvedValue([
        { slug: "two-sum", updatedAt: new Date("2026-08-20") },
        { slug: "lowest-common-ancestor", updatedAt: new Date("2026-08-21") },
      ]),
    },
    tag: {
      findMany: jest.fn().mockResolvedValue([
        { name: "Array" },
        { name: "Dynamic Programming" },
      ]),
    },
  },
}));

describe("Dynamic Sitemap Generator", () => {
  it("should generate dynamic entries for all static and dynamic paths", async () => {
    process.env.NEXTAUTH_URL = "https://dsa-vault.vercel.app";
    const result = await sitemap();

    // Verify static routes
    const urls = result.map((r) => r.url);
    expect(urls).toContain("https://dsa-vault.vercel.app");
    expect(urls).toContain("https://dsa-vault.vercel.app/problems");
    expect(urls).toContain("https://dsa-vault.vercel.app/about");

    // Verify dynamic difficulty routes
    expect(urls).toContain("https://dsa-vault.vercel.app/difficulty/easy");
    expect(urls).toContain("https://dsa-vault.vercel.app/difficulty/medium");

    // Verify dynamic problem routes
    expect(urls).toContain("https://dsa-vault.vercel.app/problems/two-sum");
    expect(urls).toContain("https://dsa-vault.vercel.app/problems/lowest-common-ancestor");

    // Verify dynamic topic routes
    expect(urls).toContain("https://dsa-vault.vercel.app/topics/array");
    expect(urls).toContain("https://dsa-vault.vercel.app/topics/dynamic-programming");

    // Check sizes (5 static + 3 diff + 2 problems + 2 topics = 12 total routes)
    expect(result.length).toBe(12);
  });
});
