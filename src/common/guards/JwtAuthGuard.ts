import {AuthService} from '@modules/auth/application/services/AuthService'
import {AuthenticatedRequest} from '@modules/auth/application/types/AuthenticatedRequest'
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
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
