#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = resolve(__dirname, "../skills/pike-language-reference");

// Pike binary — localhost installation, override via env
const PIKE_BIN = process.env.PIKE_BIN || "pike";

// ── Data loading ────────────────────────────────────────────────────────────

let stdlibCache: string | null = null;
let syntaxCache: string | null = null;
let typesCache: string | null = null;
let skillCache: string | null = null;

async function loadFile(name: string): Promise<string> {
  try {
    return await readFile(join(SKILLS_DIR, name), "utf-8");
  } catch {
    return `File "${name}" not found in ${SKILLS_DIR}.`;
  }
}

async function getStdlib(): Promise<string> {
  if (!stdlibCache) stdlibCache = await loadFile("references/stdlib-patterns.md");
  return stdlibCache;
}

async function getSyntax(): Promise<string> {
  if (!syntaxCache) syntaxCache = await loadFile("references/syntax.md");
  return syntaxCache;
}

async function getTypes(): Promise<string> {
  if (!typesCache) typesCache = await loadFile("references/types.md");
  return typesCache;
}

async function getSkill(): Promise<string> {
  if (!skillCache) skillCache = await loadFile("SKILL.md");
  return skillCache;
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
  let currentHeading = "";

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (inMatch) results.push(""); // blank line between sections
      inMatch = line.toLowerCase().includes(moduleName.toLowerCase() + " ")
        || line.toLowerCase().includes(moduleName.toLowerCase() + " —")
        || line.toLowerCase().includes(moduleName.toLowerCase() + "(")
        || line.toLowerCase().endsWith(moduleName.toLowerCase());
      currentHeading = line;
      if (inMatch) results.push(line);
    } else if (inMatch) {
      // Stop at next ## that doesn't match
      results.push(line);
    }
  }

  return results.join("\n").trim() || `No curated reference found for ${moduleName}. Use pike-describe-symbol for runtime introspection.`;
}

// ── Pike execution ──────────────────────────────────────────────────────────

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

// ── Server ──────────────────────────────────────────────────────────────────

const server = new McpServer(
  { name: "pike-ai-kb", version: "2.0.0" },
  {
    instructions: `Pike language MCP server with curated, runtime-verified knowledge base for AI code generation. Provides tools to execute/inspect Pike code, and resources with comprehensive module documentation covering 130+ modules, syntax, type system, and common patterns. All examples have been verified against Pike 8.0.1116.`,
  }
);

// ── Tools ───────────────────────────────────────────────────────────────────

server.tool(
  "pike-evaluate",
  "Execute Pike code and return output. Code is piped via stdin.",
  {
    code: z.string().describe("Pike code to execute"),
    stdin: z.string().optional().describe("Optional stdin for the Pike process"),
    timeout: z.number().optional().describe("Timeout in seconds (default 30)"),
  },
  async ({ code, stdin: codeStdin, timeout }) => {
    const { stdout, stderr, exitCode } = await runPike(
      ["-"],
      codeStdin ? code + "\n" + codeStdin : code,
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
  "Compile Pike code without executing. Returns compile errors if any.",
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
    if (has_suffix(f, ".pmod") || has_suffix(f, ".pike"))
      mods[has_suffix(f, ".pmod") ? f[..sizeof(f)-6] : f[..sizeof(f)-6]] = 1;
    else if (Stdio.is_dir(dir+"/"+f) &&
             (Stdio.exist(dir+"/"+f+"/module.pmod") || Stdio.exist(dir+"/"+f+"/module.pike")))
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
catch { val = master()->resolv(${safeSym}); };
if (!val) { write("Not found: " + ${safeSym} + "\\n"); exit(1); }
string kind = programp(val) ? "Class" : "Object";
write(kind + " " + ${safeSym} + " members:\\n");
sort(indices(val))->write("%s\\n");
`;
    const { stdout, stderr, exitCode } = await runPike(["-e", code], undefined, 10_000);
    if (exitCode !== 0 && !stdout.trim()) {
      return { content: [{ type: "text" as const, text: `Failed: ${stderr}` }], isError: true };
    }
    return { content: [{ type: "text" as const, text: stdout.trim() || stderr.trim() }] };
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

  // Verify data files
  const stdlib = await getStdlib();
  const sections = (stdlib.match(/^## /gm) || []).length;
  console.error(`Knowledge base loaded: ${sections} sections, ${stdlib.split("\n").length} lines`);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("pike-ai-kb MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
