import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger'
import {TodoService} from '../services/todo.service'
import {CreateTodoListDto} from '../dtos/CreateTodoListDto'
import {AddTodoToListDto} from '../dtos/AddTodoToListDto'
import {SortTodoListsDto} from '../dtos/SortTodoListsDto'
import {ITodoList} from '../types/ITodoList'
import {ITodo} from '../types/ITodo'
import {IAuthenticatedRequest} from '../types/AuthenticatedRequest'
import {JwtAuthGuard} from '@modules/auth/application/guards/jwt-auth.guard'

@ApiTags('todo-lists')
@ApiBearerAuth('access-token')
@Controller('todo-lists')
@UseGuards(JwtAuthGuard)
export class TodoListController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all todo lists',
    description: 'Retrieve all todo lists for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of todo lists retrieved successfully',
  })
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async getLists(@Req() request: IAuthenticatedRequest): Promise<ITodoList[]> {
    return this.todoService.getListsForUser(request.user.userId)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get todo list by ID',
    description: 'Retrieve a specific todo list by its ID',
  })
  @ApiParam({name: 'id', type: Number, description: 'Todo List ID'})
  @ApiResponse({status: 200, description: 'Todo list retrieved successfully'})
  @ApiResponse({status: 404, description: 'Todo list not found'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async getList(
    @Req() request: IAuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ITodoList> {
    return this.todoService.getListByIdForUser(request.user.userId, id)
  }

  @Post()
  @ApiOperation({
    summary: 'Create todo list',
    description: 'Create a new todo list',
  })
  @ApiBody({type: CreateTodoListDto})
  @ApiResponse({status: 201, description: 'Todo list created successfully'})
  @ApiResponse({status: 400, description: 'Bad request'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async createList(
    @Req() request: IAuthenticatedRequest,
    @Body() todoListDto: CreateTodoListDto,
  ): Promise<ITodoList> {
    return this.todoService.createList(request.user.userId, todoListDto.name)
  }

  @Post(':id/todos')
  @ApiOperation({
    summary: 'Add todo to list',
    description: 'Add an existing todo to a todo list',
  })
  @ApiParam({name: 'id', type: Number, description: 'Todo List ID'})
  @ApiBody({type: AddTodoToListDto})
  @ApiResponse({status: 200, description: 'Todo added to list successfully'})
  @ApiResponse({status: 404, description: 'Todo list or todo not found'})
  @ApiResponse({status: 400, description: 'Bad request'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async addTodoToList(
    @Req() request: IAuthenticatedRequest,
    @Param('id', ParseIntPipe) listId: number,
    @Body() body: AddTodoToListDto,
  ): Promise<ITodo> {
    return this.todoService.addTodoToList(
      request.user.userId,
      listId,
      body.todoId,
    )
  }

  @Patch('order')
  @ApiOperation({
    summary: 'Reorder todo lists',
    description: 'Change the order of todo lists',
  })
  @ApiBody({type: SortTodoListsDto})
  @ApiResponse({status: 200, description: 'Todo lists reordered successfully'})
  @ApiResponse({status: 400, description: 'Bad request'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async reorderLists(
    @Req() request: IAuthenticatedRequest,
    @Body() body: SortTodoListsDto,
  ): Promise<ITodoList[]> {
    return this.todoService.sortLists(request.user.userId, body.listOrder)
  }
}
