#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { runPike, runPikeCode } from "./runner.js";
import { extractModuleSections } from "./extractModule.js";
import {
  pikeToolResponse,
  buildDescribeSymbolCode,
  buildListMethodsCode,
  buildSignatureCode,
  buildListModulesCode,
} from "./pike-helpers.js";
import { validateStartupContent } from "./validation.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { name: string; version: string };

const __dirname = dirname(fileURLToPath(import.meta.url));

// Skill directories
const SKILLS_BASE = resolve(__dirname, "../skills");
const LANG_REF_DIR = join(SKILLS_BASE, "pike-language-reference");
const STDLIB_API_DIR = join(SKILLS_BASE, "pike-stdlib-api");
const DEBUG_DIR = join(SKILLS_BASE, "pike-debugging");

// Symbol path validation: Pike identifiers are alphanumeric + underscore + dot
const SYMBOL_REGEX = /^[A-Za-z_][A-Za-z0-9_.]*$/;

function validateSymbol(symbol: string, paramName: string): string {
  if (!SYMBOL_REGEX.test(symbol)) {
    throw new Error(`Invalid ${paramName}: "${symbol}". Must match /^[A-Za-z_][A-Za-z0-9_.]*$/`);
  }
  return symbol;
}

// ── Data loading ────────────────────────────────────────────────────────────

const fileCache = new Map<string, string>();

