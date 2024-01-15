import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class BusinessExtraConfigDto {
  @ApiProperty({
    description: 'The public id of business',
    example: '123456',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'The name of the config',
    example: 'Status',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The value of the config',
    example: '0,1',
  })
  @IsString()
  value: string;
}
