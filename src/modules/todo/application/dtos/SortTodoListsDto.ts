import { ArrayNotEmpty, IsInt, IsPositive } from 'class-validator'

export class SortTodoListsDto {
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  listOrder!: number[]
}
