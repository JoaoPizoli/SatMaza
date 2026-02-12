import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AvtEntity } from "./entity/avt.entity";
import { AvtService } from "./avt.service";

@Module({
    imports: [TypeOrmModule.forFeature([AvtEntity])],
    providers: [AvtService],
    exports: [AvtService]
})
export class AvtModule{}