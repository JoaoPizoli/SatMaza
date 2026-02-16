import { PartialType } from "@nestjs/swagger";
import { CreateAvtDto } from "./create-avt.dto";

export class UpdateAvtDto extends PartialType(CreateAvtDto) {}