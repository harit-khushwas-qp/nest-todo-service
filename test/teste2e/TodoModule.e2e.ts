import request = require('supertest')
import {ITestApp, testSetupUtil} from '@test/TestSetupUtil'

describe('TodoModule (e2e)', () => {
  let testApp: ITestApp
  let accessToken: string

  const authHeader = (): string => `Bearer ${accessToken}`
  const bearerToken = (token: string): string => `Bearer ${token}`

  const loginAs = async (
    username: string,
    password: string,
  ): Promise<string> => {
    const response = await request(testApp.app.getHttpServer())
      .post('/auth/login')
      .send({username, password})
      .expect(201)

    return response.body.accessToken
  }

  beforeEach(async () => {
    testApp = await testSetupUtil.startTestApp()
    accessToken = await loginAs('admin', 'password123')
  })

  afterEach(async () => {
    await testSetupUtil.closeApp(testApp)
  })

  test('should reject todo requests without a bearer token', async () => {
    const response = await request(testApp.app.getHttpServer()).get('/todos')

    expect(response.status).toBe(401)
  })

  test('should create, read, update, and delete a todo', async () => {
    const created = await request(testApp.app.getHttpServer())
      .post('/todos')
      .set('Authorization', authHeader())
      .send({
        title: 'Write e2e tests',
        description: 'Cover todo lifecycle',
        priority: 'high',
      })
      .expect(201)

    expect(created.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        title: 'Write e2e tests',
        description: 'Cover todo lifecycle',
        priority: 'high',
        completed: false,
      }),
    )

    const todoId = created.body.id

    const fetched = await request(testApp.app.getHttpServer())
      .get(`/todos/${todoId}`)
      .set('Authorization', authHeader())
      .expect(200)

    expect(fetched.body.title).toBe('Write e2e tests')

    const updated = await request(testApp.app.getHttpServer())
      .put(`/todos/${todoId}`)
      .set('Authorization', authHeader())
      .send({completed: true, priority: 'medium'})
      .expect(200)

    expect(updated.body).toEqual(
      expect.objectContaining({
        id: todoId,
        completed: true,
        priority: 'medium',
      }),
    )

    await request(testApp.app.getHttpServer())
      .delete(`/todos/${todoId}`)
      .set('Authorization', authHeader())
      .expect(200)

    await request(testApp.app.getHttpServer())
      .get(`/todos/${todoId}`)
      .set('Authorization', authHeader())
      .expect(404)
  })

  test('should reject todo creation when title is missing', async () => {
    const response = await request(testApp.app.getHttpServer())
      .post('/todos')
      .set('Authorization', authHeader())
      .send({description: 'Title is required'})
      .expect(400)

    expect(response.body.statusCode).toBe(400)
  })

  test('should not expose one user todo to another user', async () => {
    const adminTodo = await request(testApp.app.getHttpServer())
      .post('/todos')
      .set('Authorization', authHeader())
      .send({title: 'Admin private todo'})
      .expect(201)

    const userToken = await loginAs('user', 'password')

    const userTodos = await request(testApp.app.getHttpServer())
      .get('/todos')
      .set('Authorization', bearerToken(userToken))
      .expect(200)

    expect(userTodos.body).toEqual([])

    await request(testApp.app.getHttpServer())
      .get(`/todos/${adminTodo.body.id}`)
      .set('Authorization', bearerToken(userToken))
      .expect(404)
  })
})
