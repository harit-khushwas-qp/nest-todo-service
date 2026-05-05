import { Module } from "@nestjs/common";
import { databaseProviders } from "./providers/database.providers";
import {
  TodoRepository,
  todoRepositoryProvider,
} from "@modules/todo/domain/repositories/TodoRepository";

@Module({
    imports: [],
    controllers: [],
    providers: [...databaseProviders, ...todoRepositoryProvider, TodoRepository],
    exports: [...databaseProviders, TodoRepository],
})
export class DatabaseModule { }