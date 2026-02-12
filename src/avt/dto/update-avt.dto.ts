import { PartialType } from "@nestjs/mapped-types";
import { CreateAvtDto } from "./create-avt.dto";

export class UpdateAvtDto extends PartialType(CreateAvtDto) {}