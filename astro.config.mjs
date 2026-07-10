import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://nishant-yadav.github.io/sky-brewing-company',
  base: '/sky-brewing-company/',
  output: 'hybrid',
  adapter: vercel(),
  integrations: [tailwind()],
});
