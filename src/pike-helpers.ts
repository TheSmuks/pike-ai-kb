import type { PikeResult } from "./runner.js";

// ── MCP Response Types ──────────────────────────────────────────────────────

export type MCPTextResponse = {
  content: [{ type: "text"; text: string }];
  isError?: boolean;
  [key: string]: unknown;
};

// ── Shared Pike Code Templates ──────────────────────────────────────────────

/**
 * Pike safe_typeof helper — returns a JSON-safe type string.
 * Pike's `typeof()` returns objects that cannot be JSON-encoded,
 * and `sprintf("%t")` misreports programs as "function" since programs
 * are callable. We check programp/objectp before functionp.
 *
 * Must be a top-level function (not nested inside main).
 */
const PIKE_SAFE_TYPEOF = `string _safe_typeof(mixed val) {
  if (undefinedp(val)) return "undefined";
  if (programp(val)) return "program";
  if (objectp(val)) return "object";
  if (functionp(val)) return "function";
  if (intp(val)) return "int";
  if (floatp(val)) return "float";
  if (stringp(val)) return "string";
  if (arrayp(val)) return "array";
  if (mappingp(val)) return "mapping";
  if (multisetp(val)) return "multiset";
  return "mixed";
}`;

/**
 * Returns the Pike preamble (for use inside main) that resolves a symbol via
 * master()->resolv(), including the _Stdio fallback for Stdio.* symbols.
 * All three introspection tools share this logic.
 */
export function pikeResolvePreamble(symExpr: string): string {
  return `mixed val;
string sym = ${symExpr};
catch { val = master()->resolv(sym); };
if (!val && has_prefix(sym, "Stdio.") && !has_prefix(sym, "Stdio._"))
  catch { val = master()->resolv("_Stdio." + sym[6..]); };
// C-level predef builtins (write, werror, arrayp, all_constants, etc.)
// are not found by master()->resolv() — fall back to all_constants().
if (!val) {
  mapping ac = all_constants();
  if (ac[sym]) val = ac[sym];
}
if (undefinedp(val) || val == 0) {
  write(Standards.JSON.encode((["error": "Symbol not found", "symbol": sym])));
  return 1;
}`;
}

// ── MCP Response Handler ────────────────────────────────────────────────────

/**
 * Generic MCP response handler for Pike execution results.
 * On success, returns stdout as text content.
 * On failure, returns stderr/stdout prefixed with the error prefix.
 */
export function pikeToolResponse(result: PikeResult, errorPrefix: string): MCPTextResponse {
  if (result.exitCode !== 0) {
    return {
      content: [{ type: "text", text: `${errorPrefix}: ${result.stderr || result.stdout}` }],
      isError: true,
    };
  }
  return { content: [{ type: "text", text: result.stdout.trim() }] };
}

// ── Pike Code Builders ──────────────────────────────────────────────────────

/**
 * Wraps Pike code in a proper file structure: top-level helpers + main().
 * For use with runPikeCode (temp file execution).
 */
function wrapInMain(body: string): string {
  return `${PIKE_SAFE_TYPEOF}

int main() {
${body}
}`;
}

/**
 * Build Pike code for pike-describe-symbol — returns JSON.
 */
export function buildDescribeSymbolCode(safeSym: string): string {
  return wrapInMain(`${pikeResolvePreamble(safeSym)}
  mapping info = (["symbol": sym, "type": _safe_typeof(val)]);
  if (programp(val)) { info["kind"] = "program/class"; info["methods"] = sort(indices(val)); }
  else if (objectp(val)) { info["kind"] = "object"; info["methods"] = sort(indices(val)); }
  else if (functionp(val)) { info["kind"] = "function"; }
  else { info["kind"] = "value"; info["value"] = sprintf("%O", val); }
  write(Standards.JSON.encode(info));
  return 0;`);
}

/**
 * Build Pike code for pike-list-methods — returns JSON.
 */
export function buildListMethodsCode(safeSym: string): string {
  return wrapInMain(`${pikeResolvePreamble(safeSym)}
  mapping result = (["symbol": sym, "type": _safe_typeof(val)]);
  if (programp(val)) {
    object inst;
    if (catch { inst = val(); }) {
      result["kind"] = "class";
      result["methods"] = sort(indices(val));
    } else {
      result["kind"] = "class";
      result["methods"] = sort(indices(inst));
    }
  } else if (objectp(val)) {
    result["kind"] = "object";
    result["methods"] = sort(indices(val));
  }
  write(Standards.JSON.encode(result));
  return 0;`);
}

/**
 * Build Pike code for pike-signature — returns JSON.
 */
export function buildSignatureCode(safeSym: string): string {
  return wrapInMain(`${pikeResolvePreamble(safeSym)}
  mapping result = (["symbol": sym, "type": _safe_typeof(val)]);
  if (programp(val)) {
    result["kind"] = "program/class";
    result["program_methods"] = sort(indices(val));
    object inst;
    if (!catch { inst = val(); }) {
      array methods = ({});
      foreach(sort(indices(inst));; string m) {
        mixed v = inst[m];
        if (functionp(v))
          methods += ({ (["name": m, "type": _safe_typeof(v)]) });
      }
      result["instance_methods"] = methods;
    }
  } else if (objectp(val)) {
    result["kind"] = "object";
    array members = ({});
    foreach(sort(indices(val));; string m) {
      mixed v;
      if (catch { v = val[m]; }) continue;
      if (functionp(v) || programp(v) || objectp(v))
        members += ({ (["name": m, "type": _safe_typeof(v)]) });
    }
    result["members"] = members;
  } else if (functionp(val)) {
    result["kind"] = "function";
    result["signature"] = sprintf("%O", typeof(val));
  }
  write(Standards.JSON.encode(result));
  return 0;`);
}

/**
 * Build Pike code for pike-list-modules — returns JSON.
 * Uses pike -e (top-level statements, no function wrapper needed).
 */
export function buildListModulesCode(): string {
  return `
mapping mods = ([]);
foreach(master()->pike_module_path;; string p) {
  if (!Stdio.is_dir(p)) continue;
  array(string) e = get_dir(p) || ({});
  foreach(e;; string f) {
    string full = combine_path(p, f);
    if (has_suffix(f, ".pmod") || has_suffix(f, ".pike"))
      mods[f[..sizeof(f)-6]] = 1;
    else if (Stdio.is_dir(full) &&
             (Stdio.exist(full+"/module.pmod") || Stdio.exist(full+"/module.pike")))
      mods[f] = 1;
  }
}
write(Standards.JSON.encode((["modules": sort(indices(mods))])));
`;
}
