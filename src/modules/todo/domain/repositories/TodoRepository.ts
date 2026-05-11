import {DataSource, Repository} from 'typeorm'
import {TodoEntity} from '../entities/TodoEntity'
import {Inject, Injectable} from '@nestjs/common'

export const TODO_TABLE = 'todo'

export const TODO_COLUMNS = {
  id: 'id',
  title: 'title',
  description: 'description',
  priority: 'priority',
  completed: 'completed',
  userId: 'user_id',
} as const

export const todoRepositoryProvider = [
  {
    provide: 'TODO_REPOSITORY',
    useFactory: (dataSource: DataSource): Repository<TodoEntity> =>
      dataSource.getRepository(TodoEntity),
    inject: ['DATA_SOURCE'],
  },
]

@Injectable()
export class TodoRepository {
  constructor(
    @Inject('TODO_REPOSITORY')
    private todoRepository: Repository<TodoEntity>,
  ) {}

  async saveTodo(todoEntity: TodoEntity): Promise<TodoEntity> {
    return this.todoRepository.save(todoEntity)
  }

  async findTodosByUser(userId: number): Promise<TodoEntity[]> {
    return this.todoRepository.find({where: {userId}})
  }

  async findTodoByIdForUser(
    userId: number,
    id: number,
  ): Promise<TodoEntity | null> {
    return this.todoRepository.findOne({where: {id, userId}})
  }

  async deleteTodoByIdForUser(userId: number, id: number): Promise<void> {
    await this.todoRepository.delete({id, userId})
  }
}
