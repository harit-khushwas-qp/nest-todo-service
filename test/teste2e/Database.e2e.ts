import {DataSource} from 'typeorm'
import {ITestApp, testSetupUtil} from '@test/TestSetupUtil'

describe('DatabaseModule (e2e)', () => {
  let testApp: ITestApp

  beforeEach(async () => {
    testApp = await testSetupUtil.startTestApp()
  })

  afterEach(async () => {
    await testSetupUtil.closeApp(testApp)
  })

  test('should initialize the database connection and entity metadata', async () => {
    const dataSource = testApp.moduleRef.get<DataSource>('DATA_SOURCE')

    expect(dataSource.isInitialized).toBe(true)
    expect(dataSource.hasMetadata('UserEntity')).toBe(true)
    expect(dataSource.hasMetadata('TodoEntity')).toBe(true)
    await expect(dataSource.query('SELECT 1 AS result')).resolves.toEqual([
      {result: '1'},
    ])
  })
})
