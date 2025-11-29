import { Context, Next } from 'hono'

type AuthEnv = {
    ADMIN_USERNAME?: string
    ADMIN_PASSWORD?: string
}

/**
 * Timing-safe string comparison to prevent timing attacks.
 * Always compares all characters regardless of where differences occur.
 */
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
        // Still do a comparison to maintain constant time
        let result = 0
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ a.charCodeAt(i)
        }
        return false
    }

    let result = 0
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }
    return result === 0
}

/**
 * HTTP Basic Authentication middleware for admin routes.
 * Validates credentials against ADMIN_USERNAME and ADMIN_PASSWORD environment variables.
 */
export function basicAuth<E extends { Bindings: AuthEnv }>() {
    return async (c: Context<E>, next: Next) => {
        const expectedUsername = c.env.ADMIN_USERNAME
        const expectedPassword = c.env.ADMIN_PASSWORD

        // If credentials are not configured, deny access
        if (!expectedUsername || !expectedPassword) {
            console.error('Admin credentials not configured')
            return c.json({ error: 'Admin access not configured' }, 503)
        }

        const authHeader = c.req.header('Authorization')

        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return c.text('Unauthorized', 401, {
                'WWW-Authenticate': 'Basic realm="Admin Area"',
            })
        }

        try {
            // Decode Base64 credentials
            const base64Credentials = authHeader.slice(6) // Remove 'Basic '
            const credentials = atob(base64Credentials)
            const [username, password] = credentials.split(':')

            // Validate credentials using timing-safe comparison
            const usernameValid = timingSafeEqual(
                username || '',
                expectedUsername
            )
            const passwordValid = timingSafeEqual(
                password || '',
                expectedPassword
            )

            if (usernameValid && passwordValid) {
                await next()
            } else {
                return c.text('Unauthorized', 401, {
                    'WWW-Authenticate': 'Basic realm="Admin Area"',
                })
            }
        } catch {
            // Invalid Base64 or other parsing error
            return c.text('Unauthorized', 401, {
                'WWW-Authenticate': 'Basic realm="Admin Area"',
            })
        }
    }
}
