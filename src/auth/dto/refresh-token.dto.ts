import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RefreshTokenDto {
    @ApiProperty({ description: 'Refresh token para renovar a sessão' })
    @IsString()
    @IsNotEmpty()
    refresh_token: string;
}
