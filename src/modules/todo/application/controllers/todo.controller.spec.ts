import { Test, TestingModule } from '@nestjs/testing'
import { TodoController } from './todo.controller'
import { TodoService } from '../services/todo.service'
import { HttpException, HttpStatus } from '@nestjs/common'
import { JwtAuthGuard } from '@modules/auth/application/guards/jwt-auth.guard'

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
      .useValue({ canActivate: jest.fn(() => true) })
      .compile()

    controller = module.get<TodoController>(TodoController)
    service = module.get<TodoService>(TodoService)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should return todos for the authenticated user', async () => {
    const todos = [{ id: 1, title: 'Test', completed: false }]
    mockTodoService.getTodosForUser.mockResolvedValue(todos)

    const result = await controller.getTodos({ user: { userId: 1 } })

    expect(result).toEqual(todos)
    expect(service.getTodosForUser).toHaveBeenCalledWith(1)
  })

  it('should create a todo successfully', async () => {
    const todoDto = { title: 'Test Todo' }
    const expectedResult = { id: 1, title: 'Test Todo' }

    mockTodoService.createTodoForUser.mockResolvedValue(expectedResult)

    const result = await controller.createTodo({ user: { userId: 1 } }, todoDto)

    expect(result).toEqual(expectedResult)
    expect(service.createTodoForUser).toHaveBeenCalledWith(1, todoDto)
  })

  it('should update a todo successfully', async () => {
    const updateDto = { title: 'Updated' }
    const expectedResult = { id: 1, title: 'Updated' }

    mockTodoService.updateTodoForUser.mockResolvedValue(expectedResult)

    const result = await controller.updateTodo({ user: { userId: 1 } }, 1, updateDto)

    expect(result).toEqual(expectedResult)
    expect(service.updateTodoForUser).toHaveBeenCalledWith(1, 1, updateDto)
  })

  it('should delete a todo successfully', async () => {
    mockTodoService.deleteTodoForUser.mockResolvedValue({ success: true })

    const result = await controller.deleteTodo({ user: { userId: 1 } }, 1)

    expect(result).toEqual({ success: true })
    expect(service.deleteTodoForUser).toHaveBeenCalledWith(1, 1)
  })

  it('should throw if service fails while creating', async () => {
    const todoDto = { title: 'Test' }
    mockTodoService.createTodoForUser.mockRejectedValue(new Error('Database error'))

    await expect(controller.createTodo({ userId: 1 }, todoDto)).rejects.toThrow(HttpException)
  })

  it('should throw if service fails while retrieving a todo', async () => {
    mockTodoService.getTodoByIdForUser.mockRejectedValue(new Error('Database error'))

    await expect(controller.getTodo({ userId: 1 }, 1)).rejects.toThrow(HttpException)
  })
})
