import { Module } from "@nestjs/common";
import { AgentController } from "./agent.controller";
import { AgentService } from "./agent.service";
import { LocalModule } from "../local/local.module";

@Module({
  imports: [LocalModule],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
