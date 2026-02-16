import { IsEmail, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { TipoUsuarioEnum } from "../enum/tipo-usuario.enum";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";


export class CreateUsuarioDto {
    @ApiProperty({ description: 'Código do usuário', example: "024" })
    @IsString()
    usuario: string;

    @ApiPropertyOptional({ description: 'E-mail do usuário', example: 'usuario@satmaza.com' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({ description: 'Senha do usuário', example: 'senha123' })
    @IsString()
    senha: string;

    @ApiProperty({ description: 'Tipo/perfil do usuário', enum: TipoUsuarioEnum, example: TipoUsuarioEnum.REPRESENTANTE })
    @IsEnum(TipoUsuarioEnum)
    tipo: TipoUsuarioEnum

}