import { Test, TestingModule } from '@nestjs/testing'
import { TodoController } from './todo.controller'
import { TodoService } from '../services/todo.service'
import { HttpException, HttpStatus } from '@nestjs/common'

describe('TodoController', () => {
  let controller: TodoController;
  let service: TodoService;

  const mockTodoService = {
    createTodo: jest.fn(),
    getTodoById: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: mockTodoService,
        },
      ],
    }).compile()

    controller = module.get<TodoController>(TodoController)
    service = module.get<TodoService>(TodoService)

    jest.clearAllMocks()
  })

  describe('createTodo', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined()
    })

    it('should create a todo successfully', async () => {
      const todoDto = { title: 'Test Todo' }
      const expectedResult = {
        id: 1,
        title: 'Test Todo'
      }

      mockTodoService.createTodo.mockResolvedValue(expectedResult)

      const result = await controller.createTodo(todoDto)

      expect(result).toEqual(expectedResult)
      expect(service.createTodo).toHaveBeenCalledWith('Test Todo')
    })

    it('should throw BAD_REQUEST for empty title', async () => {
      const todoDto = { title: ''}

      mockTodoService.createTodo.mockRejectedValue(
        new HttpException('Title cannot be empty', HttpStatus.BAD_REQUEST),
      )

      await expect(controller.createTodo(todoDto)).rejects.toThrow(
        HttpException,
      )
    })

    it('should throw BAD_REQUEST for whitespace-only title', async () => {
      const todoDto = { title: '   '}

      mockTodoService.createTodo.mockRejectedValue(
        new HttpException('Title cannot be empty', HttpStatus.BAD_REQUEST),
      )

      await expect(controller.createTodo(todoDto)).rejects.toThrow(
        HttpException,
      )
    })

    it('should handle service errors', async () => {
      const todoDto = { title: 'Test'}

      mockTodoService.createTodo.mockRejectedValue(
        new Error('Database error'),
      )

      await expect(controller.createTodo(todoDto)).rejects.toThrow(
        HttpException,
      )
    })

  })

  describe('getTodo', () => {
    it('should retrieve a todo by id', async () => {
      const expectedResult = {
        id: 1,
        title: 'Test Todo'
      }

      mockTodoService.getTodoById.mockResolvedValue(expectedResult)

      const result = await controller.getTodo(1)

      expect(result).toEqual(expectedResult)
      expect(service.getTodoById).toHaveBeenCalledWith(1)
    })

    it('should throw NOT_FOUND when todo not found', async () => {
      mockTodoService.getTodoById.mockResolvedValue(null)

      await expect(controller.getTodo(999)).rejects.toThrow(HttpException)
    })

    it('should handle service errors', async () => {
      mockTodoService.getTodoById.mockRejectedValue(new Error('Database error'))

      await expect(controller.getTodo(1)).rejects.toThrow(HttpException)
    })

    it('should accept numeric id parameter', async () => {
      const expectedResult = {
        id: 5,
        title: 'Test'
      }

      mockTodoService.getTodoById.mockResolvedValue(expectedResult)

      const result = await controller.getTodo(5)

      expect(result).toEqual(expectedResult)
      expect(service.getTodoById).toHaveBeenCalledWith(5)
    })
  })
})
