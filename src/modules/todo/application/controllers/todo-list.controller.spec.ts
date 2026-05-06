import {Test, TestingModule} from '@nestjs/testing'
import {TodoListController} from './todo-list.controller'
import {TodoService} from '../services/todo.service'
import {JwtAuthGuard} from '@modules/auth/application/guards/jwt-auth.guard'
import {IAuthenticatedRequest} from '@modules/todo/application/types/AuthenticatedRequest'

describe('TodoListController', () => {
  let controller: TodoListController

  const mockTodoService = {
    getListsForUser: jest.fn(),
    getListByIdForUser: jest.fn(),
    createList: jest.fn(),
    addTodoToList: jest.fn(),
    sortLists: jest.fn(),
  }

  const createMockRequest = (userId = 1): IAuthenticatedRequest =>
    ({
      user: {userId},
    }) as IAuthenticatedRequest

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [TodoListController],
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

    controller = module.get<TodoListController>(TodoListController)

    jest.clearAllMocks()
  })

  it('should return lists for the authenticated user', async () => {
    const lists = [
      {
        id: 1,
        name: 'Inbox',
        userId: 1,
        position: 1,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ]

    mockTodoService.getListsForUser.mockResolvedValue(lists)

    const result = await controller.getLists(createMockRequest())

    expect(result).toEqual(lists)

    expect(mockTodoService.getListsForUser).toHaveBeenCalledWith(1)
  })

  it('should return a todo list by id', async () => {
    const list = {
      id: 1,
      name: 'Inbox',
      userId: 1,
      position: 1,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    }

    mockTodoService.getListByIdForUser.mockResolvedValue(list)

    const result = await controller.getList(createMockRequest(), 1)

    expect(result).toEqual(list)

    expect(mockTodoService.getListByIdForUser).toHaveBeenCalledWith(1, 1)
  })

  it('should create a new todo list', async () => {
    const createdList = {
      id: 2,
      name: 'Work',
      userId: 1,
      position: 2,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    }

    mockTodoService.createList.mockResolvedValue(createdList)

    const result = await controller.createList(createMockRequest(), {
      name: 'Work',
    })

    expect(result).toEqual(createdList)

    expect(mockTodoService.createList).toHaveBeenCalledWith(1, 'Work')
  })

  it('should add a todo to a list', async () => {
    const updatedTodo = {
      id: 1,
      title: 'Test',
      listId: 2,
    }

    mockTodoService.addTodoToList.mockResolvedValue(updatedTodo)

    const result = await controller.addTodoToList(createMockRequest(), 2, {
      todoId: 1,
    })

    expect(result).toEqual(updatedTodo)

    expect(mockTodoService.addTodoToList).toHaveBeenCalledWith(1, 2, 1)
  })

  it('should reorder lists for the user', async () => {
    const orderedLists = [
      {
        id: 2,
        name: 'Work',
        userId: 1,
        position: 1,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ]

    mockTodoService.sortLists.mockResolvedValue(orderedLists)

    const result = await controller.reorderLists(createMockRequest(), {
      listOrder: [2],
    })

    expect(result).toEqual(orderedLists)

    expect(mockTodoService.sortLists).toHaveBeenCalledWith(1, [2])
  })
})
