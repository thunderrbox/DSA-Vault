import { slugify } from "./slugify.js";

describe("slugify utility helper", () => {
  it("should convert simple strings to lowercase and replace spaces with hyphens", () => {
    expect(slugify("Two Sum")).toBe("two-sum");
  });

  it("should remove parenthesized difficulty text", () => {
    expect(slugify("Lowest Common Ancestor of a Binary Search Tree (Medium)")).toBe(
      "lowest-common-ancestor-of-a-binary-search-tree"
    );
  });

  it("should clean special characters and punctuation", () => {
    expect(slugify("Problem - 1502 - Can Make Arithmetic Progression?")).toBe(
      "problem-1502-can-make-arithmetic-progression"
    );
  });

  it("should remove leading and trailing hyphens", () => {
    expect(slugify("---hello world---")).toBe("hello-world");
  });
});
