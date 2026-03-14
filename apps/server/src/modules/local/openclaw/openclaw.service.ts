import type { DiscoverOpenClawResult } from "@openclaw/shared";

import { Injectable } from "@nestjs/common";
import fs from "node:fs";
import path from "node:path";
import { detectPlatform } from "../../../utils/platform";
import { resolveHome } from "../../../utils/path";

/**
 * Openclaw 本地配置发现服务
 * 负责扫描本地 Openclaw 配置文件
 */
@Injectable()
export class OpenclawService {
  /**
   * 解析配置文件路径
   * 优先级：OPENCLAW_CONFIG_PATH > OPENCLAW_STATE_DIR > ~/.openclaw/openclaw.json
   */
  private resolveConfigPath(): string {
    if (process.env.OPENCLAW_CONFIG_PATH) {
      return process.env.OPENCLAW_CONFIG_PATH;
    }
    if (process.env.OPENCLAW_STATE_DIR) {
      return path.join(process.env.OPENCLAW_STATE_DIR, "openclaw.json");
    }
    return resolveHome(".openclaw", "openclaw.json");
  }

  /**
   * 读取完整的 openclaw.json 配置
   * 返回 null 表示文件不存在或运行在 Docker 环境
   */
  readConfig(): Record<string, unknown> | null {
    if (detectPlatform() === "docker") return null;
    const configPath = this.resolveConfigPath();
    if (!fs.existsSync(configPath)) return null;
    const raw = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(raw) as Record<string, unknown>;
  }

  /**
   * 发现本地 Openclaw 配置
   * 检测配置文件是否存在并解析其中的连接信息
   */
  discoverLocal(): DiscoverOpenClawResult {
    if (detectPlatform() === "docker") {
      return { status: "not_found", reason: "docker_env" };
    }

    const configPath = this.resolveConfigPath();

    if (!fs.existsSync(configPath)) {
      return { status: "not_found", reason: "config_missing" };
    }

    const raw = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(raw) as {
      gateway?: { url?: string; token?: string; password?: string };
      url?: string;
      token?: string;
      password?: string;
    };

    const url = config.gateway?.url ?? config.url;
    const token = config.gateway?.token ?? config.token;
    const password = config.gateway?.password ?? config.password;

    if (!url) {
      return { status: "not_found", reason: "config_missing" };
    }

    if (token) {
      return { status: "found", url, authMode: "token", token };
    }
    if (password) {
      return { status: "found", url, authMode: "password", password };
    }

    return { status: "found", url };
  }
}
