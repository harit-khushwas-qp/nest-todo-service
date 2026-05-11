import {Module} from '@nestjs/common'

import {
  TodoRepository,
  todoRepositoryProvider,
} from './domain/repositories/TodoRepository'
import {DatabaseModule} from '@modules/database/DatabaseModule'
import {TodoController} from './application/controllers/TodoController'
import {TodoService} from './application/services/TodoService'
import {AuthModule} from '@modules/auth/AuthModule'

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [TodoController],
  providers: [TodoService, ...todoRepositoryProvider, TodoRepository],
  exports: [],
})
export class TodoModule {}
