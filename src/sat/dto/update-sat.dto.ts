import { PartialType } from "@nestjs/mapped-types";
import { CreateSatDto } from "./create-sat.dto";

export class UpdateSatDto extends PartialType(CreateSatDto) {}