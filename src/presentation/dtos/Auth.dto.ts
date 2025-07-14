import { ApiProperty } from "@nestjs/swagger";

export class SignUpDto {
    @ApiProperty({ example: 'user@email.com' })
    email: string;

    @ApiProperty({ example: 'motdepassefort' })
    password: string;
}

export class LoginDto {
    @ApiProperty({ example: 'user@email.com' })
    email: string;

    @ApiProperty({ example: 'motdepassefort' })
    password: string;
}

export class GoogleAuthDto {
    @ApiProperty({ example: 'id_token_google' })
    idToken: string;
}