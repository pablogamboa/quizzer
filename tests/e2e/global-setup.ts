// @ts-nocheck
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function globalSetup() {
    console.log('🧹 Clearing test database...')

    try {
        // Clear hall of fame data before tests (use 'quizzer' - the main db binding name)
        await execAsync(
            'npx wrangler d1 execute quizzer --local --command="DELETE FROM hall_of_fame"'
        )
        console.log('✅ Database cleared successfully')
    } catch (error) {
        console.error('⚠️ Failed to clear database:', error)
        // Don't fail the tests if cleanup fails
    }
}

export default globalSetup
