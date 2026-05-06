import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateTodoListDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  name!: string
}
