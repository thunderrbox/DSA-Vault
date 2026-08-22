import { slugify } from "../../utils/slugify.js";

/**
 * Heuristically tag a problem based on its title and languages
 */
export function deriveTags(title, languages) {
  const tags = new Set();
  const lowerTitle = title.toLowerCase();

  // Language based tags
  if (languages.includes("mysql") || languages.includes("postgresql") || languages.includes("sql")) {
    tags.add("Database");
    tags.add("SQL");
  }

  // Topic keywords mapping
  if (lowerTitle.includes("binary search") || lowerTitle.includes("search in")) {
    tags.add("Binary Search");
  }
  if (
    lowerTitle.includes("tree") ||
    lowerTitle.includes("bst") ||
    lowerTitle.includes("lca") ||
    lowerTitle.includes("ancestor") ||
    lowerTitle.includes("invert")
  ) {
    tags.add("Tree");
    if (lowerTitle.includes("binary tree") || lowerTitle.includes("bst")) {
      tags.add("Binary Tree");
    }
  }
  if (
    lowerTitle.includes("graph") ||
    lowerTitle.includes("bfs") ||
    lowerTitle.includes("dfs") ||
    lowerTitle.includes("traverse")
  ) {
    tags.add("Graph");
  }
  if (
    lowerTitle.includes("sum") ||
    lowerTitle.includes("array") ||
    lowerTitle.includes("subarray") ||
    lowerTitle.includes("matrix") ||
    lowerTitle.includes("perimeter") ||
    lowerTitle.includes("squares") ||
    lowerTitle.includes("zeros")
  ) {
    tags.add("Array");
  }
  if (
    lowerTitle.includes("string") ||
    lowerTitle.includes("words") ||
    lowerTitle.includes("vowel") ||
    lowerTitle.includes("palindrome") ||
    lowerTitle.includes("parentheses") ||
    lowerTitle.includes("prefix")
  ) {
    tags.add("String");
  }
  if (lowerTitle.includes("design") || lowerTitle.includes("implement") || lowerTitle.includes("spreadsheet")) {
    tags.add("Design");
  }
  if (
    lowerTitle.includes("dynamic") ||
    lowerTitle.includes("dp") ||
    lowerTitle.includes("subsequence") ||
    lowerTitle.includes("climbing") ||
    lowerTitle.includes("triangle") ||
    lowerTitle.includes("optimal")
  ) {
    tags.add("Dynamic Programming");
  }
  if (lowerTitle.includes("sort") || lowerTitle.includes("rating")) {
    tags.add("Sorting");
  }
  if (lowerTitle.includes("list") || lowerTitle.includes("pointer")) {
    tags.add("Linked List");
  }

  // Add default tag if none matched
  if (tags.size === 0) {
    tags.add("Algorithms");
  }

  return Array.from(tags);
}

/**
 * Extract language from file extension
 */
export function getLanguageFromExtension(fileName) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "cpp":
    case "cc":
      return "cpp";
    case "mysql":
    case "sql":
      return "mysql";
    case "postgresql":
    case "psql":
      return "postgresql";
    case "java":
      return "java";
    case "py":
      return "python";
    case "js":
      return "javascript";
    case "ts":
      return "typescript";
    default:
      return "unknown";
  }
}

/**
 * Clean up title and extract difficulty from README first line.
 * E.g., "# Lowest Common Ancestor of a Binary Search Tree (Medium)"
 * Returns { title: "Lowest Common Ancestor of a Binary Search Tree", difficulty: "Medium" }
 */
export function parseFirstLine(firstLine) {
  const cleanLine = firstLine.replace(/^#\s*/, "").trim();
  const match = cleanLine.match(/^(.+?)\s*\((Easy|Medium|Hard)\)\s*$/i);
  if (match) {
    return {
      title: match[1].trim(),
      difficulty: match[2].trim(),
    };
  }
  return {
    title: cleanLine,
    difficulty: "Medium", // Fallback difficulty
  };
}

/**
 * Extract problem number from folder name
 */
export function extractProblemNumber(folderName) {
  const name = folderName.trim();
  const match = reSearch(/(?:^|Problem\s*-?\s*|Understanding\s+|Problem\s+Q|Problem\s+-?\s*Q)(\d+|Q\d+)/, name);
  if (match) {
    return match[1];
  }
  const matchFallback = reSearch(/([Q]\d+|\d+)/, name);
  if (matchFallback) {
    return matchFallback[1];
  }
  return "Unknown";
}

// Minimal helper to avoid importing regex engine wrappers
function reSearch(regex, str) {
  return regex.exec(str);
}

/**
 * Parses problem directory files into structured metadata.
 */
export function parseProblemFolder(folderName, files) {
  const problemNumber = extractProblemNumber(folderName);
  
  // 1. Find README.md
  const readmeFile = files.find((f) => f.name.toLowerCase() === "readme.md");
  let title = "";
  let difficulty = "Medium";
  let description = "";

  if (readmeFile) {
    const lines = readmeFile.content.split(/\r?\n/);
    // Find first non-empty line
    const firstLineIndex = lines.findIndex((l) => l.trim().length > 0);
    if (firstLineIndex !== -1) {
      const parsed = parseFirstLine(lines[firstLineIndex]);
      title = parsed.title;
      difficulty = parsed.difficulty;

      // Extract description
      // Typically description is everything after the first horizontal rule "---" and before "📝 Notes"
      const hrIndex = lines.findIndex((l, idx) => idx > firstLineIndex && l.trim() === "---");
      const notesIndex = lines.findIndex((l) => l.includes("Notes"));
      
      const startIndex = hrIndex !== -1 ? hrIndex + 1 : firstLineIndex + 1;
      const endIndex = notesIndex !== -1 ? notesIndex : lines.length;

      description = lines
          .slice(startIndex, endIndex)
          .join("\n")
          .trim();
    }
  }

  // If no README.md or title couldn't be parsed, clean title from folder name
  if (!title) {
    // Strip prefixes like "Problem - ", "Problem ", numbers and dots
    const cleanedFolderName = folderName
      .replace(/^Problem\s*-\s*/gi, "")
      .replace(/^Problem\s*Q?\d*\.?\s*/gi, "")
      .replace(/^Problem and Understanding\s*\d*\.?\s*/gi, "")
      .replace(/^\d+\.\s*/g, "") // E.g. "2353. "
      .replace(/\s*Solved.*$/i, "") // E.g. "Solved Hard Topics..."
      .trim();
    
    title = cleanedFolderName || `Problem ${problemNumber}`;
  }

  const slug = slugify(title);

  // 2. Parse Solutions
  const solutions = [];
  const languages = [];

  const solutionFiles = files.filter(
    (f) => f.name.toLowerCase() !== "readme.md" && !f.name.startsWith(".")
  );

  for (const file of solutionFiles) {
    const lang = getLanguageFromExtension(file.name);
    if (lang !== "unknown") {
      solutions.push({
        language: lang,
        filePath: `${folderName}/${file.name}`,
        codeContent: file.content,
      });
      languages.push(lang);
    }
  }

  // 3. Heuristic Tags
  const tags = deriveTags(title, languages);

  return {
    problemNumber,
    title,
    slug,
    difficulty,
    description: description || `<p>Please see solution file for details.</p>`,
    solutions,
    tags,
  };
}
