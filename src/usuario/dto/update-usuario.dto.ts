import { IsEmail, IsEnum, IsOptional, IsString, ValidateIf } from "class-validator";
import { TipoUsuarioEnum } from "../enum/tipo-usuario.enum";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUsuarioDto {
    @ApiPropertyOptional({ description: 'Código do usuário' })
    @IsString()
    @IsOptional()
    usuario?: string;

    @ApiPropertyOptional({ description: 'E-mail do usuário (enviar null para limpar)', nullable: true })
    @ValidateIf((_o, v) => v !== null)
    @IsEmail()
    @IsOptional()
    email?: string | null;

    @ApiPropertyOptional({ description: 'Nome do usuário (enviar null para limpar)', nullable: true })
    @ValidateIf((_o, v) => v !== null)
    @IsString()
    @IsOptional()
    nome?: string | null;

    @ApiPropertyOptional({ description: 'Senha do usuário' })
    @IsString()
    @IsOptional()
    senha?: string;

    @ApiPropertyOptional({ description: 'Tipo/perfil do usuário', enum: TipoUsuarioEnum })
    @IsEnum(TipoUsuarioEnum)
    @IsOptional()
    tipo?: TipoUsuarioEnum;
}