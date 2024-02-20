import { IsNotEmpty, IsString } from 'class-validator';

type AvailableDateOption = 'today' | 'yesterday' | 'last-week' | 'last-month';

export class Historyquery {
  @IsString()
  @IsNotEmpty()
  date: AvailableDateOption;

  @IsString()
  @IsNotEmpty()
  page: string;

  @IsString()
  @IsNotEmpty()
  rowPerPage: string;
}
