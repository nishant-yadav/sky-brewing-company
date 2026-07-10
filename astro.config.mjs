import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/edge';

const basePath = process.env.SITE_BASE || '/';
const siteUrl = process.env.SITE_URL || 'https://sky-brewing-company.vercel.app';

export default defineConfig({
  site: siteUrl,
  base: basePath,
  output: 'hybrid',
  adapter: vercel(),
  integrations: [tailwind()],
});
