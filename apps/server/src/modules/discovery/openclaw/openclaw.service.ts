import { Injectable } from "@nestjs/common";
import fs from "node:fs";
import path from "node:path";
import type { DiscoverOpenClawResult } from "@openclaw/shared";
import { detectPlatform } from "../../../utils/platform";
import { resolveHome } from "../../../utils/path";

@Injectable()
export class OpenclawService {
  private resolveConfigPath(): string {
    if (process.env.OPENCLAW_CONFIG_PATH) {
      return process.env.OPENCLAW_CONFIG_PATH;
    }
    if (process.env.OPENCLAW_STATE_DIR) {
      return path.join(process.env.OPENCLAW_STATE_DIR, "openclaw.json");
    }
    return resolveHome(".openclaw", "openclaw.json");
  }

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
