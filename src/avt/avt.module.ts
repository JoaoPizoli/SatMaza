import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AvtEntity } from "./entity/avt.entity";
import { AvtService } from "./avt.service";
import { MailModule } from "../mail/mail.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([AvtEntity]),
        forwardRef(() => MailModule),
    ],
    providers: [AvtService],
    exports: [AvtService]
})
export class AvtModule { }