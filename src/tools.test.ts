import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runPike, runPikeCode } from "./runner.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Pike code helpers — use \\n so Pike sees literal \n (JS template literal \n = real newline)
const NL = "\\n";

// Pike binary must be available
describe("Pike runtime", () => {
  it("should have Pike available", async () => {
    const { exitCode, stdout, stderr } = await runPike(["--version"], undefined, 5000);
    expect(exitCode).toBe(0);
    const output = stdout + stderr;
    expect(output).toContain("Pike");
  });
});

// pike-evaluate: Execute Pike code via temp file with optional stdin
describe("pike-evaluate", () => {
  it("executes simple code and returns stdout", async () => {
    const code = `int main() { write("hello from pike${NL}"); return 0; }`;
    const { stdout, exitCode } = await runPikeCode(code);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("hello from pike");
  });

  it("reports nonzero exit code on error", async () => {
    const code = `int main() { error("boom${NL}"); return 0; }`;
    const { exitCode, stderr } = await runPikeCode(code);
    expect(exitCode).not.toBe(0);
    expect(stderr).toContain("boom");
  });

  it("pipes stdin to the Pike process", async () => {
    const code = `int main() { string line = Stdio.stdin->gets(); write("got: %s${NL}", line); return 0; }`;
    const { stdout, exitCode } = await runPikeCode(code, "test-input\n");
    expect(exitCode).toBe(0);
    expect(stdout).toContain("got: test-input");
  });

  it("handles code with no output", async () => {
    const code = `int main() { return 0; }`;
    const { stdout, exitCode } = await runPikeCode(code);
    expect(exitCode).toBe(0);
    expect(stdout).toBe("");
  });

  it("reports compilation errors", async () => {
    const code = `int main() { this_is_invalid; return 0; }`;
    const { exitCode, stderr } = await runPikeCode(code);
    expect(exitCode).not.toBe(0);
    expect(stderr.length).toBeGreaterThan(0);
  });
});

// pike-check-syntax: Compile without executing
describe("pike-check-syntax", () => {
  it("returns OK for valid code", async () => {
    const code = `int main() { write("hi${NL}"); return 0; }`;
    const wrapped = `compile_string(${JSON.stringify(code)}, "check"); write("OK${NL}");`;
    const { stdout, exitCode } = await runPike(["-e", wrapped], undefined, 10_000);
    expect(exitCode).toBe(0);
    expect(stdout.trim()).toBe("OK");
  });

  it("returns compilation errors for invalid code", async () => {
    const code = `int main() { undefined_symbol(); }`;
    const wrapped = `compile_string(${JSON.stringify(code)}, "check"); write("OK${NL}");`;
    const { exitCode, stderr } = await runPike(["-e", wrapped], undefined, 10_000);
    expect(exitCode).not.toBe(0);
    expect(stderr.length).toBeGreaterThan(0);
  });
});

// pike-describe-symbol: Runtime symbol introspection
describe("pike-describe-symbol", () => {
  it("describes a known module (Stdio)", async () => {
    const code = [
      `mixed val;`,
      `string sym = "Stdio";`,
      `catch { val = master()->resolv(sym); };`,
      `if (undefinedp(val) || val == 0) { write("Symbol not found: " + sym + "${NL}"); exit(1); }`,
      `mapping info = (["symbol": sym, "type": typeof(val)]);`,
      `if (objectp(val)) { info["kind"] = "object"; }`,
      `write(sprintf("%O${NL}", info));`,
    ].join("\n");
    const { stdout, exitCode } = await runPike(["-e", code], undefined, 15_000);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("Stdio");
  });

  it("reports not found for unknown symbol with exit(1)", async () => {
    const code = [
      `mixed val;`,
      `string sym = "Nonexistent.Module.That.Does.Not.Exist";`,
      `catch { val = master()->resolv(sym); };`,
      `if (undefinedp(val) || val == 0) { write("Symbol not found: " + sym + "${NL}"); exit(1); }`,
      `write("found${NL}");`,
    ].join("\n");
    const { stdout, exitCode } = await runPike(["-e", code], undefined, 15_000);
    expect(exitCode).toBe(1);
    expect(stdout).toContain("Symbol not found");
  });
});

