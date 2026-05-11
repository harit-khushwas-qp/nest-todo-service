import {INestApplication, ValidationPipe} from '@nestjs/common'
import {Test, TestingModule} from '@nestjs/testing'
import {AppModule} from '@src/AppModule'
import {DataSource} from 'typeorm'

export interface ITestApp {
  app: INestApplication
  moduleRef: TestingModule
}

const startTestApp = async (): Promise<ITestApp> => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  const app = moduleRef.createNestApplication()
  app.useGlobalPipes(new ValidationPipe())
  await app.init()

  return {
    app,
    moduleRef,
  }
}

const closeApp = async (testApp?: ITestApp): Promise<void> => {
  if (!testApp) {
    return
  }

  const dataSource = testApp.moduleRef.get<DataSource>('DATA_SOURCE')
  if (dataSource.isInitialized) {
    await dataSource.destroy()
  }
  await testApp.app.close()
}

export const testSetupUtil = {
  startTestApp,
  closeApp,
}
