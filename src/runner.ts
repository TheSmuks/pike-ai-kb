import { execFile } from "node:child_process";
import { writeFile, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

// Pike binary — localhost installation, override via env
const PIKE_BIN = process.env.PIKE_BIN || "pike";

export interface PikeResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  /** True if the process was killed due to timeout. */
  killed: boolean;
}

/**
 * Execute Pike with given args, optionally piping stdin.
 * Returns stdout, stderr, exitCode, and killed flag.
 */
export function runPike(args: string[], stdin?: string, timeout = 30_000): Promise<PikeResult> {
  return new Promise((resolve, reject) => {
    const proc = execFile(
      PIKE_BIN,
      args,
      { timeout, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        resolve({
          stdout: stdout ?? "",
          stderr: stderr ?? "",
          exitCode: error ? (typeof error.code === "number" ? error.code : -1) : 0,
          killed: error?.killed === true,
        });
      },
    );
    if (stdin && proc.stdin) {
      proc.stdin.on("error", (err) => {
        reject(new Error(`stdin pipe failed: ${err.message}`));
      });
      proc.stdin.write(stdin);
      proc.stdin.end();
    }
  });
}

/**
 * Run Pike code by writing to a temp file and executing it.
 * Pike 8.0.1116 does not support `pike -` for stdin — it treats `-` as a literal filename.
 */
export async function runPikeCode(
  code: string,
  stdin?: string,
  timeout = 30_000,
): Promise<PikeResult> {
  const tmpDir = await mkdtemp(join(tmpdir(), "pike-ai-kb-"));
  const tmpFile = join(tmpDir, "eval.pike");
  try {
    await writeFile(tmpFile, code, { encoding: "utf-8", mode: 0o600 });
    return await runPike([tmpFile], stdin, timeout);
  } finally {
    try {
      await rm(tmpDir, { recursive: true, force: true });
    } catch {
      // Cleanup failure must not mask the original result, but we log it.
      console.error(`Warning: failed to clean up temp directory ${tmpDir}`);
    }
  }
}
