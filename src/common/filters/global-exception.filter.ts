import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import {Request, Response} from 'express'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp()
    const response = context.getResponse<Response>()
    const request = context.getRequest<Request>()

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: this.getMessage(exception),
    })
  }

  private getMessage(exception: unknown): string | string[] | object {
    if (exception instanceof HttpException) {
      const response = exception.getResponse()
      if (typeof response === 'string') {
        return response
      }
      return response
    }

    if (exception instanceof Error) {
      return exception.message
    }

    return 'Internal server error'
  }
}
