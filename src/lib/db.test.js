import { db } from "./db.js";

describe("Database CRUD Operations & Validation", () => {
  // Clean up database before and after tests
  beforeEach(async () => {
    await db.solution.deleteMany();
    await db.bookmark.deleteMany();
    await db.progress.deleteMany();
    await db.problem.deleteMany();
    await db.user.deleteMany();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it("should create, read, and update a problem with its solutions", async () => {
    // 1. Create a problem
    const problem = await db.problem.create({
      data: {
        problemNumber: "1",
        title: "Two Sum",
        slug: "two-sum",
        difficulty: "Easy",
        description: "<p>Given an array of integers...</p>",
        githubPath: "Problem and Understanding 1. Two Sum",
        githubUrl: "https://github.com/thunderrbox/LeetCode/tree/main/Problem%20and%20Understanding%201.%20Two%20Sum",
        commitSha: "abc123commitsha",
        solutions: {
          create: [
            {
              language: "cpp",
              filePath: "Problem and Understanding 1. Two Sum/Two_Sum.cpp",
              codeContent: "class Solution { ... }",
            },
          ],
        },
      },
      include: {
        solutions: true,
      },
    });

    expect(problem.id).toBeDefined();
    expect(problem.title).toBe("Two Sum");
    expect(problem.solutions).toHaveLength(1);
    expect(problem.solutions[0].language).toBe("cpp");

    // 2. Read the problem
    const retrieved = await db.problem.findUnique({
      where: { slug: "two-sum" },
      include: { solutions: true },
    });
    expect(retrieved).not.toBeNull();
    expect(retrieved?.problemNumber).toBe("1");

    // 3. Update the problem
    const updated = await db.problem.update({
      where: { id: problem.id },
      data: {
        difficulty: "Medium", // updated difficulty
      },
    });
    expect(updated.difficulty).toBe("Medium");
  });

  it("should enforce unique constraint on problemNumber and slug (duplicate protection)", async () => {
    // Create the first problem
    await db.problem.create({
      data: {
        problemNumber: "1",
        title: "Two Sum",
        slug: "two-sum",
        difficulty: "Easy",
        description: "<p>description</p>",
        githubPath: "path1",
        githubUrl: "url1",
        commitSha: "sha1",
      },
    });

    // Attempting to create another problem with the same slug should throw an error
    await expect(
      db.problem.create({
        data: {
          problemNumber: "2",
          title: "Two Sum Duplicate",
          slug: "two-sum", // duplicate slug
          difficulty: "Easy",
          description: "<p>description</p>",
          githubPath: "path2",
          githubUrl: "url2",
          commitSha: "sha2",
        },
      })
    ).rejects.toThrow();

    // Attempting to create another problem with the same problemNumber should throw an error
    await expect(
      db.problem.create({
        data: {
          problemNumber: "1", // duplicate problem number
          title: "Two Sum Again",
          slug: "two-sum-again",
          difficulty: "Easy",
          description: "<p>description</p>",
          githubPath: "path3",
          githubUrl: "url3",
          commitSha: "sha3",
        },
      })
    ).rejects.toThrow();
  });
});
