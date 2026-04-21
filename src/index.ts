#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execFile } from "node:child_process";
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Skill directories
const SKILLS_BASE = resolve(__dirname, "../skills");
const LANG_REF_DIR = join(SKILLS_BASE, "pike-language-reference");
const STDLIB_API_DIR = join(SKILLS_BASE, "pike-stdlib-api");
const DEBUG_DIR = join(SKILLS_BASE, "pike-debugging");

// Pike binary — localhost installation, override via env
const PIKE_BIN = process.env.PIKE_BIN || "pike";

// ── Data loading ────────────────────────────────────────────────────────────

const fileCache = new Map<string, string>();

async function loadFile(dir: string, name: string): Promise<string> {
  const key = `${dir}/${name}`;
  if (fileCache.has(key)) return fileCache.get(key)!;
  try {
    const content = await readFile(join(dir, name), "utf-8");
    fileCache.set(key, content);
    return content;
  } catch {
    return `File "${name}" not found in ${dir}.`;
  }
}

async function getStdlib(): Promise<string> {
  return loadFile(LANG_REF_DIR, "references/stdlib-patterns.md");
}

async function getSyntax(): Promise<string> {
  return loadFile(LANG_REF_DIR, "references/syntax.md");
}

async function getTypes(): Promise<string> {
  return loadFile(LANG_REF_DIR, "references/types.md");
}

async function getSkill(): Promise<string> {
  return loadFile(LANG_REF_DIR, "SKILL.md");
}

/**
 * Extract sections from stdlib-patterns.md that mention a module.
 * Returns all ##-level sections whose heading contains the module name.
 */
async function extractModuleSections(moduleName: string): Promise<string> {
  const content = await getStdlib();
  const lines = content.split("\n");
  const results: string[] = [];
  let inMatch = false;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (inMatch) results.push(""); // blank line between sections
      inMatch = line.toLowerCase().includes(moduleName.toLowerCase() + " ")
        || line.toLowerCase().includes(moduleName.toLowerCase() + " —")
        || line.toLowerCase().includes(moduleName.toLowerCase() + "(")
        || line.toLowerCase().endsWith(moduleName.toLowerCase());
      if (inMatch) results.push(line);
    } else if (inMatch) {
      results.push(line);
    }
  }

  return results.join("\n").trim()
    || `No curated reference found for ${moduleName}. Use pike-describe-symbol for runtime introspection.`;
}

// ── Pike execution ──────────────────────────────────────────────────────────

let tmpCounter = 0;

function runPike(
  args: string[],
  stdin?: string,
  timeout = 30_000
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const proc = execFile(
      PIKE_BIN,
      args,
      { timeout, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        resolve({
          stdout: stdout ?? "",
          stderr: stderr ?? "",
          exitCode: error && "code" in error ? (error.code as number) : 0,
        });
      }
    );
    if (stdin && proc.stdin) {
      proc.stdin.write(stdin);
      proc.stdin.end();
    }
  });
}

// Run Pike code by writing to a temp file and executing it.
// Pike 8.0.1116 does not support `pike -` for stdin — it treats `-` as a literal filename.
async function runPikeCode(
  code: string,
  stdin?: string,
  timeout = 30_000
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const tmpDir = join(tmpdir(), "pike-ai-kb");
  await mkdir(tmpDir, { recursive: true });
  const tmpFile = join(tmpDir, `eval-${process.pid}-${++tmpCounter}.pike`);
  await writeFile(tmpFile, code, "utf-8");
  try {
    return await runPike([tmpFile], stdin, timeout);
  } finally {
    await rm(tmpFile, { force: true });
  }
}

// ── Server ──────────────────────────────────────────────────────────────────

const server = new McpServer(
  { name: "pike-ai-kb", version: "3.0.0" },
  {
    instructions: `Pike language MCP server with curated, runtime-verified knowledge base for AI code generation. Three skill layers: (1) pike-language-reference — syntax, types, stdlib patterns, idiomatic Pike guide; (2) pike-stdlib-api — exact function signatures for 30+ modules; (3) pike-debugging — error diagnosis, CLI introspection, runtime debugging. Provides tools to execute/inspect/validate Pike code. All examples verified against Pike 8.0.1116.`,
  }
);

// ── Tools ───────────────────────────────────────────────────────────────────

