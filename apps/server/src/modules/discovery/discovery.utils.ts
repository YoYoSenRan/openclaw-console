import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export function isDocker(): boolean {
  try {
    return fs.existsSync("/.dockerenv");
  } catch {
    return false;
  }
}

export function resolveHome(...segments: string[]): string {
  return path.join(os.homedir(), ...segments);
}

export function resolveClaudeHome(): string {
  return process.env.OPENCLAW_CLAUDE_HOME ?? path.join(os.homedir(), ".claude");
}

export function resolveCodexHome(): string {
  return process.env.OPENCLAW_CODEX_HOME ?? path.join(os.homedir(), ".codex");
}
