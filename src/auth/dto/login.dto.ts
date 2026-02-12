import { IsEmail, IsNumber, IsOptional, IsString, MinLength, ValidateIf } from "class-validator";

export class LoginDto {
    @ValidateIf(o => !o.usuario)
    @IsEmail()
    email?: string;

    @ValidateIf(o => !o.email)
    @IsNumber()
    usuario?: number;

    @IsString()
    @MinLength(6)
    senha: string;
}
