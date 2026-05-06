import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TodoModule } from './modules/todo/todo.module';
import { AuthModule } from './modules/auth/auth.module';
import { loadAppConfig } from './config/loadAppConfig';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `src/config/.env.development`,
      load: [loadAppConfig],
    }),
    AuthModule,
    TodoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
