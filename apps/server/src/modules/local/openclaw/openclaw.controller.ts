import { OpenclawService } from "./openclaw.service";

import { Controller, Get } from "@nestjs/common";
import { BaseController } from "../../base/base.controller";

/**
 * Openclaw 本地配置发现控制器
 * 用于扫描本地 Openclaw 配置文件并返回发现结果
 */
@Controller("local/openclaw")
export class OpenclawController extends BaseController {
  constructor(private readonly service: OpenclawService) {
    super();
  }

  /**
   * 扫描本地 Openclaw 配置
   * 检查 ~/.openclaw/openclaw.json 或环境变量指定的配置文件
   */
  @Get("scan")
  scan() {
    return this.service.discoverLocal();
  }
}
