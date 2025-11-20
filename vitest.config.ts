import { defineConfig } from 'vitest/config'
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
    test: {
        include: ['tests/unit/**/*.test.ts'],
        poolOptions: {
            workers: {
                wrangler: { configPath: './wrangler.toml' },
            },
        },
    },
})
