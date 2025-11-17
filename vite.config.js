// remove sass warning in terminal
import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', // Используем новый API
        silenceDeprecations: ['legacy-js-api', 'global-builtin'],
      },
    },
  },
});