import { ApiProperty } from "@nestjs/swagger";

export class UserProfileResponseDto {
    @ApiProperty({ example: 'user@email.com' })
    email: string;
    @ApiProperty({ example: 'John Doe' })
    name: string;
    @ApiProperty({ example: '+33612345678', required: false })
    phone?: string;
    @ApiProperty({ example: 'Paris', required: false })
    city?: string;
    @ApiProperty({ example: '10 rue de la Paix', required: false })
    street?: string;
    @ApiProperty({ example: 'France', required: false })
    country?: string;
    @ApiProperty({ example: 'Ile-de-France', required: false })
    state?: string;
    @ApiProperty({ example: '75002', required: false })
    postalcode?: string;
}

export class UserProfileUpdateDto {
    @ApiProperty({ example: 'user@email.com', required: false })
    email?: string;
    @ApiProperty({ example: 'John Doe', required: false })
    name?: string;
    @ApiProperty({ example: '+33612345678', required: false })
    phone?: string;
    @ApiProperty({ example: 'Paris', required: false })
    city?: string;
    @ApiProperty({ example: '10 rue de la Paix', required: false })
    street?: string;
    @ApiProperty({ example: 'France', required: false })
    country?: string;
    @ApiProperty({ example: 'Ile-de-France', required: false })
    state?: string;
    @ApiProperty({ example: '75002', required: false })
    postalcode?: string;
}