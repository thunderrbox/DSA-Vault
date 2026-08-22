/**
 * Converts a string into a clean, URL-friendly slug.
 * E.g., "Lowest Common Ancestor of a Binary Search Tree (Medium)" -> "lowest-common-ancestor-of-a-binary-search-tree"
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    // Remove content inside parentheses (like difficulty)
    .replace(/\s*\([^)]*\)/g, "")
    // Replace non-alphanumeric characters with hyphens
    .replace(/[^a-z0-9]+/g, "-")
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, "");
}
