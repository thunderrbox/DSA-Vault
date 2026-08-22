import {
  parseProblemFolder,
  extractProblemNumber,
  deriveTags,
  parseFirstLine,
} from "./problemParser.js";

describe("GitHub Repository Parser (Phase 5)", () => {
  describe("extractProblemNumber", () => {
    it("should parse standard numbers", () => {
      expect(extractProblemNumber("Problem - 120. Triangle")).toBe("120");
      expect(extractProblemNumber(" 2353. Design a Food Rating System")).toBe("2353");
    });

    it("should parse Q-numbers", () => {
      expect(extractProblemNumber("Problem Q1. Concatenation of Array")).toBe("Q1");
    });

    it("should parse numbers with no spaces", () => {
      expect(extractProblemNumber("Problem-236")).toBe("236");
    });

    it("should parse prefix-heavy folder names", () => {
      expect(extractProblemNumber("Problem and Understanding 1. Two Sum")).toBe("1");
    });
  });

  describe("parseFirstLine", () => {
    it("should parse title and difficulty from standard headers", () => {
      const res = parseFirstLine("# Lowest Common Ancestor of a Binary Search Tree (Medium)");
      expect(res.title).toBe("Lowest Common Ancestor of a Binary Search Tree");
      expect(res.difficulty).toBe("Medium");
    });

    it("should handle headers with extra spaces or missing parentheses", () => {
      const res = parseFirstLine("# Two Sum (Easy)  ");
      expect(res.title).toBe("Two Sum");
      expect(res.difficulty).toBe("Easy");
    });

    it("should fallback gracefully if no difficulty is matched", () => {
      const res = parseFirstLine("# Invert Binary Tree");
      expect(res.title).toBe("Invert Binary Tree");
      expect(res.difficulty).toBe("Medium"); // default
    });
  });

  describe("deriveTags", () => {
    it("should associate SQL extensions with Database and SQL tags", () => {
      const tags = deriveTags("Recyclable and Low Fat Products", ["mysql"]);
      expect(tags).toContain("Database");
      expect(tags).toContain("SQL");
    });

    it("should tag tree concepts based on keyword matching", () => {
      const tags = deriveTags("Invert Binary Tree", ["cpp"]);
      expect(tags).toContain("Tree");
      expect(tags).toContain("Binary Tree");
    });

    it("should tag DP concepts based on keyword matching", () => {
      const tags = deriveTags("Triangle", ["cpp"]);
      expect(tags).toContain("Dynamic Programming");
    });
  });

  describe("parseProblemFolder", () => {
    it("should parse standard folder with README and source code", () => {
      const folderName = "Problem and Understanding 1. Two Sum";
      const files = [
        {
          name: "README.md",
          content: `
# Two Sum (Easy)

---

<p>Given an array of integers, return indices of the two numbers...</p>

 📝 Notes 
 ---
          `.trim(),
        },
        {
          name: "Two_Sum.cpp",
          content: "class Solution { ... };",
        },
      ];

      const res = parseProblemFolder(folderName, files);

      expect(res.problemNumber).toBe("1");
      expect(res.title).toBe("Two Sum");
      expect(res.slug).toBe("two-sum");
      expect(res.difficulty).toBe("Easy");
      expect(res.description).toBe("<p>Given an array of integers, return indices of the two numbers...</p>");
      expect(res.solutions).toHaveLength(1);
      expect(res.solutions[0].language).toBe("cpp");
      expect(res.solutions[0].filePath).toBe("Problem and Understanding 1. Two Sum/Two_Sum.cpp");
      expect(res.tags).toContain("Array");
    });

    it("should fallback gracefully when README is missing", () => {
      const folderName = "Problem - 297. Serialize and Deserialize Binary Tree";
      const files = [
        {
          name: "Serialize_and_Deserialize_Binary_Tree.cpp",
          content: "class Codec { ... };",
        },
      ];

      const res = parseProblemFolder(folderName, files);

      expect(res.problemNumber).toBe("297");
      expect(res.title).toBe("Serialize and Deserialize Binary Tree");
      expect(res.difficulty).toBe("Medium"); // fallback
      expect(res.solutions).toHaveLength(1);
      expect(res.solutions[0].language).toBe("cpp");
      expect(res.tags).toContain("Tree");
    });
  });
});
