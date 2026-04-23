import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { extractModuleSections } from "./extractModule.js";

/**
 * Count code fence opens vs closes in markdown content.
 * Returns the imbalance (positive = unclosed fences).
 */
function countFenceImbalance(content: string): number {
  let opens = 0;
  for (const line of content.split("\n")) {
    if (/^```/.test(line)) opens++;
  }
  // Every fence is a toggle (open then close), so total should be even
  return opens % 2;
}

/**
 * Validate code fences in all markdown files under a skill directory.
 * Returns warnings for any files with unbalanced fences.
 */
async function validateSkillFences(
  skillsBase: string,
  skillName: string,
  files: string[],
): Promise<string[]> {
  const warnings: string[] = [];
  for (const file of files) {
    const filePath = join(skillsBase, skillName, file);
    try {
      const content = await readFile(filePath, "utf-8");
      const imbalance = countFenceImbalance(content);
      if (imbalance !== 0) {
        warnings.push(
          `Unbalanced code fences in ${skillName}/${file}: odd number of fence markers`,
        );
      }
    } catch {
      warnings.push(`Missing file: ${skillName}/${file}`);
    }
  }
  return warnings;
}

/**
 * Validate that documented modules have matching headings in the stdlib reference.
 * Returns warnings for any modules whose headings cannot be extracted.
 */
function validateModuleHeadings(stdlib: string, modules: string[]): string[] {
  const warnings: string[] = [];
  for (const mod of modules) {
    try {
      const result = extractModuleSections(stdlib, mod);
      if (!result || result.trim().length === 0) {
        warnings.push(`Module "${mod}": extracted content is empty`);
      }
    } catch (err) {
      warnings.push(`Module "${mod}": ${(err as Error).message}`);
    }
  }
  return warnings;
}

/**
 * Run all startup content validations and log warnings.
 * Non-fatal — the server starts regardless, but warns about potential issues.
 */
export async function validateStartupContent(
  skillsBase: string,
  documentedModules: string[],
  stdlib: string,
): Promise<void> {
  const warnings: string[] = [];

  // Validate module headings
  warnings.push(...validateModuleHeadings(stdlib, documentedModules));

  // Validate code fences in skill markdown files
  const langRefFiles = [
    "SKILL.md",
    "references/stdlib-patterns.md",
    "references/syntax.md",
    "references/types.md",
    "references/idiomatic-pike.md",
  ];
  warnings.push(
    ...(await validateSkillFences(skillsBase, "pike-language-reference", langRefFiles)),
  );

  const stdlibApiFiles = [
    "SKILL.md",
    "references/stdio-api.md",
    "references/adt-api.md",
    "references/utilities-api.md",
    "references/crypto-api.md",
    "references/protocols-api.md",
    "references/concurrent-api.md",
    "references/standards-api.md",
  ];
  warnings.push(...(await validateSkillFences(skillsBase, "pike-stdlib-api", stdlibApiFiles)));

  const debugFiles = [
    "SKILL.md",
    "references/cli-and-introspection.md",
    "references/error-patterns.md",
  ];
  warnings.push(...(await validateSkillFences(skillsBase, "pike-debugging", debugFiles)));

  if (warnings.length > 0) {
    console.error(`Content validation warnings (${warnings.length}):`);
    for (const w of warnings) {
      console.error(`  - ${w}`);
    }
  } else {
    console.error("Content validation passed: all modules and fences OK");
  }
}
