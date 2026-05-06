import { Module } from '@nestjs/common'

import {
  TodoRepository,
  todoRepositoryProvider,
} from './domain/repositories/TodoRepository'
import { DatabaseModule } from '@modules/database/database.module'
import { TodoController } from './application/controllers/todo.controller'
import { TodoListController } from './application/controllers/todo-list.controller'
import { TodoService } from './application/services/todo.service'
import { AuthModule } from '@modules/auth/auth.module'

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [TodoController, TodoListController],
  providers: [TodoService, ...todoRepositoryProvider, TodoRepository],
  exports: [],
})

export class TodoModule {}
