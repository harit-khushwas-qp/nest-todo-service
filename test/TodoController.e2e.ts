import {TodoDto} from '@modules/todo/application/dtos/TodoDto'
import {ITestApp, testSetupUtil} from './TestSetupUtil'
import request from 'supertest'

describe('TodoController (e2e)', () => {
  let testApp: ITestApp

  beforeEach(async () => {
    testApp = await testSetupUtil.startTestApp()
  })

  afterEach(async () => {
    await testSetupUtil.closeApp(testApp)
  })

  describe('POST /todos', () => {
    test('should create a new todo', async () => {
      const createTodo: TodoDto = {title: 'Test Todo'}
      const response = await request(testApp.app.getHttpServer())
        .post('/todos')
        .send(createTodo)
      expect(response.status).toBe(201)
    })
  })
})