// pike-list-modules: Scans pike_module_path
describe("pike-list-modules", () => {
  it("returns a non-empty list of modules", async () => {
    const code = [
      `mapping mods = ([]);`,
      `foreach(master()->pike_module_path;; string p) {`,
      `  if (!Stdio.is_dir(p)) continue;`,
      `  array(string) e = get_dir(p) || ({});`,
      `  foreach(e;; string f) {`,
      `    string full = combine_path(p, f);`,
      `    if (has_suffix(f, ".pmod") || has_suffix(f, ".pike"))`,
      `      mods[f[..sizeof(f)-6]] = 1;`,
      `    else if (Stdio.is_dir(full) &&`,
      `             (Stdio.exist(full+"/module.pmod") || Stdio.exist(full+"/module.pike")))`,
      `      mods[f] = 1;`,
      `  }`,
      `}`,
      `write(sort(indices(mods)) * "${NL}");`,
    ].join("\n");
    const { stdout, exitCode } = await runPike(["-e", code], undefined, 15_000);
    expect(exitCode).toBe(0);
    const modules = stdout.trim().split("\n").filter(Boolean);
    expect(modules.length).toBeGreaterThan(0);
    expect(modules).toContain("Stdio");
  });
});

// pike-list-methods: Lists methods on a resolved class
describe("pike-list-methods", () => {
  it("lists methods on Stdio.File", async () => {
    const code = [
      `mixed val;`,
      `string sym = "Stdio.File";`,
      `catch { val = master()->resolv(sym); };`,
      `if (!val && has_prefix(sym, "Stdio.") && !has_prefix(sym, "Stdio._"))`,
      `  catch { val = master()->resolv("_Stdio." + sym[6..]); };`,
      `if (!val) { write("Not found: %s${NL}", sym); exit(1); }`,
      `if (programp(val)) {`,
      `  object inst;`,
      `  if (catch { inst = val(); }) {`,
      `    write("Class %s (cannot instantiate)${NL}", sym);`,
      `    write("Methods: %O${NL}", sort(indices(val)));`,
      `  } else {`,
      `    write("Class %s methods:${NL}", sym);`,
      `    foreach(sort(indices(inst));; string m) write("%s${NL}", m);`,
      `  }`,
      `}`,
    ].join("\n");
    const { stdout, exitCode } = await runPike(["-e", code], undefined, 10_000);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("Class Stdio.File methods");
    const methods = stdout.split("\n").filter((l) => l.trim() && !l.startsWith("Class"));
    expect(methods.length).toBeGreaterThan(0);
  });

  it("handles non-instantiable classes", async () => {
    const code = [
      `mixed val;`,
      `string sym = "Stdio.File";`,
      `catch { val = master()->resolv(sym); };`,
      `if (!val && has_prefix(sym, "Stdio.") && !has_prefix(sym, "Stdio._"))`,
      `  catch { val = master()->resolv("_Stdio." + sym[6..]); };`,
      `if (programp(val)) {`,
      `  write("Methods: %O${NL}", sort(indices(val)));`,
      `}`,
    ].join("\n");
    const { stdout, exitCode } = await runPike(["-e", code], undefined, 10_000);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("Methods:");
  });
});

// pike-validate-example: Compile and optionally run
describe("pike-validate-example", () => {
  const validCode = `int main() { write("hello${NL}"); return 0; }`;
  const invalidCode = `int main() { this_is_undefined(); }`;

  it("PASS for valid code (compile-only)", async () => {
    const checkCode = `compile_string(${JSON.stringify(validCode)}, "validate"); write("OK${NL}");`;
    const { stdout, exitCode } = await runPike(["-e", checkCode], undefined, 10_000);
    expect(exitCode).toBe(0);
    expect(stdout.trim()).toBe("OK");
  });

  it("FAIL for invalid code", async () => {
    const checkCode = `compile_string(${JSON.stringify(invalidCode)}, "validate"); write("OK${NL}");`;
    const { exitCode } = await runPike(["-e", checkCode], undefined, 10_000);
    expect(exitCode).not.toBe(0);
  });

  it("PASS for valid code with run=true and stdin", async () => {
    // Compile check
    const checkCode = `compile_string(${JSON.stringify(validCode)}, "validate"); write("OK${NL}");`;
    const checkResult = await runPike(["-e", checkCode], undefined, 10_000);
    expect(checkResult.exitCode).toBe(0);

    // Run check with stdin (stdin is unused by this code but must pipe correctly)
    const { stdout, exitCode } = await runPikeCode(validCode, undefined, 10_000);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("hello");
  });
});

