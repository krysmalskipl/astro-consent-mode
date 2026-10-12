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
    hideFromBots: false,
    categories,
    language: {
      default: config.lang,
      translations: config.translations,
    },
    onConsent: syncConsent,
    onChange: syncConsent,
  });

  if (config.badge) {
    const badgeLabel = typeof config.badge === 'string' ? config.badge : '🍪';
    const pos = config.badgePosition || 'bottom-left';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-cc', 'show-preferencesModal');
    btn.setAttribute('aria-label', config.lang === 'pl' ? 'Ustawienia cookies' : 'Cookie settings');
    btn.innerHTML = badgeLabel;

    const baseStyle =
      'position:fixed;z-index:9999;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;' +
      'background:var(--cc-btn-secondary-bg, #ffffff);color:var(--cc-btn-secondary-text, #132a5e);' +
      'border:1px solid var(--cc-btn-secondary-border, rgba(0,0,0,0.12));border-radius:9999px;' +
      'padding:8px 14px;font-size:14px;font-weight:600;font-family:inherit;' +
      'box-shadow:0 4px 14px rgba(0,0,0,0.1);transition:transform 0.15s ease,box-shadow 0.15s ease;';

    const posStyles: Record<string, string> = {
      'bottom-left': 'bottom:16px;left:16px;',
      'bottom-right': 'bottom:16px;right:16px;',
      'top-left': 'top:16px;left:16px;',
      'top-right': 'top:16px;right:16px;',
    };

    btn.style.cssText = baseStyle + (posStyles[pos] || posStyles['bottom-left']);
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.05)';
      btn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.16)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = '0 4px 14px rgba(0,0,0,0.1)';
    });

    document.body.appendChild(btn);
  }
}

