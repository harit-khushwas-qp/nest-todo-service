import {createParamDecorator, ExecutionContext} from '@nestjs/common'
import {Request} from 'express'

export const BearerToken = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<Request>()
    const authHeader = request.headers?.authorization || ''
    return authHeader.replace('Bearer ', '').trim()
  },
)
