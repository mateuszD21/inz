import { defineConfig } from '@prisma/client'

export default defineConfig({
  adapter: {
    driver: 'pg',
    url: process.env.DATABASE_URL,
  },
})