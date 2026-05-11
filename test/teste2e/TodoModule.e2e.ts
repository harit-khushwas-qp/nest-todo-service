import request = require('supertest')
import {ITestApp, testSetupUtil} from '@test/TestSetupUtil'

describe('TodoModule (e2e)', () => {
  let testApp: ITestApp
  let accessToken: string

  const authHeader = (): string => `Bearer ${accessToken}`

  beforeEach(async () => {
    testApp = await testSetupUtil.startTestApp()

    const response = await request(testApp.app.getHttpServer())
      .post('/auth/login')
      .send({username: 'admin', password: 'password123'})
      .expect(201)

    accessToken = response.body.accessToken
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
})