async function loadFile(dir: string, name: string): Promise<string> {
  const key = `${dir}/${name}`;
  if (fileCache.has(key)) return fileCache.get(key)!;
  const content = await readFile(join(dir, name), "utf-8");
  fileCache.set(key, content);
  return content;
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
 * Wrapper: extract module sections from the stdlib reference file.
 */
async function getModuleSections(moduleName: string): Promise<string> {
  return extractModuleSections(await getStdlib(), moduleName);
}
// ── Server ──────────────────────────────────────────────────────────────────

const server = new McpServer(
  { name: pkg.name, version: pkg.version },
  {
    instructions: `Pike language MCP server with curated, runtime-verified knowledge base for AI code generation. Three skill layers: (1) pike-language-reference — syntax, types, stdlib patterns, idiomatic Pike guide; (2) pike-stdlib-api — exact function signatures for 30+ modules; (3) pike-debugging — error diagnosis, CLI introspection, runtime debugging. Provides tools to execute/inspect/validate Pike code. Introspection tools return structured JSON. All examples verified against Pike 8.0.1116.`,
  },
);

// ── Tools ───────────────────────────────────────────────────────────────────

server.tool(
  "pike-evaluate",
  "Execute Pike code and return output. Code is written to a temp file and executed.",
  {
    code: z
      .string()
      .describe(
        "Pike code to execute (should include int main() or be valid top-level statements)",
      ),
    stdin: z.string().optional().describe("Optional stdin for the Pike process"),
    timeout: z.number().min(1).max(300).optional().describe("Timeout in seconds (default 30)"),
  },
  async ({ code, stdin: codeStdin, timeout }) => {
    const { stdout, stderr, exitCode } = await runPikeCode(code, codeStdin, (timeout ?? 30) * 1000);
    const output = stdout || "(no output)";
    return {
      content: [
        {
          type: "text" as const,
          text: exitCode === 0 ? output : `Exit ${exitCode}\n${output}\n${stderr}`,
        },
      ],
      isError: exitCode !== 0,
    };
  },
);

server.tool(
  "pike-check-syntax",
  "Compile Pike code without executing. Uses compile_string which performs full compilation including constant evaluation. Returns compile errors if any.",
  { code: z.string().describe("Pike code to syntax-check") },
  async ({ code }) => {
    const wrapped = `int main() { compile_string(${JSON.stringify(code)}, "check"); write("OK\\n"); return 0; }`;
    const { stdout, stderr, exitCode } = await runPikeCode(wrapped, undefined, 10_000);
    if (exitCode === 0 && stdout.trim() === "OK") {
      return { content: [{ type: "text" as const, text: "Syntax OK" }] };
    }
    return {
      content: [{ type: "text" as const, text: stderr || stdout || "Compilation failed" }],
      isError: true,
    };
  },
);

server.tool(
  "pike-describe-symbol",
  "Look up a Pike module, class, or function at runtime. Returns structured JSON with type, kind, and members.",
  { symbol: z.string().describe("Pike symbol path (e.g. 'Stdio.File', 'Array.reduce')") },
  async ({ symbol }) => {
    validateSymbol(symbol, "symbol");
    const code = buildDescribeSymbolCode(JSON.stringify(symbol));
    const result = await runPikeCode(code, undefined, 15_000);
    return pikeToolResponse(result, "Symbol lookup failed");
  },
);

server.tool(
  "pike-list-modules",
  "List available Pike modules from the local Pike installation. Returns structured JSON.",
  {},
  async () => {
    const code = buildListModulesCode();
    const result = await runPike(["-e", code], undefined, 15_000);
    return pikeToolResponse(result, "Module listing failed");
  },
);

server.tool(
  "pike-list-methods",
  "List methods/indices in a Pike class or module. Returns structured JSON.",
  { symbol: z.string().describe("Pike class/module path (e.g. 'Stdio.File')") },
  async ({ symbol }) => {
    validateSymbol(symbol, "symbol");
    const code = buildListMethodsCode(JSON.stringify(symbol));
    const result = await runPikeCode(code, undefined, 10_000);
    return pikeToolResponse(result, "Method listing failed");
  },
);

server.tool(
  "pike-validate-example",
  "Validate a Pike code example by compiling and optionally running it. Returns PASS/FAIL.",
  {
    code: z.string().describe("Pike code to validate"),
    run: z.boolean().optional().describe("Also run the code (default: compile-only)"),
    stdin: z.string().optional().describe("Stdin for the Pike process (only when run=true)"),
    timeout: z.number().min(1).max(300).optional().describe("Timeout in seconds (default 10)"),
  },
  async ({ code, run, stdin: codeStdin, timeout }) => {
    const timeoutMs = (timeout ?? 10) * 1000;

    // First, syntax check via compile_string
    const checkCode = `compile_string(${JSON.stringify(code)}, "validate"); write("OK\\n");`;
    const checkResult = await runPike(["-e", checkCode], undefined, timeoutMs);
    if (checkResult.exitCode !== 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `FAIL: Compilation error\n${checkResult.stderr || checkResult.stdout}`,
          },
        ],
        isError: true,
      };
    }

    if (!run) {
      return { content: [{ type: "text" as const, text: "PASS: Compilation successful" }] };
    }

    // Run the code via temp file (pike - does not read stdin in 8.0.1116)
    const runResult = await runPikeCode(code, codeStdin, timeoutMs);
    if (runResult.exitCode !== 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `FAIL: Runtime error (exit ${runResult.exitCode})\n${runResult.stderr || runResult.stdout}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `PASS: Compilation and execution successful\nOutput:\n${runResult.stdout || "(no output)"}`,
        },
      ],
    };
  },
);

server.tool(
  "pike-signature",
  "Get the exact type signature of a Pike symbol. Returns structured JSON. More precise than pike-describe-symbol.",
  { symbol: z.string().describe("Pike symbol path (e.g. 'Stdio.read_file', 'Array.map')") },
  async ({ symbol }) => {
    validateSymbol(symbol, "symbol");
    const code = buildSignatureCode(JSON.stringify(symbol));
    const result = await runPikeCode(code, undefined, 15_000);
    return pikeToolResponse(result, "Signature lookup failed");
  },
);

// ── Resources ───────────────────────────────────────────────────────────────

// Module-specific resources: extract curated sections from stdlib-patterns.md
const documentedModules = [
  "Stdio",
  "Array",
  "String",
  "Math",
  "Process",
  "Thread",
  "Crypto",
  "Calendar",
  "Debug",
  "Locale",
  "Regexp",
  "Yabu",
  "ADT",
  "Concurrent",
  "Image",
  "MIME",
  "Parser",
  "SSL",
  "Standards",
  "Web",
  "System",
  "Sql",
  "Val",
  "Geography",
  "Gmp",
  "Error",
  "Protocols",
  "Function",
  "Program",
  "Tools",
];

for (const mod of documentedModules) {
  server.resource(
    `pike-ref-${mod.toLowerCase()}`,
    `pike://ref/${mod}`,
    {
      description: `Curated Pike ${mod} module reference (runtime-verified)`,
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [{ uri: uri.href, text: await getModuleSections(mod) }],
    }),
  );
}

