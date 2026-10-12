declare module 'virtual:astro-consent-mode/config' {
  import type { ClientConfig } from './types';
  const config: ClientConfig;
  export default config;
}

declare module '*.css?inline' {
  const css: string;
  export default css;
}
