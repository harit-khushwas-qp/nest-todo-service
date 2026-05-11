import {NestFactory} from '@nestjs/core'
import {AppModule} from './AppModule'
import {ValidationPipe} from '@nestjs/common'
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger'
import {GlobalExceptionFilter} from './common/filters/global-exception.filter'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)

  // Global pipes
  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new GlobalExceptionFilter())

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Backend API')
    .setDescription('The backend API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {type: 'http', scheme: 'bearer', bearerFormat: 'JWT'},
      'access-token',
    )
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })

  const port = process.env.PORT ?? 3000
  await app.listen(port)
}

bootstrap()
