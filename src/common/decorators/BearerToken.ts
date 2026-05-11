import {createParamDecorator, ExecutionContext} from '@nestjs/common'
import {AuthenticatedRequest} from '../../modules/auth/application/types/AuthenticatedRequest'

export const BearerToken = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const authHeader = request.headers?.authorization || ''
    return authHeader.replace('Bearer ', '').trim()
  },
)
