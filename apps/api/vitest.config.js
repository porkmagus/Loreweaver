import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig({
    root: __dirname,
    test: {
        globals: true,
        environment: 'node',
        pool: 'forks',
        include: ['src/**/*.test.ts'],
        exclude: ['dist/**', 'node_modules/**'],
    },
});
//# sourceMappingURL=vitest.config.js.map