server.tool(
  "pike-evaluate",
  "Execute Pike code and return output. Code is written to a temp file and executed.",
  {
    code: z.string().describe("Pike code to execute (should include int main() or be valid top-level statements)"),
    stdin: z.string().optional().describe("Optional stdin for the Pike process"),
    timeout: z.number().optional().describe("Timeout in seconds (default 30)"),
  },
  async ({ code, stdin: codeStdin, timeout }) => {
    const { stdout, stderr, exitCode } = await runPikeCode(
      codeStdin ? code + "\n" + codeStdin : code,
      undefined,
      (timeout ?? 30) * 1000
    );
    const output = stdout || "(no output)";
    return {
      content: [{ type: "text" as const, text: exitCode === 0 ? output : `Exit ${exitCode}\n${output}\n${stderr}` }],
      isError: exitCode !== 0,
    };
  }
);

server.tool(
  "pike-check-syntax",
  "Compile Pike code without executing. Uses compile_string which performs full compilation including constant evaluation. Returns compile errors if any.",
  { code: z.string().describe("Pike code to syntax-check") },
  async ({ code }) => {
    const wrapped = `compile_string(${JSON.stringify(code)}, "check"); write("OK\\n");`;
    const { stdout, stderr, exitCode } = await runPike(["-e", wrapped], undefined, 10_000);
    if (exitCode === 0 && stdout.trim() === "OK") {
      return { content: [{ type: "text" as const, text: "Syntax OK" }] };
    }
    return {
      content: [{ type: "text" as const, text: stderr || stdout || "Compilation failed" }],
      isError: true,
    };
  }
);

server.tool(
  "pike-describe-symbol",
  "Look up a Pike module, class, or function at runtime. Returns type signature and members.",
  { symbol: z.string().describe("Pike symbol path (e.g. 'Stdio.File', 'Array.reduce')") },
  async ({ symbol }) => {
    const safeSym = JSON.stringify(symbol);
    const code = `
string sym = ${safeSym};
mixed val;
catch { val = master()->resolv(sym); };
if (!val && has_prefix(sym, "Stdio.") && !has_prefix(sym, "Stdio._"))
  catch { val = master()->resolv("_Stdio." + sym[6..]); };
if (undefinedp(val) || val == 0) { write("Symbol not found: " + sym + "\\n"); exit(0); }
mapping info = (["symbol": sym, "type": typeof(val)]);
if (programp(val)) { info["kind"] = "program/class"; info["methods"] = sort(indices(val)); }
else if (objectp(val)) { info["kind"] = "object"; info["methods"] = sort(indices(val)); }
else if (functionp(val)) { info["kind"] = "function"; }
else { info["kind"] = "value"; info["value"] = sprintf("%O", val); }
info["string_rep"] = sprintf("%O", val);
write(sprintf("%O\\n", info));
`;
    const { stdout, stderr, exitCode } = await runPike(["-e", code], undefined, 15_000);
    if (exitCode !== 0) {
      return { content: [{ type: "text" as const, text: `Failed: ${stderr || stdout}` }], isError: true };
    }
    return { content: [{ type: "text" as const, text: stdout.trim() }] };
  }
);

server.tool(
  "pike-list-modules",
  "List available Pike modules from the local Pike installation.",
  {},
  async () => {
    const code = `
mapping mods = ([]);
void scan(string dir) {
  array(string) e = get_dir(dir) || ({});
  foreach(e;; string f) {
    string full = combine_path(dir, f);
    if (has_suffix(f, ".pmod") || has_suffix(f, ".pike"))
      mods[has_suffix(f, ".pmod") ? f[..sizeof(f)-6] : f[..sizeof(f)-6]] = 1;
    else if (Stdio.is_dir(full) &&
             (Stdio.exist(full+"/module.pmod") || Stdio.exist(full+"/module.pike")))
      mods[f] = 1;
  }
}
foreach(master()->pike_module_path;; string p) if (Stdio.is_dir(p)) scan(p);
write(sort(indices(mods)) * "\\n");
`;
    const { stdout, stderr, exitCode } = await runPike(["-e", code], undefined, 15_000);
    if (exitCode !== 0) {
      return { content: [{ type: "text" as const, text: `Failed: ${stderr}` }], isError: true };
    }
    return { content: [{ type: "text" as const, text: stdout.trim() }] };
  }
);

