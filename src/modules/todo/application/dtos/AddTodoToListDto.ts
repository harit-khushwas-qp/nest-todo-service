import {IsInt, Min} from 'class-validator'

export class AddTodoToListDto {
  @IsInt()
  @Min(1)
  todoId!: number
}
