import { IsEmail, IsNumber, IsString, MinLength, ValidateIf } from "class-validator";
import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";

export class LoginDto {
    @ApiPropertyOptional({ description: 'E-mail do usuário (obrigatório se usuário não for informado)', example: 'admin@satmaza.com' })
    @ValidateIf(o => !o.usuario)
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ description: 'Código do usuário/representante (obrigatório se e-mail não for informado)', example: "003" })
    @ValidateIf(o => !o.email)
    @IsString()
    usuario?: string;

    @ApiProperty({ description: 'Senha do usuário', example: 'senha123', minLength: 6 })
    @IsString()
    @MinLength(6)
    senha: string;
}
