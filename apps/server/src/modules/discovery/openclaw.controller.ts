import { Controller, Get } from "@nestjs/common";
import { BaseController } from "../base/base.controller";

@Controller("discovery/openclaw")
export class OpenclawController extends BaseController {
  // GET /discovery/openclaw/scan — 无鉴权，扫描本地配置文件
  @Get("scan")
  scan() {}
}
