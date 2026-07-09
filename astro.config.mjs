import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://nishant-yadav.github.io/sky-brewing-company',
  base: '/sky-brewing-company/',
  integrations: [tailwind()],
});
