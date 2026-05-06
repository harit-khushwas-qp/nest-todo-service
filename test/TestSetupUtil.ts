import {INestApplication, ValidationPipe} from '@nestjs/common'
import {Test, TestingModule} from '@nestjs/testing'
import {AppModule} from '@src/app.module'

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

const closeApp = async (testApp: ITestApp): Promise<void> => {
  await testApp.app.close()
}

export const testSetupUtil = {
  startTestApp,
  closeApp,
}
