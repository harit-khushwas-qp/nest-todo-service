import {Module} from '@nestjs/common'
import {ConfigModule} from '@nestjs/config'
import {TodoModule} from './modules/todo/TodoModule'
import {AuthModule} from './modules/auth/AuthModule'
import {loadAppConfig} from './config/loadAppConfig'
import {resolve} from 'path'

const environment = process.env.ENVIRONMENT?.trim() || 'development'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `src/config/.env.${environment}`,

      load: [loadAppConfig],
    }),
    AuthModule,
    TodoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
