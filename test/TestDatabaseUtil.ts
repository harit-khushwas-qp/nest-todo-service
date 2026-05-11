import * as mysql from 'mysql2/promise'
import {execSync} from 'child_process'
import * as path from 'path'

interface IDatabaseConnectionInfo {
  host: string
  port: number
  username: string
  password: string
  connectTimeout?: number // Optional connection timeout
}

// Helper function to get required environment variable or throw error
const getRequiredEnvVar = (varName: string): string => {
  const value = process.env[varName]
  if (!value) {
    throw new Error(`Required environment variable ${varName} is not set`)
  }
  return value
}

// Helper function to get required environment variable as number or throw error
const getRequiredEnvVarAsNumber = (varName: string): number => {
  const value = process.env[varName]
  if (!value) {
    throw new Error(`Required environment variable ${varName} is not set`)
  }
  const numValue = parseInt(value, 10)
  if (isNaN(numValue)) {
    throw new Error(
      `Environment variable ${varName} must be a valid number, got: ${value}`,
    )
  }
  return numValue
}

const getConnectionHost = (): string => {
  return getRequiredEnvVar('DB_HOST')
}

const getConnectionPort = (): number => {
  return getRequiredEnvVarAsNumber('DB_PORT')
}

const getContainerName = (): string => {
  return 'mysql-todo-test'
}

const getRootConnectionInfo = (): IDatabaseConnectionInfo => {
  return {
    host: getConnectionHost(),
    port: getConnectionPort(),
    username: getRequiredEnvVar('DATABASE_ROOT_USERNAME'),
    password: getRequiredEnvVar('DATABASE_ROOT_PASSWORD'),
  }
}

export async function stopDockerContainer(): Promise<boolean> {
  try {
    const dockerComposePath = path.join(
      __dirname,
      '..',
      'docker-compose.test.yml',
    )
    console.log('🛑 Stopping MySQL test container...')

    execSync(`docker-compose -f ${dockerComposePath} down -v`, {
      encoding: 'utf8',
    })
    console.log('✅ MySQL test container stopped and volumes removed')
    return true
  } catch (error) {
    console.error('❌ Error stopping Docker container:', error)
    return false
  }
}

async function isDockerContainerRunning(
  containerName: string,
): Promise<boolean> {
  try {
    const result = execSync(
      `docker ps --filter "name=${containerName}" --format "{{.Names}}"`,
      {encoding: 'utf8'},
    )
    return result.trim().includes(containerName)
  } catch (error) {
    console.log('⚠️  Error checking Docker container status:', error)
    return false
  }
}

async function startDockerContainer(): Promise<boolean> {
  try {
    const dockerComposePath = path.join(
      __dirname,
      '..',
      'docker-compose.test.yml',
    )
    console.log('🚀 Starting MySQL test container...')
    // Start the container using docker-compose
    execSync(`docker-compose -f ${dockerComposePath} up -d mysql-todo-test`, {
      encoding: 'utf8',
    })

    // Wait for the container to be healthy
    console.log('⏳ Waiting 1 min for MySQL container to be ready...')
    await new Promise(resolve => setTimeout(resolve, 30000)) // Wait up to 1 minutes for the container to be ready
    let retries = 12 // 12 retries with 10-second intervals = 120 seconds max
    while (retries > 0) {
      try {
        console.log('🔄 Checking MySQL container health...')
        // Try to connect to the database using root credentials
        const connection = await createConnection(getRootConnectionInfo())
        await connection.ping()
        await connection.end()
        console.log('✅ MySQL container is ready!')
        return true
      } catch (error) {
        retries--
        if (retries === 0) {
          console.error(
            '❌ MySQL container failed to become ready within timeout',
            error,
          )
          return false
        }
        await new Promise(resolve => setTimeout(resolve, 10000)) // Wait 10 seconds
      }
    }

    return false
  } catch (error) {
    console.error('❌ Error starting Docker container:', error)
    return false
  }
}

async function createConnection(
  info: IDatabaseConnectionInfo,
): Promise<mysql.Connection> {
  const connectionInfo = info
  console.log(
    `🔌 Trying to connect to MySQL at ${connectionInfo.host}:${connectionInfo.port} with user ${connectionInfo.username}...`,
  )
  try {
    return await mysql.createConnection({
      host: connectionInfo.host,
      port: connectionInfo.port,
      user: connectionInfo.username,
      password: connectionInfo.password,
      connectTimeout: connectionInfo.connectTimeout || 15000, // Increase timeout to 15 seconds
      // Add other connection settings that might help with stability
      timezone: 'Z',
      multipleStatements: true,
    })
  } catch (error) {
    console.error(
      `❌ Failed to connect to MySQL at ${connectionInfo.host}:${connectionInfo.port}:`,
      error,
    )
    throw error
  }
}

export const ensureDockerContainerRunning = async (): Promise<boolean> => {
  const containerName = getContainerName()

  const isRunning = await isDockerContainerRunning(containerName)
  if (isRunning) {
    console.log('✅ MySQL test container is already running')
    return true
  }

  console.log('🚀 MySQL test container is not running, starting it...')
  return await startDockerContainer()
}

