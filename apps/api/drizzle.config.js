import { defineConfig } from 'drizzle-kit';
export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL ?? 'postgresql://loreweaver:loreweaver@postgres:5432/loreweaver',
    },
    breakpoints: true,
    verbose: true,
    strict: true,
});
//# sourceMappingURL=drizzle.config.js.map