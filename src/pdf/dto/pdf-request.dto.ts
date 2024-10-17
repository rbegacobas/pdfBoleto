import { IsString, IsDateString, IsEnum } from 'class-validator';

enum Country {
  MGA = 'MGA',
  GEO = 'GEO',
  PBM = 'PBM',
}

export class PdfRequestDto {
  @IsEnum(Country)
  country: Country;

  @IsString()
  name: string;

  @IsDateString()
  entryDate: string;

  @IsDateString()
  exitDate: string;
}
