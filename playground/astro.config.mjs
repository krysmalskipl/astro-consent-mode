import { defineConfig } from 'astro/config';
import consent from '@krysmalskipl/astro-consent-mode';

export default defineConfig({
  outDir: './dist-shot',
  integrations: [
    consent({
      gtmId: 'GTM-TEST123',
      lang: 'en',
      badge: '🍪 Cookies',
      badgePosition: 'bottom-left',
    }),
  ],
});