server.tool(
  "pike-list-methods",
  "List methods/indices in a Pike class or module.",
  { symbol: z.string().describe("Pike class/module path (e.g. 'Stdio.File')") },
  async ({ symbol }) => {
    const safeSym = JSON.stringify(symbol);
    const code = `
mixed val;
string sym = ${safeSym};
catch { val = master()->resolv(sym); };
if (!val && has_prefix(sym, "Stdio.") && !has_prefix(sym, "Stdio._"))
  catch { val = master()->resolv("_Stdio." + sym[6..]); };
if (!val) { write("Not found: %s\\n", sym); exit(1); }
if (programp(val)) {
  object inst;
  if (catch { inst = val(); }) {
    write("Class %s (cannot instantiate)\\n", sym);
    write("Methods: %O\\n", sort(indices(val)));
  } else {
    write("Class %s methods:\\n", sym);
    sort(indices(inst))->write("%s\\n");
  }
} else if (objectp(val)) {
  write("Object %s members:\\n", sym);
  sort(indices(val))->write("%s\\n");
}
`;
    const { stdout, stderr, exitCode } = await runPike(["-e", code], undefined, 10_000);
    if (exitCode !== 0 && !stdout.trim()) {
      return { content: [{ type: "text" as const, text: `Failed: ${stderr}` }], isError: true };
    }
    return { content: [{ type: "text" as const, text: stdout.trim() || stderr.trim() }] };
  }
);

