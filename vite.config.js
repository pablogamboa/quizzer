import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { createHtmlPlugin } from 'vite-plugin-html'
import { resolve } from 'path'

export default defineConfig({
    plugins: [
        svelte(),
        viteStaticCopy({
            targets: [
                {
                    src: 'og_image.png',
                    dest: '.',
                },
                {
                    src: 'og_image_twitter.png',
                    dest: '.',
                },
            ],
        }),
        createHtmlPlugin({
            minify: true,
        }),
    ],
    publicDir: false, // Disable public directory to avoid conflicts
    build: {
        outDir: 'public',
        emptyOutDir: true,
        minify: 'esbuild',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                admin: resolve(__dirname, 'admin/index.html'),
            },
            output: {
                entryFileNames: 'assets/[name].[hash].js',
                chunkFileNames: 'assets/[name].[hash].js',
                assetFileNames: 'assets/[name].[hash].[ext]',
            },
        },
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:8787',
                changeOrigin: true,
            },
        },
    },
})
