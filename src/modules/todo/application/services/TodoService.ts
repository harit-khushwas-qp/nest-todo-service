import {Injectable, NotFoundException} from '@nestjs/common'
import {TodoRepository} from '@modules/todo/domain/repositories/TodoRepository'
import {ITodo} from '@modules/todo/application/types/ITodo'
import {TodoDto} from '../dtos/TodoDto'
import {UpdateTodoDto} from '../dtos/UpdateTodoDto'
import {TodoEntity} from '@modules/todo/domain/entities/TodoEntity'

@Injectable()
export class TodoService {
  constructor(private readonly todoRepository: TodoRepository) {}

  async createTodo(title: string, _emphasized = false): Promise<ITodo> {
    return this.createTodoForUser(0, {title})
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
    todoEntity.userId = userId

    const savedTodo = await this.todoRepository.saveTodo(todoEntity)
    return this.toPublicTodo(savedTodo)
  }

  async getTodosForUser(userId: number): Promise<ITodo[]> {
    const todoEntities = await this.todoRepository.findTodosByUser(userId)
    return todoEntities.map(todo => this.toPublicTodo(todo))
  }

  async getTodoByIdForUser(userId: number, id: number): Promise<ITodo> {
    const todo = await this.todoRepository.findTodoByIdForUser(userId, id)
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`)
    }
    return this.toPublicTodo(todo)
  }

  async updateTodoForUser(
    userId: number,
    id: number,
    updateDto: UpdateTodoDto,
  ): Promise<ITodo> {
    const todo = await this.todoRepository.findTodoByIdForUser(userId, id)
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`)
    }

    if (updateDto.title != null) {
      todo.title = updateDto.title
    }
    if (updateDto.description != null) {
      todo.description = updateDto.description
    }
    if (updateDto.priority != null) {
      todo.priority = updateDto.priority
    }
    if (updateDto.completed != null) {
      todo.completed = updateDto.completed
    }

    const updatedTodo = await this.todoRepository.saveTodo(todo)
    return this.toPublicTodo(updatedTodo)
  }

  async deleteTodoForUser(
    userId: number,
    id: number,
  ): Promise<{success: boolean}> {
    await this.todoRepository.deleteTodoByIdForUser(userId, id)
    return {success: true}
  }

  private toPublicTodo(todo: TodoEntity): ITodo {
    const {userId: _userId, ...publicTodo} = todo
    return publicTodo
  }
}
