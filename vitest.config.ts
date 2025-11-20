import { defineConfig } from 'vitest/config'
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
    test: {
        include: ['tests/unit/**/*.test.ts'],
        poolOptions: {
            workers: {
                // Use test-specific wrangler config without DO script_name
                wrangler: { configPath: './wrangler.test.toml' },
            },
        },
    },
})
