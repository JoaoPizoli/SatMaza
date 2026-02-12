import { IsEmail, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { TipoUsuarioEnum } from "../enum/tipo-usuario.enum";


export class CreateUsuarioDto {
    @IsNumber()
    usuario: number;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    senha: string;

    @IsEnum(TipoUsuarioEnum)
    tipo: TipoUsuarioEnum

}