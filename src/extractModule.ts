/**
 * Extract ##-level sections from markdown content whose heading contains
 * the given module name. Case-insensitive matching.
 *
 * Handles headings like:
 *   ## Stdio
 *   ## Stdio — File I/O
 *   ## Stdio.File — Comprehensive Reference
 *   ## Array (generic functions)
 *   ## Process monitoring
 */
export function extractModuleSections(content: string, moduleName: string): string {
  const lines = content.split("\n");
  const results: string[] = [];
  let inMatch = false;
  const lowerModule = moduleName.toLowerCase();

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (inMatch) results.push(""); // blank line between sections
      const lower = line.toLowerCase();
      inMatch =
        lower.includes(lowerModule + " ")
        || lower.includes(lowerModule + " —")
        || lower.includes(lowerModule + "(")
        || lower.includes(lowerModule + ".")
        || lower.endsWith(lowerModule);
      if (inMatch) results.push(line);
    } else if (inMatch) {
      results.push(line);
    }
  }

  return results.join("\n").trim()
    || `No curated reference found for ${moduleName}. Use pike-describe-symbol for runtime introspection.`;
}
