import {
  Body,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'
import {Controller} from '@nestjs/common/decorators/core/controller.decorator'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger'
import {TodoDto} from '../dtos/TodoDto'
import {UpdateTodoDto} from '../dtos/UpdateTodoDto'
import {ITodo} from '../types/ITodo'
import {IAuthenticatedRequest} from '../types/AuthenticatedRequest'
import {TodoService} from '../services/todo.service'
import {JwtAuthGuard} from '@modules/auth/application/guards/jwt-auth.guard'

@ApiTags('todos')
@ApiBearerAuth('access-token')
@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all todos',
    description: 'Retrieve all todos for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of todos retrieved successfully',
  })
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async getTodos(@Req() request: IAuthenticatedRequest): Promise<ITodo[]> {
    return this.todoService.getTodosForUser(request.user.userId)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get todo by ID',
    description: 'Retrieve a specific todo by its ID',
  })
  @ApiParam({name: 'id', type: Number, description: 'Todo ID'})
  @ApiResponse({status: 200, description: 'Todo retrieved successfully'})
  @ApiResponse({status: 404, description: 'Todo not found'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async getTodo(
    @Req() request: IAuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ITodo> {
    try {
      return await this.todoService.getTodoByIdForUser(request.user.userId, id)
    } catch (error) {
      if (error instanceof HttpException) throw error
      throw new HttpException(
        'Failed to retrieve todo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Post()
  @ApiOperation({summary: 'Create todo', description: 'Create a new todo item'})
  @ApiBody({type: TodoDto})
  @ApiResponse({status: 201, description: 'Todo created successfully'})
  @ApiResponse({status: 400, description: 'Bad request'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async createTodo(
    @Req() request: IAuthenticatedRequest,
    @Body() todoDto: TodoDto,
  ): Promise<ITodo> {
    try {
      return await this.todoService.createTodoForUser(
        request.user.userId,
        todoDto,
      )
    } catch (error) {
      if (error instanceof HttpException) throw error
      throw new HttpException(
        'Failed to create todo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update todo',
    description: 'Update an existing todo item',
  })
  @ApiParam({name: 'id', type: Number, description: 'Todo ID'})
  @ApiBody({type: UpdateTodoDto})
  @ApiResponse({status: 200, description: 'Todo updated successfully'})
  @ApiResponse({status: 404, description: 'Todo not found'})
  @ApiResponse({status: 400, description: 'Bad request'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async updateTodo(
    @Req() request: IAuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTodoDto,
  ): Promise<ITodo> {
    try {
      return await this.todoService.updateTodoForUser(
        request.user.userId,
        id,
        updateDto,
      )
    } catch (error) {
      if (error instanceof HttpException) throw error
      throw new HttpException(
        'Failed to update todo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Delete(':id')
  @ApiOperation({summary: 'Delete todo', description: 'Delete a todo item'})
  @ApiParam({name: 'id', type: Number, description: 'Todo ID'})
  @ApiResponse({status: 200, description: 'Todo deleted successfully'})
  @ApiResponse({status: 404, description: 'Todo not found'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async deleteTodo(
    @Req() request: IAuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{success: boolean}> {
    try {
      return await this.todoService.deleteTodoForUser(request.user.userId, id)
    } catch (error) {
      if (error instanceof HttpException) throw error
      throw new HttpException(
        'Failed to delete todo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}
