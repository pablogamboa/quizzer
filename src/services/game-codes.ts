/**
 * Game Code Service
 * Generates and manages short game codes for multiplayer sessions
 */

export interface GameCodeData {
    gameId: string
    createdAt: number
    expiresAt: number
}

export class GameCodeService {
    private kv: KVNamespace

    constructor(kv: KVNamespace) {
        this.kv = kv
    }

    /**
     * Generate a random 6-character alphanumeric game code
     * Format: ABC123 (uppercase letters and numbers)
     */
    generateCode(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude similar looking chars (I, O, 1, 0)
        let code = ''
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return code
    }

    /**
     * Validate game code format
     */
    validateCode(code: string): boolean {
        return /^[A-Z0-9]{6}$/.test(code)
    }

    /**
     * Store game code in KV
     * TTL: 24 hours (86400 seconds)
     */
    async storeGameCode(
        code: string,
        gameId: string,
        ttlSeconds: number = 86400
    ): Promise<void> {
        const data: GameCodeData = {
            gameId,
            createdAt: Date.now(),
            expiresAt: Date.now() + ttlSeconds * 1000,
        }

        await this.kv.put(`game:code:${code}`, JSON.stringify(data), {
            expirationTtl: ttlSeconds,
        })
    }

    /**
     * Get game ID from code
     */
    async getGameIdFromCode(code: string): Promise<string | null> {
        if (!this.validateCode(code)) {
            return null
        }

        const data = await this.kv.get(`game:code:${code}`, 'text')
        if (!data) {
            return null
        }

        try {
            const parsed: GameCodeData = JSON.parse(data)
            return parsed.gameId
        } catch (error) {
            console.error('Error parsing game code data:', error)
            return null
        }
    }

    /**
     * Check if code exists
     */
    async codeExists(code: string): Promise<boolean> {
        const gameId = await this.getGameIdFromCode(code)
        return gameId !== null
    }

    /**
     * Generate a unique code that doesn't exist in KV
     * Tries up to 10 times before giving up
     */
    async generateUniqueCode(): Promise<string> {
        const maxAttempts = 10

        for (let i = 0; i < maxAttempts; i++) {
            const code = this.generateCode()
            const exists = await this.codeExists(code)

            if (!exists) {
                return code
            }
        }

        throw new Error(
            'Failed to generate unique game code after multiple attempts'
        )
    }

    /**
     * Delete game code from KV
     */
    async deleteGameCode(code: string): Promise<void> {
        await this.kv.delete(`game:code:${code}`)
    }

    /**
     * Get all game codes (for debugging/admin purposes)
     * Note: KV list operations can be slow, use sparingly
     */
    async listAllCodes(limit: number = 100): Promise<string[]> {
        const list = await this.kv.list({ prefix: 'game:code:', limit })
        return list.keys.map((key) => key.name.replace('game:code:', ''))
    }
}
