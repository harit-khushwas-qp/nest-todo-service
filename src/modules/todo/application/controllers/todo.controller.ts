import {
  Body,
  Get,
  Param,
  ParseIntPipe,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Controller } from '@nestjs/common/decorators/core/controller.decorator'
import { TodoDto } from '../dtos/TodoDto'
import { ITodo } from '../types/ITodo'
import { TodoService } from '../services/todo.service'

@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get(':id')
  async getTodo(@Param('id', ParseIntPipe) id: number): Promise<ITodo> {
    try {
      const todo = await this.todoService.getTodoById(id)
      if (!todo) {
        throw new HttpException(
          `Todo with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        )
      }
      return todo
    } catch (error) {
      if (error instanceof HttpException) throw error
      throw new HttpException(
        'Failed to retrieve todo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Post()
  async createTodo(@Body() todoDto: TodoDto): Promise<ITodo> {
    try {
      if (!todoDto.title || todoDto.title.trim().length === 0) {
        throw new HttpException(
          'Title cannot be empty',
          HttpStatus.BAD_REQUEST,
        )
      }

      const newTodo = await this.todoService.createTodo(
        todoDto.title
      )
      return newTodo
    } catch (error) {
      if (error instanceof HttpException) throw error
      throw new HttpException(
        'Failed to create todo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}
