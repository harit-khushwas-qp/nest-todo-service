export interface IAppConfig {
  app: {
    port: number
  }
  database: {
    host: string
    port: number
    username: string
    password: string
    databaseName: string
  }
}