// Full reference documents
server.resource(
  "pike-stdlib-reference",
  "pike://ref/stdlib",
  {
    description:
      "Complete Pike standard library reference (6500+ lines, 157 sections, runtime-verified)",
    mimeType: "text/markdown",
  },
  async (uri) => ({
    contents: [{ uri: uri.href, text: await getStdlib() }],
  }),
);

server.resource(
  "pike-syntax-reference",
  "pike://ref/syntax",
  {
    description: "Pike syntax reference (control flow, operators, declarations, preprocessor)",
    mimeType: "text/markdown",
  },
  async (uri) => ({
    contents: [{ uri: uri.href, text: await getSyntax() }],
  }),
);

server.resource(
  "pike-types-reference",
  "pike://ref/types",
  {
    description: "Pike type system reference (types, coercion, typeof, operators)",
    mimeType: "text/markdown",
  },
  async (uri) => ({
    contents: [{ uri: uri.href, text: await getTypes() }],
  }),
);

server.resource(
  "pike-skill",
  "pike://ref/skill",
  {
    description:
      "Pike language skill definition (key concepts, rules, gotchas for code generation)",
    mimeType: "text/markdown",
  },
  async (uri) => ({
    contents: [{ uri: uri.href, text: await getSkill() }],
  }),
);

// Idiomatic Pike guide
server.resource(
  "pike-idiomatic-guide",
  "pike://ref/idiomatic-pike",
  {
    description:
      "Idiomatic Pike patterns — autodoc, anti-patterns, data structures, naming conventions",
    mimeType: "text/markdown",
  },
  async (uri) => ({
    contents: [
      { uri: uri.href, text: await loadFile(LANG_REF_DIR, "references/idiomatic-pike.md") },
    ],
  }),
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
    }),
  );
}

// Debugging references
server.resource(
  "pike-debugging-cli",
  "pike://ref/debugging/cli",
  { description: "Pike CLI flags and runtime introspection guide", mimeType: "text/markdown" },
  async (uri) => ({
    contents: [
      { uri: uri.href, text: await loadFile(DEBUG_DIR, "references/cli-and-introspection.md") },
    ],
  }),
);

server.resource(
  "pike-debugging-errors",
  "pike://ref/debugging/errors",
  { description: "Pike error patterns taxonomy with fixes", mimeType: "text/markdown" },
  async (uri) => ({
    contents: [{ uri: uri.href, text: await loadFile(DEBUG_DIR, "references/error-patterns.md") }],
  }),
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
            '- Arrays: ({1, 2, 3}), Mappings: (["key": "val"]), Multisets: (< "a", "b" >)',
            "- Constructor: create(), Destructor: destroy()",
            "- Inheritance: inherit Parent; parent call: ::method()",
            "- Structural equality: equal(a, b), NOT a == b (identity)",
            "- Error handling: catch { ... }; throw(({msg, backtrace()}))",
            "- Foreach: foreach(arr; int i; mixed val) { }",
            "- Strings have value semantics — use String.Buffer for efficient building",
            "- Integer division rounds toward -inf: -8/3 == -3",
            "- switch falls through — use break",
            "- zero_type(m[key]) to distinguish missing key from 0 value",
          ].join("\n"),
        },
      },
    ],
  }),
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
  }),
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
  }),
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
            "- String value semantics: use String.Buffer for building",
            "- Proper error propagation: throw(({msg, backtrace()}))",
            "- Integer division: rounds toward -inf",
            "- zero_type() for missing mapping keys",
            "- Correct type annotations where applicable",
          ].join("\n"),
        },
      },
    ],
  }),
);

// ── Start ───────────────────────────────────────────────────────────────────

async function main() {
  const { exitCode, stdout } = await runPike(["--version"], undefined, 5000);
  if (exitCode !== 0) {
    console.error(`Warning: Pike binary not found. Set PIKE_BIN env var.`);
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

  // Validate content integrity at startup
  await validateStartupContent(SKILLS_BASE, documentedModules, stdlib);

  const transport = new StdioServerTransport();
  setupShutdown(transport);
  await server.connect(transport);
  console.error("pike-ai-kb MCP server running on stdio");
}

// Graceful shutdown on signals
function setupShutdown(transport: StdioServerTransport) {
  const shutdown = () => {
    transport.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
