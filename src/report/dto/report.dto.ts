import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { AppState } from "../report.type";
import { IsString } from "class-validator";

export class ReportAppStateDto {
    @ApiProperty({
        description: "Device's id which make report",
        example: '2af4ad2f-bd96-4e54-95a3-dfa473a65a06',
    })
    @Expose()
    @IsString()
    deviceId: string;

    @ApiProperty({
        description: "State you want to report",
        example: `${AppState.ACTIVE}`,
        enum: AppState
    })
    @Expose()
    @IsString()
    state: AppState;
}

export interface ReportAppBusinessDto {
    sessionId: string,
    businessIds: string[] //public-id
}
