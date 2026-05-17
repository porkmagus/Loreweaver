import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
export default defineConfig({
    plugins: [react()],
    server: {
        port: Number(process.env.WEB_PORT ?? 5173),
        host: '0.0.0.0',
        proxy: {
            '/api': {
                target: process.env.VITE_API_URL ?? 'http://localhost:3001',
                changeOrigin: true,
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
//# sourceMappingURL=vite.config.js.map