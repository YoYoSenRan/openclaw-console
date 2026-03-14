import { Controller, Get } from "@nestjs/common";
import { BaseController } from "../../base/base.controller";
import { OpenclawService } from "./openclaw.service";

@Controller("discovery/openclaw")
export class OpenclawController extends BaseController {
  constructor(private readonly service: OpenclawService) {
    super();
  }

  @Get("scan")
  scan() {
    return this.service.discoverLocal();
  }
}
