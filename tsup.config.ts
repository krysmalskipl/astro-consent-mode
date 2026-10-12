import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    platform: 'node',
    target: 'node18',
    clean: true,
    external: [
      'astro',
      'astro/config',
      'vanilla-cookieconsent',
      'virtual:astro-consent-mode/config',
      'vanilla-cookieconsent/dist/cookieconsent.css',
      'vanilla-cookieconsent/dist/cookieconsent.css?inline',
    ],
  },
  {
    entry: ['src/client.ts'],
    format: ['esm'],
    dts: false,
    platform: 'browser',
    target: 'es2022',
    clean: false,
    external: [
      'astro',
      'astro/config',
      'vanilla-cookieconsent',
      'virtual:astro-consent-mode/config',
      'vanilla-cookieconsent/dist/cookieconsent.css',
      'vanilla-cookieconsent/dist/cookieconsent.css?inline',
    ],
  },
]);
