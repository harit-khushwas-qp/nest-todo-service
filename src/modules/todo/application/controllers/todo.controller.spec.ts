import {Test, TestingModule} from '@nestjs/testing'
import {TodoController} from './todo.controller'
import {TodoService} from '../services/todo.service'
import {JwtAuthGuard} from '@modules/auth/application/guards/jwt-auth.guard'
import {HttpException} from '@nestjs/common'
import {IAuthenticatedRequest} from '../types/AuthenticatedRequest'

describe('TodoController', () => {
  let controller: TodoController
  let service: TodoService

  const mockTodoService = {
    createTodoForUser: jest.fn(),
    getTodoByIdForUser: jest.fn(),
    getTodosForUser: jest.fn(),
    updateTodoForUser: jest.fn(),
    deleteTodoForUser: jest.fn(),
  }

  const createMockRequest = (
    userId: number,
  ): Partial<IAuthenticatedRequest> => ({
    user: {
      userId,
      username: 'testuser',
      name: 'Test User',
    },
  })

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: mockTodoService,
        },
      ],
    })

    const module: TestingModule = await moduleBuilder
      .overrideGuard(JwtAuthGuard)
      .useValue({canActivate: jest.fn(() => true)})
      .compile()

    controller = module.get<TodoController>(TodoController)
    service = module.get<TodoService>(TodoService)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should return todos for the authenticated user', async () => {
    const todos = [{id: 1, title: 'Test', completed: false}]
    mockTodoService.getTodosForUser.mockResolvedValue(todos)

    const result = await controller.getTodos(
      createMockRequest(1) as IAuthenticatedRequest,
    )

    expect(result).toEqual(todos)
    expect(service.getTodosForUser).toHaveBeenCalledWith(1)
  })

  it('should create a todo successfully', async () => {
    const todoDto = {title: 'Test Todo'}
    const expectedResult = {id: 1, title: 'Test Todo'}

    mockTodoService.createTodoForUser.mockResolvedValue(expectedResult)

    const result = await controller.createTodo(
      createMockRequest(1) as IAuthenticatedRequest,
      todoDto,
    )

    expect(result).toEqual(expectedResult)
    expect(service.createTodoForUser).toHaveBeenCalledWith(1, todoDto)
  })

  it('should update a todo successfully', async () => {
    const updateDto = {title: 'Updated'}
    const expectedResult = {id: 1, title: 'Updated'}

    mockTodoService.updateTodoForUser.mockResolvedValue(expectedResult)

    const result = await controller.updateTodo(
      createMockRequest(1) as IAuthenticatedRequest,
      1,
      updateDto,
    )

    expect(result).toEqual(expectedResult)
    expect(service.updateTodoForUser).toHaveBeenCalledWith(1, 1, updateDto)
  })

  it('should delete a todo successfully', async () => {
    mockTodoService.deleteTodoForUser.mockResolvedValue({success: true})

    const result = await controller.deleteTodo(
      createMockRequest(1) as IAuthenticatedRequest,
      1,
    )

    expect(result).toEqual({success: true})
    expect(service.deleteTodoForUser).toHaveBeenCalledWith(1, 1)
  })

  it('should throw if service fails while creating', async () => {
    const todoDto = {title: 'Test'}
    mockTodoService.createTodoForUser.mockRejectedValue(
      new Error('Database error'),
    )

    await expect(
      controller.createTodo(
        createMockRequest(1) as IAuthenticatedRequest,
        todoDto,
      ),
    ).rejects.toThrow(HttpException)
  })

  it('should throw if service fails while retrieving a todo', async () => {
    mockTodoService.getTodoByIdForUser.mockRejectedValue(
      new Error('Database error'),
    )

    await expect(
      controller.getTodo(createMockRequest(1) as IAuthenticatedRequest, 1),
    ).rejects.toThrow(HttpException)
  })
})
