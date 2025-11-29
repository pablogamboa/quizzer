/**
 * Image service for managing uploads to Cloudflare R2.
 */

export interface ImageInfo {
    key: string
    url: string
    size: number
    uploaded: string
    contentType: string
}

export interface R2Env {
    IMAGES: R2Bucket
    R2_PUBLIC_URL?: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

/**
 * Generate a unique key for the uploaded image.
 * Format: YYYY/MM/uuid.ext
 */
function generateImageKey(filename: string, contentType: string): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')

    // Get extension from content type
    const extMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
    }
    const ext = extMap[contentType] || 'jpg'

    // Generate UUID
    const uuid = crypto.randomUUID()

    return `${year}/${month}/${uuid}.${ext}`
}

export class ImageService {
    private bucket: R2Bucket
    private publicUrl: string

    constructor(env: R2Env) {
        this.bucket = env.IMAGES
        // R2 public bucket URL - must be configured in Cloudflare dashboard
        // Format: https://pub-{hash}.r2.dev or custom domain
        this.publicUrl = env.R2_PUBLIC_URL || ''
    }

    /**
     * Upload an image to R2.
     * @param file The file to upload (from multipart form)
     * @returns The public URL of the uploaded image
     */
    async uploadImage(
        file: File,
        customKey?: string
    ): Promise<{ key: string; url: string }> {
        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            throw new Error(
                `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_TYPES.join(', ')}`
            )
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(
                `File too large: ${file.size} bytes. Maximum size: ${MAX_FILE_SIZE} bytes (5MB)`
            )
        }

        const key = customKey || generateImageKey(file.name, file.type)
        const arrayBuffer = await file.arrayBuffer()

        await this.bucket.put(key, arrayBuffer, {
            httpMetadata: {
                contentType: file.type,
            },
            customMetadata: {
                originalName: file.name,
                uploadedAt: new Date().toISOString(),
            },
        })

        const url = this.getPublicUrl(key)

        return { key, url }
    }

    /**
     * Get the public URL for an image key.
     */
    getPublicUrl(key: string): string {
        if (!this.publicUrl) {
            // Fallback to serving through the worker if no public URL configured
            return `/api/admin/images/${encodeURIComponent(key)}`
        }
        return `${this.publicUrl}/${key}`
    }

    /**
     * List all uploaded images.
     */
    async listImages(
        options: { limit?: number; cursor?: string } = {}
    ): Promise<{ images: ImageInfo[]; cursor?: string }> {
        const { limit = 100, cursor } = options

        const listed = await this.bucket.list({
            limit,
            cursor,
        })

        const images: ImageInfo[] = listed.objects.map((obj) => ({
            key: obj.key,
            url: this.getPublicUrl(obj.key),
            size: obj.size,
            uploaded: obj.uploaded.toISOString(),
            contentType: obj.httpMetadata?.contentType || 'image/jpeg',
        }))

        return {
            images,
            cursor: listed.truncated ? listed.cursor : undefined,
        }
    }

    /**
     * Get a single image's metadata.
     */
    async getImage(key: string): Promise<ImageInfo | null> {
        const obj = await this.bucket.head(key)

        if (!obj) {
            return null
        }

        return {
            key: obj.key,
            url: this.getPublicUrl(obj.key),
            size: obj.size,
            uploaded: obj.uploaded.toISOString(),
            contentType: obj.httpMetadata?.contentType || 'image/jpeg',
        }
    }

    /**
     * Get the raw image data (for serving through worker).
     */
    async getImageData(
        key: string
    ): Promise<{ body: ReadableStream; contentType: string } | null> {
        const obj = await this.bucket.get(key)

        if (!obj) {
            return null
        }

        return {
            body: obj.body,
            contentType: obj.httpMetadata?.contentType || 'image/jpeg',
        }
    }

    /**
     * Delete an image from R2.
     */
    async deleteImage(key: string): Promise<void> {
        await this.bucket.delete(key)
    }

    /**
     * Delete multiple images from R2.
     */
    async deleteImages(keys: string[]): Promise<void> {
        await this.bucket.delete(keys)
    }
}
