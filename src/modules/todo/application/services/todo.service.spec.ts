import { Test, TestingModule } from '@nestjs/testing'
import { TodoService } from './todo.service'
import { TodoRepository } from '@modules/todo/domain/repositories/TodoRepository'
import { TodoEntity } from '@modules/todo/domain/entities/TodoEntity'
import { NotFoundException } from '@nestjs/common'

describe('TodoService', () => {
  let service: TodoService
  let todoRepository: TodoRepository

  const mockTodoRepository = {
    saveTodo: jest.fn(),
    findTodosByUser: jest.fn(),
    findTodoByIdForUser: jest.fn(),
    deleteTodoByIdForUser: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: TodoRepository,
          useValue: mockTodoRepository,
        },
      ],
    }).compile()

    service = module.get<TodoService>(TodoService)
    todoRepository = module.get<TodoRepository>(TodoRepository)
    jest.clearAllMocks()
  })

  it('should create a todo for a user', async () => {
    const todoEntity = new TodoEntity()
    todoEntity.id = 1
    todoEntity.title = 'New Todo'
    todoEntity.userId = 1
    todoEntity.description = undefined
    todoEntity.priority = 'medium'
    todoEntity.completed = false
    todoEntity.listId = undefined

    mockTodoRepository.saveTodo.mockResolvedValue(todoEntity)

    const result = await service.createTodoForUser(1, { title: 'New Todo' })

    expect(result).toEqual({
      id: 1,
      title: 'New Todo',
      description: undefined,
      priority: 'medium',
      completed: false,
      listId: undefined,
    })
    expect(todoRepository.saveTodo).toHaveBeenCalled()
  })

  it('should return todos for the user', async () => {
    const todos = [
      { id: 1, title: 'A', userId: 1, listId: undefined, priority: 'low', completed: false },
    ]
    mockTodoRepository.findTodosByUser.mockResolvedValue(todos)

    const result = await service.getTodosForUser(1)

    expect(result).toEqual([
      { id: 1, title: 'A', listId: undefined, priority: 'low', completed: false },
    ])
    expect(todoRepository.findTodosByUser).toHaveBeenCalledWith(1)
  })

  it('should get a todo by id for user', async () => {
    const todo = { id: 2, title: 'Todo', userId: 1, listId: undefined, priority: 'medium', completed: false }
    mockTodoRepository.findTodoByIdForUser.mockResolvedValue(todo)

    const result = await service.getTodoByIdForUser(1, 2)

    expect(result).toEqual({ id: 2, title: 'Todo', listId: undefined, priority: 'medium', completed: false })
  })

  it('should throw when requested todo is missing', async () => {
    mockTodoRepository.findTodoByIdForUser.mockResolvedValue(null)

    await expect(service.getTodoByIdForUser(1, 99)).rejects.toThrow(NotFoundException)
  })

  it('should update a todo for user', async () => {
    const todo = new TodoEntity()
    todo.id = 1
    todo.title = 'Original'
    todo.description = 'desc'
    todo.priority = 'low'
    todo.completed = false
    todo.userId = 1

    mockTodoRepository.findTodoByIdForUser.mockResolvedValue(todo)
    mockTodoRepository.saveTodo.mockResolvedValue({ ...todo, title: 'Updated', completed: true })

    const result = await service.updateTodoForUser(1, 1, {
      title: 'Updated',
      completed: true,
    })

    expect(result.title).toBe('Updated')
    expect(result.completed).toBe(true)
    expect(todoRepository.saveTodo).toHaveBeenCalled()
  })

  it('should delete a todo for user', async () => {
    mockTodoRepository.deleteTodoByIdForUser.mockResolvedValue(undefined)

    const result = await service.deleteTodoForUser(1, 1)

    expect(result).toEqual({ success: true })
    expect(todoRepository.deleteTodoByIdForUser).toHaveBeenCalledWith(1, 1)
  })

  it('should create and return a new list', () => {
    const result = service.createList(1, 'Inbox')

    expect(result).toMatchObject({
      name: 'Inbox',
      userId: 1,
      position: 1,
    })
  })

  it('should return only lists for the user', () => {
    service.createList(1, 'Inbox')
    service.createList(2, 'Work')

    const result = service.getListsForUser(1)

    expect(result).toHaveLength(1)
    expect(result[0].userId).toBe(1)
  })

  it('should retrieve a list by id for user', () => {
    service.createList(1, 'Inbox')
    const result = service.getListByIdForUser(1, 1)

    expect(result.id).toBe(1)
  })

  it('should throw when list not found', () => {
    expect(() => service.getListByIdForUser(1, 99)).toThrow(NotFoundException)
  })

  it('should add a todo to a list', async () => {
    const todo = new TodoEntity()
    todo.id = 1
    todo.title = 'Task'
    todo.userId = 1
    todo.listId = undefined
    todo.priority = 'medium'
    todo.completed = false

    service.createList(1, 'Inbox')
    mockTodoRepository.findTodoByIdForUser.mockResolvedValue(todo)
    mockTodoRepository.saveTodo.mockResolvedValue({ ...todo, listId: 1 })

    const result = await service.addTodoToList(1, 1, 1)

    expect(result.listId).toBe(1)
    expect(todoRepository.saveTodo).toHaveBeenCalledWith(expect.objectContaining({ listId: 1 }))
  })

  it('should reorder lists', () => {
    service.createList(1, 'Inbox')
    service.createList(1, 'Work')

    const result = service.sortLists(1, [2, 1])

    expect(result[0].id).toBe(2)
    expect(result[0].position).toBe(1)
  })
})
