import {IAppConfig} from './IAppConfig'

export const loadAppConfig = (): IAppConfig => {
  const config: IAppConfig = {
    app: {
      port: parseInt(process.env.PORT!),
    },
    database: {
      host: process.env.DB_HOST!,
      port: parseInt(process.env.DB_PORT!, 10),
      username: process.env.DB_USERNAME!,
      password: process.env.DB_PASSWORD!,
      databaseName: process.env.DB_NAME!,
    },
  }

  return config
}
