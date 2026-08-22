import { codeToHtml } from "shiki";

/**
 * Highlights a block of code on the server using Shiki.
 * Returns an HTML string.
 */
export async function highlightCode(code, lang) {
  // Normalize languages
  let normalizedLang = lang.toLowerCase();
  if (normalizedLang === "cpp") normalizedLang = "cpp";
  if (normalizedLang === "mysql" || normalizedLang === "postgresql") normalizedLang = "sql";

  try {
    return await codeToHtml(code, {
      lang: normalizedLang,
      theme: "github-dark",
    });
  } catch (e) {
    console.error(`Failed to highlight code with lang '${lang}', fallback to plaintext:`, e);
    try {
      return await codeToHtml(code, {
        lang: "txt",
        theme: "github-dark",
      });
    } catch {
      return `<pre><code>${code}</code></pre>`;
    }
  }
}
