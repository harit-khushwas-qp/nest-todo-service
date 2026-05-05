import { Test, TestingModule } from '@nestjs/testing'
import { TodoService } from './todo.service'

describe('TodoService', () => {
  let service: TodoService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TodoService],
    }).compile()

    service = module.get<TodoService>(TodoService)
  })

  describe('createTodo', () => {
    it('should be defined', () => {
      expect(service).toBeDefined()
    })

    it('should create a todo with title only', () => {
      const result = service.createTodo('Test Todo')

      expect(result).toEqual({
        id: 1,
        title: 'Test Todo',
      })
    })

    it('should create multiple todos with incrementing ids', () => {
      const todo1 = service.createTodo('First Todo')
      const todo2 = service.createTodo('Second Todo')

      expect(todo1.id).toBe(1)
      expect(todo2.id).toBe(2)
    })

    it('should handle empty title', () => {
      const result = service.createTodo('')

      expect(result.title).toBe('')
      expect(result.id).toBe(1)
    })
  })

  describe('getTodoById', () => {
    it('should retrieve a todo by id', () => {
      const createdTodo = service.createTodo('Test Todo')

      const result = service.getTodoById(createdTodo.id)

      expect(result).toEqual(createdTodo)
    })

    it('should return undefined when todo not found', () => {
      const result = service.getTodoById(999)

      expect(result).toBeUndefined()
    })

    it('should return correct todo when multiple exist', () => {
      const todo1 = service.createTodo('First')
      const todo2 = service.createTodo('Second')
      const todo3 = service.createTodo('Third')

      expect(service.getTodoById(1)).toEqual(todo1)
      expect(service.getTodoById(2)).toEqual(todo2)
      expect(service.getTodoById(3)).toEqual(todo3)
    })
  })
})
