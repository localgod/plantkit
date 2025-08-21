import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
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
