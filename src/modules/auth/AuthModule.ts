import {Module} from '@nestjs/common'
import {DatabaseModule} from '@modules/database/DatabaseModule'
import {AuthController} from './application/controllers/AuthController'
import {AuthService} from './application/services/AuthService'
import {userRepositoryProvider} from './domain/repositories/UserRepository'
import {UserRepository} from './domain/repositories/UserRepository'

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    ...userRepositoryProvider,
    UserRepository,
  ],
  exports: [AuthService],
})
export class AuthModule {}
