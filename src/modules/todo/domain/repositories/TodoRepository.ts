import {DataSource, Repository} from 'typeorm'
import {TodoEntity} from '../entities/TodoEntity'
import {Inject, Injectable} from '@nestjs/common'

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

  async createTodo(todoEntity: TodoEntity): Promise<TodoEntity> {
    return this.todoRepository.save(todoEntity)
  }

  async getTodoById(id: number): Promise<TodoEntity | null> {
    return this.todoRepository.findOne({where: {id}})
  }
}
