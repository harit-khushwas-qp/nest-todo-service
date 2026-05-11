import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'

export class TodoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  title!: string

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  description?: string

  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high'

  @IsOptional()
  @IsBoolean()
  completed?: boolean
}
