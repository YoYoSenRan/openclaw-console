import fs from "node:fs";

/**
 * 支持的平台类型
 */
export type Platform = "docker" | "windows" | "macos" | "linux";

/**
 * 检测当前是否运行在 Docker 容器中
 * 通过检查 /.dockerenv 文件是否存在来判断
 */
function isDocker(): boolean {
  try {
    return fs.existsSync("/.dockerenv");
  } catch {
    return false;
  }
}

/**
 * 检测当前代码运行的平台
 * 检测优先级：Docker > Windows > macOS > Linux
 */
export function detectPlatform(): Platform {
  if (isDocker()) return "docker";
  switch (process.platform) {
    case "win32":
      return "windows";
    case "darwin":
      return "macos";
    default:
      return "linux";
  }
}