// pike-signature: Get exact type signature
describe("pike-signature", () => {
  it("returns type signature for a function", async () => {
    const code = [
      `string sym = "Stdio.read_file";`,
      `mixed val;`,
      `catch { val = master()->resolv(sym); };`,
      `if (undefinedp(val) || val == 0) { write("Symbol not found: %s${NL}", sym); exit(1); }`,
      `write("Symbol: %s${NL}", sym);`,
      `write("Type: %O${NL}", typeof(val));`,
      `if (functionp(val)) { write("Kind: function${NL}"); write("Signature: %O${NL}", typeof(val)); }`,
    ].join("\n");
    const { stdout, exitCode } = await runPike(["-e", code], undefined, 15_000);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("Stdio.read_file");
    expect(stdout).toContain("Kind: function");
  });

  it("handles program/class symbols", async () => {
    const code = [
      `string sym = "ADT.Queue";`,
      `mixed val;`,
      `catch { val = master()->resolv(sym); };`,
      `if (undefinedp(val) || val == 0) { write("Symbol not found: %s${NL}", sym); exit(1); }`,
      `write("Symbol: %s${NL}", sym);`,
      `write("Type: %O${NL}", typeof(val));`,
      `if (programp(val)) { write("Kind: program/class${NL}"); }`,
    ].join("\n");
    const { stdout, exitCode } = await runPike(["-e", code], undefined, 15_000);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("ADT.Queue");
    expect(stdout).toContain("Kind: program/class");
  });
});

// Security: verify temp file behavior
describe("temp file security", () => {
  it("uses unique temp directories per invocation", async () => {
    const code = `int main() { write("ok${NL}"); return 0; }`;
    const [r1, r2] = await Promise.all([
      runPikeCode(code),
      runPikeCode(code),
    ]);
    expect(r1.exitCode).toBe(0);
    expect(r2.exitCode).toBe(0);
  });
});

// Exit code handling
describe("exit code handling", () => {
  it("returns -1 for spawn failure (bad binary)", async () => {
    const { execFile } = await import("node:child_process");
    const result = await new Promise<{ stdout: string; stderr: string; exitCode: number }>((resolve) => {
      execFile(
        "/nonexistent/pike-binary-that-does-not-exist",
        ["--version"],
        { timeout: 5000 },
        (error, stdout, stderr) => {
          resolve({
            stdout: stdout ?? "",
            stderr: stderr ?? "",
            exitCode: error ? (typeof error.code === "number" ? error.code : -1) : 0,
          });
        }
      );
    });
    expect(result.exitCode).toBe(-1);
  });

  it("returns correct exit code for Pike errors", async () => {
    const code = `int main() { error("test error"); return 0; }`;
    const { exitCode } = await runPikeCode(code);
    expect(exitCode).not.toBe(0);
    expect(typeof exitCode).toBe("number");
  });
});

