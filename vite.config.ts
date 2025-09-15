import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            filename: 'sw.js',
            strategies: 'generateSW',
            workbox: {
                maximumFileSizeToCacheInBytes: 5242880,
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,jpg}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.bunny\.net\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    }
                ]
            },
            includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'logo.svg'],
            manifest: {
                name: 'Boilerplate',
                short_name: 'Boilerplate',
                description: 'Laravel 12 Boilerplate with PWA support',
                start_url: '/',
                scope: '/',
                display: 'standalone',
                background_color: '#ffffff',
                theme_color: '#333333',
                orientation: 'portrait-primary',
                categories: ['productivity', 'utilities'],
                lang: 'en',
                icons: [
                    { src: '/icons/pwa-64x64.png', sizes: '64x64', type: 'image/png' },
                    { src: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
                    { src: '/icons/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                    { src: '/icons/android-icon-48.png', sizes: '48x48', type: 'image/png', purpose: 'any' },
                    { src: '/icons/android-icon-72.png', sizes: '72x72', type: 'image/png', purpose: 'any' },
                    { src: '/icons/android-icon-96.png', sizes: '96x96', type: 'image/png', purpose: 'any' },
                    { src: '/icons/android-icon-128.png', sizes: '128x128', type: 'image/png', purpose: 'any' },
                    { src: '/icons/android-icon-144.png', sizes: '144x144', type: 'image/png', purpose: 'any' },
                    { src: '/icons/android-icon-152.png', sizes: '152x152', type: 'image/png', purpose: 'any' },
                    { src: '/icons/android-icon-384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
                ],
            },
        }),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'resources/js'),
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
});
