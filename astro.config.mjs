// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },

  site: 'https://www.glasstech.com',

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare(),
});