import { Injectable } from "@nestjs/common";
import fs from "node:fs";
import path from "node:path";
import { detectPlatform } from "../../../utils/platform";
import { resolveHome } from "../../../utils/path";

@Injectable()
export class OpenclawService {
  /**
   * 配置文件路径
   * 优先级：OPENCLAW_CONFIG_PATH > OPENCLAW_STATE_DIR > ~/.openclaw/openclaw.json
   */
  private filePath(): string {
    if (process.env.OPENCLAW_CONFIG_PATH) {
      return process.env.OPENCLAW_CONFIG_PATH;
    }
    if (process.env.OPENCLAW_STATE_DIR) {
      return path.join(process.env.OPENCLAW_STATE_DIR, "openclaw.json");
    }
    return resolveHome(".openclaw", "openclaw.json");
  }

  /** 检查配置文件是否可读 */
  available(): boolean {
    if (detectPlatform() === "docker") return false;
    return fs.existsSync(this.filePath());
  }

  /** 读取完整的 openclaw.json 配置 */
  config(): Record<string, unknown> | null {
    if (!this.available()) return null;
    const raw = fs.readFileSync(this.filePath(), "utf-8");
    return JSON.parse(raw) as Record<string, unknown>;
  }

  /** 通用 dot-path 取值，如 get("gateway.url")、get("agents.list") */
  get<T = unknown>(paths: string): T | null {
    const config = this.config();
    if (!config) return null;

    let current: unknown = config;
    for (const key of paths.split(".")) {
      if (current === null || typeof current !== "object") return null;
      current = (current as Record<string, unknown>)[key];
    }
    return (current ?? null) as T | null;
  }

  // ---- 快捷访问 ----

  /** 获取 agents 配置 */
  agents(): Record<string, unknown> | null {
    return this.get<Record<string, unknown>>("agents");
  }

  /** 获取 gateway 配置 */
  gateway(): Record<string, unknown> | null {
    return this.get<Record<string, unknown>>("gateway");
  }
}