server.tool(
  "pike-validate-example",
  "Validate a Pike code example by compiling and optionally running it. Returns PASS/FAIL.",
  {
    code: z.string().describe("Pike code to validate"),
    run: z.boolean().optional().describe("Also run the code (default: compile-only)"),
    stdin: z.string().optional().describe("Stdin for the Pike process (only when run=true)"),
    timeout: z.number().optional().describe("Timeout in seconds (default 10)"),
  },
  async ({ code, run, stdin: codeStdin, timeout }) => {
    const timeoutMs = (timeout ?? 10) * 1000;

    // First, syntax check via compile_string
    const checkCode = `compile_string(${JSON.stringify(code)}, "validate"); write("OK\\n");`;
    const checkResult = await runPike(["-e", checkCode], undefined, timeoutMs);
    if (checkResult.exitCode !== 0) {
      return {
        content: [{ type: "text" as const, text: `FAIL: Compilation error\n${checkResult.stderr || checkResult.stdout}` }],
        isError: true,
      };
    }

    if (!run) {
      return { content: [{ type: "text" as const, text: "PASS: Compilation successful" }] };
    }

    // Run the code via temp file (pike - does not read stdin in 8.0.1116)
    const runResult = await runPikeCode(codeStdin ? code + "\n" + codeStdin : code, undefined, timeoutMs);
    if (runResult.exitCode !== 0) {
      return {
        content: [{ type: "text" as const, text: `FAIL: Runtime error (exit ${runResult.exitCode})\n${runResult.stderr || runResult.stdout}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text" as const, text: `PASS: Compilation and execution successful\nOutput:\n${runResult.stdout || "(no output)"}` }],
    };
  }
);

server.tool(
  "pike-signature",
  "Get the exact type signature of a Pike symbol. More precise than pike-describe-symbol.",
  { symbol: z.string().describe("Pike symbol path (e.g. 'Stdio.read_file', 'Array.map')") },
  async ({ symbol }) => {
    const safeSym = JSON.stringify(symbol);
    const code = `
string sym = ${safeSym};
mixed val;
catch { val = master()->resolv(sym); };
if (!val && has_prefix(sym, "Stdio.") && !has_prefix(sym, "Stdio._"))
  catch { val = master()->resolv("_Stdio." + sym[6..]); };
if (undefinedp(val) || val == 0) { write("Symbol not found: %s\\n", sym); exit(1); }
write("Symbol: %s\\n", sym);
write("Type: %O\\n", typeof(val));
write("Value: %O\\n", val);
if (programp(val)) {
  write("Kind: program/class\\n");
  object inst;
  if (!catch { inst = val(); }) {
    write("Instance methods:\\n");
    foreach(sort(indices(inst));; string m) {
      mixed v = inst[m];
      if (functionp(v))
        write("  %s: %O\\n", m, typeof(v));
    }
  }
} else if (objectp(val)) {
  write("Kind: module/object\\n");
  write("Members:\\n");
  foreach(sort(indices(val));; string m) {
    mixed v;
    if (catch { v = val[m]; }) continue;
    if (functionp(v) || programp(v) || objectp(v))
      write("  %s: %O\\n", m, typeof(v));
  }
} else if (functionp(val)) {
  write("Kind: function\\n");
  write("Signature: %O\\n", typeof(val));
}
`;
    const { stdout, stderr, exitCode } = await runPike(["-e", code], undefined, 15_000);
    if (exitCode !== 0) {
      return { content: [{ type: "text" as const, text: `Failed: ${stderr || stdout}` }], isError: true };
    }
    return { content: [{ type: "text" as const, text: stdout.trim() }] };
  }
);

// ── Resources ───────────────────────────────────────────────────────────────

// Module-specific resources: extract curated sections from stdlib-patterns.md
const documentedModules = [
  "Stdio", "Array", "String", "Math", "Process", "Thread", "Crypto",
  "Calendar", "Debug", "Locale", "Regexp", "Yabu", "ADT", "Concurrent",
  "Image", "MIME", "Parser", "SSL", "Standards", "Web", "System",
  "Sql", "Val", "Geography", "Gmp", "Error", "Protocols",
  "Function", "Program", "Tools",
];

for (const mod of documentedModules) {
  server.resource(
    `pike-ref-${mod.toLowerCase()}`,
    `pike://ref/${mod}`,
    { description: `Curated Pike ${mod} module reference (runtime-verified)`, mimeType: "text/markdown" },
    async (uri) => ({
      contents: [{ uri: uri.href, text: await extractModuleSections(mod) }],
    })
  );
}

// Full reference documents
server.resource(
  "pike-stdlib-reference",
  "pike://ref/stdlib",
  { description: "Complete Pike standard library reference (6500+ lines, 157 sections, runtime-verified)", mimeType: "text/markdown" },
  async (uri) => ({
    contents: [{ uri: uri.href, text: await getStdlib() }],
  })
);

server.resource(
  "pike-syntax-reference",
  "pike://ref/syntax",
  { description: "Pike syntax reference (control flow, operators, declarations, preprocessor)", mimeType: "text/markdown" },
  async (uri) => ({
    contents: [{ uri: uri.href, text: await getSyntax() }],
  })
);

server.resource(
  "pike-types-reference",
  "pike://ref/types",
  { description: "Pike type system reference (types, coercion, typeof, operators)", mimeType: "text/markdown" },
  async (uri) => ({
    contents: [{ uri: uri.href, text: await getTypes() }],
  })
);

server.resource(
  "pike-skill",
  "pike://ref/skill",
  { description: "Pike language skill definition (key concepts, rules, gotchas for code generation)", mimeType: "text/markdown" },
  async (uri) => ({
    contents: [{ uri: uri.href, text: await getSkill() }],
  })
);

// Idiomatic Pike guide
server.resource(
  "pike-idiomatic-guide",
  "pike://ref/idiomatic-pike",
  { description: "Idiomatic Pike patterns — autodoc, anti-patterns, data structures, naming conventions", mimeType: "text/markdown" },
  async (uri) => ({
    contents: [{ uri: uri.href, text: await loadFile(LANG_REF_DIR, "references/idiomatic-pike.md") }],
  })
);

// Stdlib API references
const apiModules = [
  { name: "stdio", file: "references/stdio-api.md" },
  { name: "adt", file: "references/adt-api.md" },
  { name: "concurrent", file: "references/concurrent-api.md" },
  { name: "crypto", file: "references/crypto-api.md" },
  { name: "protocols", file: "references/protocols-api.md" },
  { name: "standards", file: "references/standards-api.md" },
  { name: "utilities", file: "references/utilities-api.md" },
];

for (const mod of apiModules) {
  server.resource(
    `pike-api-${mod.name}`,
    `pike://ref/api/${mod.name}`,
    { description: `Pike ${mod.name} API reference`, mimeType: "text/markdown" },
    async (uri) => ({
      contents: [{ uri: uri.href, text: await loadFile(STDLIB_API_DIR, mod.file) }],
    })
  );
}

// Debugging references
server.resource(
  "pike-debugging-cli",
  "pike://ref/debugging/cli",
  { description: "Pike CLI flags and runtime introspection guide", mimeType: "text/markdown" },
  async (uri) => ({
    contents: [{ uri: uri.href, text: await loadFile(DEBUG_DIR, "references/cli-and-introspection.md") }],
  })
);

server.resource(
  "pike-debugging-errors",
  "pike://ref/debugging/errors",
  { description: "Pike error patterns taxonomy with fixes", mimeType: "text/markdown" },
  async (uri) => ({
    contents: [{ uri: uri.href, text: await loadFile(DEBUG_DIR, "references/error-patterns.md") }],
  })
);

// ── Prompts ─────────────────────────────────────────────────────────────────

server.prompt(
  "write-pike",
  "Write Pike code with KB assistance",
  {
    task: z.string().describe("What the code should do"),
    context: z.string().optional().describe("Additional context or constraints"),
  },
  ({ task, context }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: [
            `Write Pike code to: ${task}`,
            context ? `\nContext: ${context}` : "",
            "\n\nKey Pike conventions:",
            "- Arrays: ({1, 2, 3}), Mappings: ([\"key\": \"val\"]), Multisets: (< \"a\", \"b\" >)",
            "- Constructor: create(), Destructor: destroy()",
            "- Inheritance: inherit Parent; parent call: ::method()",
            "- Structural equality: equal(a, b), NOT a == b (identity)",
            "- Error handling: catch { ... }; throw(({msg, backtrace()}))",
            "- Foreach: foreach(arr; int i; mixed val) { }",
            "- Strings are immutable — use String.Buffer for building",
            "- Integer division rounds toward -inf: -8/3 == -3",
            "- switch falls through — use break",
            "- zero_type(m[key]) to distinguish missing key from 0 value",
          ].join("\n"),
        },
      },
    ],
  })
);

