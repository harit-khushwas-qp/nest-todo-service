import {Test, TestingModule} from '@nestjs/testing'
import {INestApplication, HttpStatus} from '@nestjs/common'
import request from 'supertest'
import {App} from 'supertest/types'
import {AppModule} from './../src/app.module'

describe('App E2E Tests', () => {
  let app: INestApplication<App>

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('AppController', () => {
    it('/ (GET) - should return Hello World', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(HttpStatus.OK)
        .expect('Hello World!')
    })

    it('/ (GET) - should have correct response type', async () => {
      const response = await request(app.getHttpServer()).get('/')

      expect(typeof response.text).toBe('string')
      expect(response.text).toBe('Hello World!')
    })
  })

  describe('TodoController - POST /todos', () => {
    it('should create a new todo', async () => {
      const todoData = {
        title: 'Test Todo Item',
      }

      const response = await request(app.getHttpServer())
        .post('/todos')
        .send(todoData)
        .expect(HttpStatus.CREATED)

      expect(response.body).toHaveProperty('id')
      expect(response.body.title).toBe('Test Todo Item')
    })

    it('should reject todo with empty title', async () => {
      const todoData = {
        title: '',
      }

      await request(app.getHttpServer())
        .post('/todos')
        .send(todoData)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should reject todo with whitespace-only title', async () => {
      const todoData = {
        title: '   ',
      }

      await request(app.getHttpServer())
        .post('/todos')
        .send(todoData)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should reject missing title field', async () => {
      const todoData = {}

      await request(app.getHttpServer())
        .post('/todos')
        .send(todoData)
        .expect(HttpStatus.BAD_REQUEST)
    })
  })

  describe('TodoController - GET /todos/:id', () => {
    it('should return 404 for non-existent todo', async () => {
      await request(app.getHttpServer())
        .get('/todos/99999')
        .expect(HttpStatus.NOT_FOUND)
    })

    it('should reject non-numeric id parameter', async () => {
      await request(app.getHttpServer())
        .get('/todos/invalid')
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should accept numeric id', async () => {
      const response = await request(app.getHttpServer()).get('/todos/1')

      // Either finds it or returns 404, but should not return 400
      expect(
        [HttpStatus.OK, HttpStatus.NOT_FOUND].includes(response.status),
      ).toBe(true)
    })
  })

  describe('Integration Tests', () => {
    it('should create and retrieve a todo', async () => {
      const todoData = {
        title: 'Integration Test Todo',
      }

      const createResponse = await request(app.getHttpServer())
        .post('/todos')
        .send(todoData)
        .expect(HttpStatus.CREATED)

      const todoId = createResponse.body.id

      const getResponse = await request(app.getHttpServer())
        .get(`/todos/${todoId}`)
        .expect(HttpStatus.OK)

      expect(getResponse.body.id).toBe(todoId)
      expect(getResponse.body.title).toBe('Integration Test Todo')
    })

    it('should handle multiple todo creation', async () => {
      const todos = [{title: 'Todo 1'}, {title: 'Todo 2'}, {title: 'Todo 3'}]

      for (const todoData of todos) {
        await request(app.getHttpServer())
          .post('/todos')
          .send(todoData)
          .expect(HttpStatus.CREATED)
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid JSON gracefully', async () => {
      const response = await request(app.getHttpServer())
        .post('/todos')
        .send('invalid json')
        .set('Content-Type', 'application/json')

      expect([
        HttpStatus.BAD_REQUEST,
        HttpStatus.UNPROCESSABLE_ENTITY,
      ]).toContain(response.status)
    })

    it('should handle missing Content-Type header', async () => {
      const response = await request(app.getHttpServer())
        .post('/todos')
        .send({title: 'Test'})
        .unset('Content-Type')

      // Should still work with default or return appropriate error
      expect(response.status).toBeLessThan(500)
    })
  })
})
