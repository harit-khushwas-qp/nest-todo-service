import {createParamDecorator, ExecutionContext} from '@nestjs/common'
import {AuthenticatedUserDto} from '@modules/auth/application/dtos/AuthenticatedUserDto'
import {Request} from 'express'

type AuthenticatedRequest = Request & {user: AuthenticatedUserDto}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUserDto => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    return request.user
  },
)
