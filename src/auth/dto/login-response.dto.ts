import { ApiProperty } from "@nestjs/swagger";

export class LoginResponseDto {
    @ApiProperty({ description: 'Token JWT de acesso', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    access_token: string;

    @ApiProperty({
        description: 'Indica se o representante precisa completar o cadastro (nome, email e senha)',
        example: false,
    })
    pending_setup: boolean;
}