server.prompt(
  "translate-to-pike",
  "Translate code to Pike",
  {
    code: z.string().describe("Source code"),
    language: z.string().describe("Source language (python, javascript, c, java, etc.)"),
  },
  ({ code, language }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Translate this ${language} code to idiomatic Pike:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nUse Pike conventions: ({}) for arrays, ([]) for mappings, (<>) for multisets, create() for constructors, inherit for classes, equal() for structural comparison, catch {} for errors, String.Buffer for string building.`,
        },
      },
    ],
  })
);

server.prompt(
  "explain-pike",
  "Explain Pike code",
  { code: z.string().describe("Pike code to explain") },
  ({ code }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Explain this Pike code:\n\n\`\`\`pike\n${code}\n\`\`\`\n\nCover what each part does, Pike-specific idioms, and potential gotchas.`,
        },
      },
    ],
  })
);

server.prompt(
  "review-pike",
  "Review Pike code for correctness",
  { code: z.string().describe("Pike code to review") },
  ({ code }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: [
            "Review this Pike code for correctness and idiomatic usage:",
            "```pike",
            code,
            "```",
            "",
            "Check for:",
            "- Correct literal syntax: ({...}), ([...]), (<...>)",
            "- create() constructor (not __init__)",
            "- catch {} for errors (not try/catch)",
            "- equal() for structural comparison (not == on arrays/mappings)",
            "- Reference semantics: arrays/mappings/objects are shared",
            "- String immutability: use String.Buffer for building",
            "- Proper error propagation: throw(({msg, backtrace()}))",
            "- Integer division: rounds toward -inf",
            "- zero_type() for missing mapping keys",
            "- Correct type annotations where applicable",
          ].join("\n"),
        },
      },
    ],
  })
);

// ── Start ───────────────────────────────────────────────────────────────────

async function main() {
  const { exitCode, stdout } = await runPike(["--version"], undefined, 5000);
  if (exitCode !== 0) {
    console.error(`Warning: Pike binary "${PIKE_BIN}" not found. Set PIKE_BIN env var.`);
  } else {
    console.error(`Pike found: ${stdout.trim()}`);
  }

  // Verify language-reference skill
  const stdlib = await getStdlib();
  const sections = (stdlib.match(/^## /gm) || []).length;
  console.error(`Knowledge base loaded: ${sections} sections, ${stdlib.split("\n").length} lines`);

  // Verify stdlib-api skill
  try {
    const apiSkill = await readFile(join(STDLIB_API_DIR, "SKILL.md"), "utf-8");
    console.error(`Stdlib API skill loaded: ${apiSkill.split("\n").length} lines`);
  } catch {
    console.error(`Warning: Stdlib API skill not found at ${STDLIB_API_DIR}`);
  }

  // Verify debugging skill
  try {
    const debugSkill = await readFile(join(DEBUG_DIR, "SKILL.md"), "utf-8");
    console.error(`Debugging skill loaded: ${debugSkill.split("\n").length} lines`);
  } catch {
    console.error(`Warning: Debugging skill not found at ${DEBUG_DIR}`);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("pike-ai-kb MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
