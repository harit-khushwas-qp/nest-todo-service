import { Test, TestingModule } from '@nestjs/testing'
import { TodoRepository } from './TodoRepository'
import { TodoEntity } from '../entities/TodoEntity'
import { Repository, DataSource } from 'typeorm'
import { title } from 'process'

describe('TodoRepository', () => {
  let repository: TodoRepository
  let typeOrmRepository: Repository<TodoEntity>
  let dataSource: DataSource

  const mockTypeOrmRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
  }

  const mockDataSource = {
    getRepository: jest.fn(() => mockTypeOrmRepository),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoRepository,
        {
          provide: 'TODO_REPOSITORY',
          useValue: mockTypeOrmRepository,
        },
        {
          provide: 'DATA_SOURCE',
          useValue: mockDataSource,
        },
      ],
    }).compile()

    repository = module.get<TodoRepository>(TodoRepository)
    typeOrmRepository = module.get<Repository<TodoEntity>>('TODO_REPOSITORY')

    jest.clearAllMocks()
  })

  describe('createTodo', () => {
    it('should create and save a todo entity', async () => {
      const todoEntity = new TodoEntity()
      todoEntity.title = 'Test Todo'

      const savedEntity = { id:1, title: todoEntity.title }

      mockTypeOrmRepository.save.mockResolvedValue(savedEntity)

      const result = await repository.createTodo(todoEntity)

      expect(result).toEqual(savedEntity)
      expect(typeOrmRepository.save).toHaveBeenCalledWith(todoEntity)
      expect(typeOrmRepository.save).toHaveBeenCalledTimes(1)
    })



    it('should handle database save errors', async () => {
      const todoEntity = new TodoEntity()
      todoEntity.title = 'Failed Todo'

      const error = new Error('Database error')
      mockTypeOrmRepository.save.mockRejectedValue(error)

      await expect(repository.createTodo(todoEntity)).rejects.toThrow(
        'Database error',
      )
    })

    it('should preserve entity properties after save', async () => {
      const todoEntity = new TodoEntity()
      todoEntity.title = 'Preserved Todo'

      const savedEntity = {
        id: 99,
        title: 'Preserved Todo',
      }

      mockTypeOrmRepository.save.mockResolvedValue(savedEntity)

      const result = await repository.createTodo(todoEntity)

      expect(result.title).toBe(todoEntity.title)
    })
  })

  describe('getTodoById', () => {
    it('should retrieve todo by id', async () => {
      const todoEntity = new TodoEntity()
      todoEntity.id = 1
      todoEntity.title = 'Test Todo'

      mockTypeOrmRepository.findOne.mockResolvedValue(todoEntity)

      const result = await repository.getTodoById(1)

      expect(result).toEqual(todoEntity)
      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      })
    })

    it('should return null when todo not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null)

      const result = await repository.getTodoById(999)

      expect(result).toBeNull()
      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      })
    })

    it('should handle database query errors', async () => {
      mockTypeOrmRepository.findOne.mockRejectedValue(
        new Error('Query failed'),
      )

      await expect(repository.getTodoById(1)).rejects.toThrow('Query failed')
    })

    it('should correctly format where clause', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null)

      await repository.getTodoById(42)

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 42 },
      })
    })
  })

  describe('type safety', () => {
    it('should type check todo entity fields', async () => {
      const todoEntity = new TodoEntity()
      todoEntity.id = 1
      todoEntity.title = 'Typed Todo'

      mockTypeOrmRepository.save.mockResolvedValue(todoEntity)

      const result = await repository.createTodo(todoEntity)

      expect(typeof result.id).toBe('number')
      expect(typeof result.title).toBe('string')
    })
  })
})
