import { Module } from '@nestjs/common'
import { DatabaseModule } from '@modules/database/database.module'
import { AuthController } from './application/controllers/auth.controller'
import { AuthService } from './application/services/auth.service'
import { JwtAuthGuard } from './application/guards/jwt-auth.guard'
import { userRepositoryProvider } from './domain/repositories/UserRepository'
import { UserRepository } from './domain/repositories/UserRepository'

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, ...userRepositoryProvider, UserRepository],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
