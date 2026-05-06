import { Injectable, NotFoundException } from '@nestjs/common'
import { TodoRepository } from '@modules/todo/domain/repositories/TodoRepository'
import { ITodo } from '@modules/todo/application/types/ITodo'
import { ITodoList } from '../types/ITodoList'
import { TodoDto } from '../dtos/TodoDto'
import { UpdateTodoDto } from '../dtos/UpdateTodoDto'
import { TodoEntity } from '@modules/todo/domain/entities/TodoEntity'

@Injectable()
export class TodoService {
  private readonly lists: ITodoList[] = []
  private readonly listCounter = { value: 1 }

  constructor(private readonly todoRepository: TodoRepository) {}

  async createTodo(title: string, emphasized = false): Promise<ITodo> {
    return this.createTodoForUser(0, { title })
  }

  async getTodoById(id: number): Promise<ITodo | undefined> {
    const todo = await this.todoRepository.findTodoByIdForUser(0, id)
    return todo ? this.toPublicTodo(todo) : undefined
  }

  async createTodoForUser(userId: number, todoDto: TodoDto): Promise<ITodo> {
    const todoEntity = new TodoEntity()
    todoEntity.title = todoDto.title
    todoEntity.description = todoDto.description
    todoEntity.priority = todoDto.priority ?? 'medium'
    todoEntity.completed = todoDto.completed ?? false
    todoEntity.listId = todoDto.listId
    todoEntity.userId = userId

    const savedTodo = await this.todoRepository.saveTodo(todoEntity)
    return this.toPublicTodo(savedTodo)
  }

  async getTodosForUser(userId: number): Promise<ITodo[]> {
    const todoEntities = await this.todoRepository.findTodosByUser(userId)
    return todoEntities.map((todo) => this.toPublicTodo(todo))
  }

  async getTodoByIdForUser(userId: number, id: number): Promise<ITodo> {
    const todo = await this.todoRepository.findTodoByIdForUser(userId, id)
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`)
    }
    return this.toPublicTodo(todo)
  }

  async updateTodoForUser(userId: number, id: number, updateDto: UpdateTodoDto): Promise<ITodo> {
    const todo = await this.todoRepository.findTodoByIdForUser(userId, id)
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`)
    }

    if (updateDto.title !== undefined) {
      todo.title = updateDto.title
    }
    if (updateDto.description !== undefined) {
      todo.description = updateDto.description
    }
    if (updateDto.priority !== undefined) {
      todo.priority = updateDto.priority
    }
    if (updateDto.completed !== undefined) {
      todo.completed = updateDto.completed
    }
    if (updateDto.listId !== undefined) {
      todo.listId = updateDto.listId
    }

    const updatedTodo = await this.todoRepository.saveTodo(todo)
    return this.toPublicTodo(updatedTodo)
  }

  async deleteTodoForUser(userId: number, id: number): Promise<{ success: boolean }> {
    await this.todoRepository.deleteTodoByIdForUser(userId, id)
    return { success: true }
  }

  createList(userId: number, name: string): ITodoList {
    const newList: ITodoList = {
      id: this.listCounter.value++,
      name,
      userId,
      position: this.lists.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.lists.push(newList)
    return newList
  }

  getListsForUser(userId: number): ITodoList[] {
    return this.lists
      .filter((list) => list.userId === userId)
      .sort((a, b) => a.position - b.position)
  }

  getListByIdForUser(userId: number, id: number): ITodoList {
    const list = this.lists.find(
      (item) => item.id === id && item.userId === userId,
    )
    if (!list) {
      throw new NotFoundException(`Todo list with ID ${id} not found`)
    }
    return list
  }

  async addTodoToList(userId: number, listId: number, todoId: number): Promise<ITodo> {
    const list = this.getListByIdForUser(userId, listId)
    const todo = await this.todoRepository.findTodoByIdForUser(userId, todoId)
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${todoId} not found`)
    }

    todo.listId = list.id
    const updatedTodo = await this.todoRepository.saveTodo(todo)
    return this.toPublicTodo(updatedTodo)
  }

  sortLists(userId: number, listOrder: number[]): ITodoList[] {
    const lists = this.getListsForUser(userId)
    const orderedLists = listOrder.map((id, index) => {
      const list = lists.find((item) => item.id === id)
      if (!list) {
        throw new NotFoundException(`Todo list with ID ${id} not found`)
      }
      list.position = index + 1
      list.updatedAt = new Date().toISOString()
      return list
    })
    return orderedLists
  }

  private toPublicTodo(todo: TodoEntity): ITodo {
    const { userId, ...publicTodo } = todo
    return publicTodo
  }
}
