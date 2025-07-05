import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      config: {
        content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
        darkMode: 'class',
        theme: { extend: {} },
        plugins: [],
      },
      postcss: {
        plugins: {
          tailwindcss: {},
          autoprefixer: {},
        },
      },
    }),
  ],
})
