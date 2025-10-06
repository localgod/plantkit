import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'json'],
      exclude: [
        'examples/**',
        'scripts/**',
        'dist/**',
        'node_modules/**',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  }
});
