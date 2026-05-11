import {execSync} from 'child_process'
import * as path from 'path'

module.exports = async (): Promise<void> => {
  console.log('🏁 GLOBAL TEARDOWN START')

  try {
    const dockerComposePath = path.join(
      __dirname,
      '..',
      'docker-compose.test.yml',
    )
    console.log('🚀 Starting MySQL test container...')
    // Start the container using docker-compose
    execSync(`docker-compose -f ${dockerComposePath} down`, {
      encoding: 'utf8',
    })
  } catch (error) {
    console.error('❌ Error starting Docker container:', error)
    throw new Error('Failed to start MySQL Docker container')
  }

  console.log('✅ GLOBAL TEARDOWN END')
}
