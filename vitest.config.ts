import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    resolve: {
        alias: [
          { find: /^async-context-tc39$/, replacement: resolve('./src/index.ts') },
          { find: /^async-context-tc39(.*)$/, replacement: resolve('./src/$1.ts') },
        ],
      },
      test: {
        name: 'async-context-tc39',
        globals: true,
        coverage: {
          include: ['src/**/'],
          reporter: ['text', 'json', 'html', 'text-summary'],
          reportsDirectory: './coverage/',
          provider: 'v8',
        },
        dir: 'tests',
        reporters: process.env.GITHUB_ACTIONS
          ? ['default', 'github-actions']
          : ['default'],
      },
})