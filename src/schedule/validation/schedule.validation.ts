import { IsISO8601, IsString } from 'class-validator';

export class ReminderScheduleBodyData {
  @IsString()
  woltOrderId: string;

  @IsISO8601()
  reminderTime: string;
}
