import { Module } from "@nestjs/common";
import { ErpService } from "./erp.service";
import { ErpController } from "./erp.controller";

@Module({
    controllers: [ErpController],
    providers: [ErpService],
    exports: [ErpService]
})
export class ErpModule {}