import {
  Body,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
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
import {TodoService} from '../services/TodoService'
import {JwtAuthGuard} from '@src/common/guards/JwtAuthGuard'
import {CurrentUser} from '@src/common/decorators/CurrentUser'
import {AuthenticatedUser} from '@modules/auth/application/types/AuthenticatedUser'

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
  async getTodos(@CurrentUser() user: AuthenticatedUser): Promise<ITodo[]> {
    return this.todoService.getTodosForUser(user.userId)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get todo by ID',
    description: 'Retrieve a specific todo by its ID',
  })
  @ApiParam({name: 'id', type: Number, description: 'Todo ID'})
  async getTodo(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ITodo> {
    return this.todoService.getTodoByIdForUser(user.userId, id)
  }

  @Post()
  @ApiOperation({summary: 'Create todo', description: 'Create a new todo item'})
  @ApiBody({type: TodoDto})
  async createTodo(
    @CurrentUser() user: AuthenticatedUser,
    @Body() todoDto: TodoDto,
  ): Promise<ITodo> {
    return this.todoService.createTodoForUser(user.userId, todoDto)
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update todo',
    description: 'Update an existing todo item',
  })
  @ApiParam({name: 'id', type: Number, description: 'Todo ID'})
  @ApiBody({type: UpdateTodoDto})
  async updateTodo(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTodoDto,
  ): Promise<ITodo> {
    return this.todoService.updateTodoForUser(user.userId, id, updateDto)
  }

  @Delete(':id')
  @ApiOperation({summary: 'Delete todo', description: 'Delete a todo item'})
  @ApiParam({name: 'id', type: Number, description: 'Todo ID'})
  async deleteTodo(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{success: boolean}> {
    return this.todoService.deleteTodoForUser(user.userId, id)
  }
}
