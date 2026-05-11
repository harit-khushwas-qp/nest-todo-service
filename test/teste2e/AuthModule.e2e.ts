import request = require('supertest')
import {ITestApp, testSetupUtil} from '@test/TestSetupUtil'

describe('AuthModule (e2e)', () => {
  let testApp: ITestApp

  beforeEach(async () => {
    testApp = await testSetupUtil.startTestApp()
  })

  afterEach(async () => {
    await testSetupUtil.closeApp(testApp)
  })

  it('should login with valid default user credentials', async () => {
    const response = await request(testApp.app.getHttpServer())
      .post('/auth/login')
      .send({username: 'admin', password: 'password123'})
      .expect(201)

    expect(response.body).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(Number),
          username: 'admin',
          name: 'Administrator',
        }),
      }),
    )
  })

  it('should reject login with invalid credentials', async () => {
    const response = await request(testApp.app.getHttpServer())
      .post('/auth/login')
      .send({username: 'admin', password: 'wrong-password'})
      .expect(401)

    expect(response.body.statusCode).toBe(401)
  })

  test('should reject logout without a bearer token', async () => {
    const response = await request(testApp.app.getHttpServer())
      .post('/auth/logout')
      .expect(401)

    expect(response.body.statusCode).toBe(401)
  })

  test('should logout and reject the revoked token afterward', async () => {
    const loginResponse = await request(testApp.app.getHttpServer())
      .post('/auth/login')
      .send({username: 'user', password: 'password'})
      .expect(201)

    const accessToken = loginResponse.body.accessToken

    await request(testApp.app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201)

    await request(testApp.app.getHttpServer())
      .get('/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401)
  })
})
