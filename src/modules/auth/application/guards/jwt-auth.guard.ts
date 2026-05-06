import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import {AuthService} from '../services/auth.service'
import {IAuthenticatedRequest} from '@modules/todo/application/types/AuthenticatedRequest'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<IAuthenticatedRequest>()
    const authHeader = request.headers?.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization token')
    }

    const token = authHeader.replace('Bearer ', '').trim()
    const payload = this.authService.verifyToken(token)
    request.user = {
      userId: payload.sub,
      username: payload.username,
      name: payload.name,
    }
    return true
  }
}
