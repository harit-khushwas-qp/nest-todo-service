import {Test, TestingModule} from '@nestjs/testing'
import {TodoRepository} from './TodoRepository'
import {TodoEntity} from '../entities/TodoEntity'
import {Repository} from 'typeorm'

describe('TodoRepository', () => {
  let repository: TodoRepository
  let typeOrmRepository: Repository<TodoEntity>

  const mockTypeOrmRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoRepository,
        {
          provide: 'TODO_REPOSITORY',
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile()

    repository = module.get<TodoRepository>(TodoRepository)
    typeOrmRepository = module.get<Repository<TodoEntity>>('TODO_REPOSITORY')
    jest.clearAllMocks()
  })

  describe('saveTodo', () => {
    it('should save a todo entity', async () => {
      const todoEntity = new TodoEntity()
      todoEntity.title = 'Test Todo'

      const savedEntity = {id: 1, title: todoEntity.title}
      mockTypeOrmRepository.save.mockResolvedValue(savedEntity)

      const result = await repository.saveTodo(todoEntity)

      expect(result).toEqual(savedEntity)
      expect(typeOrmRepository.save).toHaveBeenCalledWith(todoEntity)
    })

    it('should propagate save errors', async () => {
      const todoEntity = new TodoEntity()
      todoEntity.title = 'Fails'
      mockTypeOrmRepository.save.mockRejectedValue(new Error('save failure'))

      await expect(repository.saveTodo(todoEntity)).rejects.toThrow(
        'save failure',
      )
    })
  })

  describe('findTodosByUser', () => {
    it('should return todos for a specific user', async () => {
      const todos = [{id: 1, userId: 2}]
      mockTypeOrmRepository.find.mockResolvedValue(todos)

      const result = await repository.findTodosByUser(2)

      expect(result).toEqual(todos)
      expect(typeOrmRepository.find).toHaveBeenCalledWith({where: {userId: 2}})
    })
  })

  describe('findTodoByIdForUser', () => {
    it('should return a todo for the correct user and id', async () => {
      const todo = {id: 1, userId: 1}
      mockTypeOrmRepository.findOne.mockResolvedValue(todo)

      const result = await repository.findTodoByIdForUser(1, 1)

      expect(result).toEqual(todo)
      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: {id: 1, userId: 1},
      })
    })

    it('should return null when no todo exists', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null)

      const result = await repository.findTodoByIdForUser(1, 99)

      expect(result).toBeNull()
    })
  })

  describe('deleteTodoByIdForUser', () => {
    it('should delete a todo for the correct user and id', async () => {
      mockTypeOrmRepository.delete.mockResolvedValue({affected: 1})

      await repository.deleteTodoByIdForUser(1, 1)

      expect(typeOrmRepository.delete).toHaveBeenCalledWith({id: 1, userId: 1})
    })

    it('should propagate delete errors', async () => {
      mockTypeOrmRepository.delete.mockRejectedValue(
        new Error('delete failure'),
      )

      await expect(repository.deleteTodoByIdForUser(1, 1)).rejects.toThrow(
        'delete failure',
      )
    })
  })
})
