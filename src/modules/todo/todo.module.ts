import {Module} from '@nestjs/common'

import {
  TodoRepository,
  todoRepositoryProvider,
} from './domain/repositories/TodoRepository'
import { DatabaseModule } from '@modules/database/database.module'
import { TodoController } from './application/controllers/todo.controller'
import { TodoService } from './application/services/todo.service'

@Module({
  imports: [ DatabaseModule],
  controllers: [TodoController],
  providers: [TodoService, ...todoRepositoryProvider, TodoRepository],
  exports: [],
})

export class TodoModule {}