import os from "node:os";
import path from "node:path";

/**
 * 解析用户主目录路径
 * @param segments - 相对于主目录的路径片段
 */
export function resolveHome(...segments: string[]): string {
  return path.join(os.homedir(), ...segments);
}

/**
 * 解析 Claude 配置目录路径
 * 优先使用环境变量 OPENCLAW_CLAUDE_HOME，否则使用默认路径 ~/.claude
 */
export function resolveClaudeHome(): string {
  return process.env.OPENCLAW_CLAUDE_HOME ?? path.join(os.homedir(), ".claude");
}

/**
 * 解析 Codex 配置目录路径
 * 优先使用环境变量 OPENCLAW_CODEX_HOME，否则使用默认路径 ~/.codex
 */
export function resolveCodexHome(): string {
  return process.env.OPENCLAW_CODEX_HOME ?? path.join(os.homedir(), ".codex");
}