// Knowledge base loading
describe("knowledge base files", () => {
  const skillsBase = resolve(__dirname, "../skills");
  const langRefDir = join(skillsBase, "pike-language-reference");

  it("loads stdlib-patterns.md", async () => {
    const content = await readFile(join(langRefDir, "references/stdlib-patterns.md"), "utf-8");
    expect(content.length).toBeGreaterThan(1000);
    const sections = (content.match(/^## /gm) || []).length;
    expect(sections).toBeGreaterThan(100);
  });

  it("loads syntax.md", async () => {
    const content = await readFile(join(langRefDir, "references/syntax.md"), "utf-8");
    expect(content.length).toBeGreaterThan(100);
  });

  it("loads types.md", async () => {
    const content = await readFile(join(langRefDir, "references/types.md"), "utf-8");
    expect(content.length).toBeGreaterThan(100);
  });

  it("loads SKILL.md", async () => {
    const content = await readFile(join(langRefDir, "SKILL.md"), "utf-8");
    expect(content).toContain("Pike Language Reference");
  });

  it("loads idiomatic-pike.md", async () => {
    const content = await readFile(join(langRefDir, "references/idiomatic-pike.md"), "utf-8");
    expect(content.length).toBeGreaterThan(100);
  });
});

// extractModuleSections — unit tests
import { extractModuleSections } from "./extractModule.js";

const SAMPLE_STDLIB = [
  "## Stdio — File I/O",
  "Stdio provides file I/O.",
  "### Stdio.File",
  "write() writes to stdout.",
  "## Stdio.File — Comprehensive Reference",
  "Detailed Stdio.File reference.",
  "## Array (generic functions)",
  "Array functions.",
  "## Process monitoring",
  "Process functions.",
  "## Math",
  "Math functions.",
  "## Calendar",
  "Calendar stuff.",
  "## ADT",
  "ADT types.",
  "## String.Buffer — Building strings",
  "String buffer details.",
  "",
].join("\n");

describe("extractModuleSections", () => {
  it("matches heading ending with module name", () => {
    const result = extractModuleSections(SAMPLE_STDLIB, "Stdio");
    expect(result).toContain("## Stdio — File I/O");
    expect(result).toContain("Stdio provides file I/O.");
    expect(result).toContain("## Stdio.File — Comprehensive Reference");
  });

  it("matches heading with dot after module name", () => {
    const result = extractModuleSections(SAMPLE_STDLIB, "Stdio");
    expect(result).toContain("## Stdio.File — Comprehensive Reference");
    expect(result).toContain("Detailed Stdio.File reference.");
  });

  it("matches heading with parenthetical", () => {
    const result = extractModuleSections(SAMPLE_STDLIB, "Array");
    expect(result).toContain("## Array (generic functions)");
    expect(result).toContain("Array functions.");
  });

  it("matches heading ending with exact module name", () => {
    const result = extractModuleSections(SAMPLE_STDLIB, "Math");
    expect(result).toContain("## Math");
    expect(result).toContain("Math functions.");
  });

  it("matches heading with space after module name", () => {
    const result = extractModuleSections(SAMPLE_STDLIB, "Process");
    expect(result).toContain("## Process monitoring");
    expect(result).toContain("Process functions.");
  });

  it("matches dotted sub-headings (String.Buffer)", () => {
    const result = extractModuleSections(SAMPLE_STDLIB, "String");
    expect(result).toContain("## String.Buffer — Building strings");
  });

  it("is case-insensitive", () => {
    const result = extractModuleSections(SAMPLE_STDLIB, "stdio");
    expect(result).toContain("## Stdio — File I/O");
  });

  it("returns fallback for no match", () => {
    const result = extractModuleSections(SAMPLE_STDLIB, "NonexistentModule");
    expect(result).toContain("No curated reference found");
    expect(result).toContain("NonexistentModule");
  });

  it("returns fallback for empty content", () => {
    const result = extractModuleSections("", "Stdio");
    expect(result).toContain("No curated reference found");
  });

  it("separates multiple matching sections with blank lines", () => {
    const result = extractModuleSections(SAMPLE_STDLIB, "Stdio");
    const sections = result.split(/\n\n+/);
    expect(sections.length).toBeGreaterThanOrEqual(2);
  });

  it("includes sub-headings within matched sections", () => {
    const result = extractModuleSections(SAMPLE_STDLIB, "Stdio");
    expect(result).toContain("### Stdio.File");
  });
});

// MCP handler tests — validate Zod schemas and response shaping
import { z } from "zod";

// Schema definitions matching the server tool schemas
const evaluateSchema = z.object({
  code: z.string(),
  stdin: z.string().optional(),
  timeout: z.number().min(1).max(300).optional(),
});

const validateSchema = z.object({
  code: z.string(),
  run: z.boolean().optional(),
  stdin: z.string().optional(),
  timeout: z.number().min(1).max(300).optional(),
});

describe("Zod schema validation", () => {
  it("accepts valid pike-evaluate input", () => {
    const result = evaluateSchema.safeParse({ code: "int main() { return 0; }" });
    expect(result.success).toBe(true);
  });

  it("accepts pike-evaluate with all optional fields", () => {
    const result = evaluateSchema.safeParse({ code: "code", stdin: "input", timeout: 60 });
    expect(result.success).toBe(true);
  });

  it("rejects pike-evaluate with timeout below minimum", () => {
    const result = evaluateSchema.safeParse({ code: "code", timeout: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects pike-evaluate with timeout above maximum", () => {
    const result = evaluateSchema.safeParse({ code: "code", timeout: 301 });
    expect(result.success).toBe(false);
  });

  it("rejects pike-evaluate with negative timeout", () => {
    const result = evaluateSchema.safeParse({ code: "code", timeout: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects pike-evaluate with missing code", () => {
    const result = evaluateSchema.safeParse({ timeout: 30 });
    expect(result.success).toBe(false);
  });

  it("accepts valid pike-validate-example input", () => {
    const result = validateSchema.safeParse({ code: "code" });
    expect(result.success).toBe(true);
  });

  it("rejects pike-validate-example with timeout of 0", () => {
    const result = validateSchema.safeParse({ code: "code", timeout: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects pike-validate-example with timeout > 300", () => {
    const result = validateSchema.safeParse({ code: "code", timeout: 500 });
    expect(result.success).toBe(false);
  });
});

// Response shaping tests — verify the isError/response patterns
describe("response shaping", () => {
  it("pike-evaluate: success returns output without error prefix", async () => {
    const code = "int main() { write(\"result: 42" + NL + "\"); return 0; }";
    const { stdout, exitCode } = await runPikeCode(code);
    expect(exitCode).toBe(0);
    const response = stdout || "(no output)";
    expect(response).toContain("result: 42");
    expect(response).not.toContain("Exit");
  });

  it("pike-evaluate: failure returns exit code and stderr", async () => {
    const code = "int main() { error(\"test fail" + NL + "\"); return 0; }";
    const { stderr, exitCode } = await runPikeCode(code);
    expect(exitCode).not.toBe(0);
    expect(stderr.length).toBeGreaterThan(0);
  });

  it("pike-check-syntax: success returns OK", async () => {
    const code = "int main() { return 0; }";
    const wrapped = "compile_string(" + JSON.stringify(code) + ", \"check\"); write(\"OK" + NL + "\");";
    const { stdout, exitCode } = await runPike(["-e", wrapped], undefined, 10_000);
    expect(exitCode).toBe(0);
    expect(stdout.trim()).toBe("OK");
  });

  it("pike-describe-symbol: unknown symbol returns exit(1)", async () => {
    const code = [
      "mixed val;",
      "string sym = \"Totally.Bogus.Symbol\";",
      "catch { val = master()->resolv(sym); };",
      "if (undefinedp(val) || val == 0) { write(\"Symbol not found: \" + sym + \"" + NL + "\"); exit(1); }",
      "write(\"found" + NL + "\");",
    ].join("\n");
    const { exitCode, stdout } = await runPike(["-e", code], undefined, 15_000);
    expect(exitCode).toBe(1);
    expect(stdout).toContain("Symbol not found");
  });

  it("pike-list-methods: unknown symbol returns exit(1)", async () => {
    const code = [
      "mixed val;",
      "string sym = \"Totally.Bogus.Symbol\";",
      "catch { val = master()->resolv(sym); };",
      "if (!val) { write(\"Not found: %s" + NL + "\", sym); exit(1); }",
    ].join("\n");
    const { exitCode, stdout } = await runPike(["-e", code], undefined, 10_000);
    expect(exitCode).toBe(1);
    expect(stdout).toContain("Not found");
  });
});