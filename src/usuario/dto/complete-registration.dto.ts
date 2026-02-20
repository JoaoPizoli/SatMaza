import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class CompleteRegistrationDto {
    @ApiProperty({ description: 'E-mail do usuário', example: 'usuario@satmaza.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Nova senha do usuário', example: 'senhaForte123' })
    @IsString()
    @MinLength(6)
    senha: string;
}
