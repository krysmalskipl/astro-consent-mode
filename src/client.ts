import css from 'vanilla-cookieconsent/dist/cookieconsent.css?inline';
import * as CookieConsent from 'vanilla-cookieconsent';
import config from 'virtual:astro-consent-mode/config';

// Banner styles are injected at runtime, so the project does not need to link any CSS file.
if (typeof document !== 'undefined' && !document.getElementById('acm-style')) {
  const style = document.createElement('style');
  style.id = 'acm-style';
  style.textContent = css;
  document.head.prepend(style);
}

declare global {
  interface Window {
    __acm?: {
      apply: (categories: string[]) => void;
    };
  }
}

/**
 * Programmatically shows the cookie preferences modal.
 */
export function showPreferences(): void {
  if (typeof window !== 'undefined') {
    CookieConsent.showPreferences();
  }
}

// Build dynamic categories based on configured services
const categories: Record<string, CookieConsent.Category> = {
  necessary: {
    enabled: true,
    readOnly: true,
  },
};

if (config.hasAnalytics) {
  categories.analytics = {
    autoClear: {
      cookies: [
        { name: /^_ga/ },
        { name: '_gid' },
        { name: /^_gat/ },
        { name: /^_clck/ },
        { name: /^_clsk/ },
        { name: 'CLID' },
      ],
      reloadPage: true,
    },
  };
}

if (config.hasMarketing) {
  categories.marketing = {
    autoClear: {
      cookies: [
        { name: /^_gcl/ },
        { name: /^_fbp/ },
        { name: /^_fbc/ },
      ],
      reloadPage: true,
    },
  };
}

const syncConsent = (): void => {
  const preferences = CookieConsent.getUserPreferences();
  const acceptedCategories = preferences.acceptedCategories || [];
  window.__acm?.apply(acceptedCategories);
};

if (typeof window !== 'undefined') {
  CookieConsent.run({
    revision: config.revision,
    // Resolved at build time from the `banner` preset merged with `gui`.
    guiOptions: config.gui as CookieConsent.GuiOptions,
    disablePageInteraction: config.overlay,
    categories,
    language: {
      default: config.lang,
      translations: config.translations,
    },
    onConsent: syncConsent,
    onChange: syncConsent,
  });
}
