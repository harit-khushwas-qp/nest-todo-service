import * as dotenv from 'dotenv'
import {join} from 'path'

let isLoaded = false

/**
 * Load environment variables for tests
 * This function is idempotent - it will only load once
 */
export function loadTestEnvironment(): void {
  if (isLoaded) {
    return
  }

  const environment = process.env.ENVIRONMENT || 'test'
  process.env.ENVIRONMENT = environment

  // For local testing, load the test environment file
  const envFilePath = join(
    __dirname,
    '..',
    '..',
    'src',
    'config',
    `.env.${environment}`,
  )
  console.log(`🔧 Loading environment from: ${envFilePath}`)
  dotenv.config({path: envFilePath})
  isLoaded = true
}

/**
 * Reset the loader state (useful for testing)
 */
export function resetTestEnvironment(): void {
  isLoaded = false
}

/**
 * Namespace export for backward compatibility
 */
export const testEnvLoader = {
  loadTestEnvironment,
  resetTestEnvironment,
}
