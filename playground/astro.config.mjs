import { defineConfig } from 'astro/config';
import consent from '@krysmalskipl/astro-consent-mode';

// Test other layouts: BANNER=modal npm run dev (box-left, box-right, box-center, box-wide, cloud, bar-bottom, bar-top, modal)
export default defineConfig({
  base: process.env.BASE || '/',
  outDir: process.env.OUT_DIR || './dist',
  integrations: [
    consent({
      gtmId: 'GTM-TEST123',
      metaPixelId: '1234567890',
      clarityId: 'abcdef1234',
      mode: 'basic',
      banner: process.env.BANNER || 'box-left',
    }),
  ],
});
