import {createParamDecorator, ExecutionContext} from '@nestjs/common'
import {AuthenticatedRequest} from '../../modules/auth/application/types/AuthenticatedRequest'
import {AuthenticatedUser} from '../../modules/auth/application/types/AuthenticatedUser'

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    return request.user
  },
)
