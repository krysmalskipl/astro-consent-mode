import type { AstroIntegration } from 'astro';
import type {
  BannerPreset,
  ConsentOptions,
  GuiOptions,
  ResolvedConsentOptions,
  ClientConfig,
} from './types';
import { buildHeadScript } from './head';
import { resolveTranslations } from './translations';

export * from './types';

/**
 * Creates Vite plugin that exposes configuration as a virtual module.
 */
function virtualConfigPlugin(clientConfig: ClientConfig) {
  const virtualModuleId = 'virtual:astro-consent-mode/config';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'vite-plugin-astro-consent-mode-config',
    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify(clientConfig)};`;
      }
    },
  };
}

/**
 * Validates tracking identifiers provided in options.
 */
function validateOptions(options: ConsentOptions): void {
  if (options.gtmId && !/^GTM-[A-Z0-9]+$/i.test(options.gtmId)) {
    throw new Error(
      `[@krysmalskipl/astro-consent-mode] Invalid "gtmId": expected format "GTM-XXXXXX", received "${options.gtmId}".`
    );
  }

  if (options.ga4Id && !/^G-[A-Z0-9]+$/i.test(options.ga4Id)) {
    throw new Error(
      `[@krysmalskipl/astro-consent-mode] Invalid "ga4Id": expected format "G-XXXXXX", received "${options.ga4Id}".`
    );
  }

  if (options.metaPixelId && !/^\d+$/.test(options.metaPixelId)) {
    throw new Error(
      `[@krysmalskipl/astro-consent-mode] Invalid "metaPixelId": expected numeric string, received "${options.metaPixelId}".`
    );
  }

  if (options.clarityId && !/^[a-z0-9]+$/i.test(options.clarityId)) {
    throw new Error(
      `[@krysmalskipl/astro-consent-mode] Invalid "clarityId": expected alphanumeric string, received "${options.clarityId}".`
    );
  }

  if (options.mode && options.mode !== 'basic' && options.mode !== 'advanced') {
    throw new Error(
      `[@krysmalskipl/astro-consent-mode] Invalid "mode": expected "basic" | "advanced", received "${options.mode}".`
    );
  }

  if (options.lang && options.lang !== 'pl' && options.lang !== 'en') {
    throw new Error(
      `[@krysmalskipl/astro-consent-mode] Invalid "lang": expected "pl" | "en", received "${options.lang}".`
    );
  }

  if (options.banner && !(options.banner in BANNER_PRESETS)) {
    throw new Error(
      `[@krysmalskipl/astro-consent-mode] Invalid "banner": expected one of ${Object.keys(BANNER_PRESETS)
        .map((k) => `"${k}"`)
        .join(' | ')}, received "${options.banner}".`
    );
  }
}

const BOX_PREFERENCES = { layout: 'box', equalWeightButtons: true };

/** Maps `banner` presets to vanilla-cookieconsent guiOptions. */
const BANNER_PRESETS: Record<BannerPreset, Required<GuiOptions>> = {
  'box-left': {
    consentModal: { layout: 'box', position: 'bottom left', equalWeightButtons: true },
    preferencesModal: BOX_PREFERENCES,
  },
  'box-right': {
    consentModal: { layout: 'box', position: 'bottom right', equalWeightButtons: true },
    preferencesModal: BOX_PREFERENCES,
  },
  'box-center': {
    consentModal: { layout: 'box', position: 'bottom center', equalWeightButtons: true },
    preferencesModal: BOX_PREFERENCES,
  },
  'box-wide': {
    consentModal: { layout: 'box wide', position: 'bottom left', equalWeightButtons: true },
    preferencesModal: BOX_PREFERENCES,
  },
  cloud: {
    consentModal: { layout: 'cloud inline', position: 'bottom center', equalWeightButtons: true },
    preferencesModal: BOX_PREFERENCES,
  },
  'bar-bottom': {
    consentModal: { layout: 'bar inline', position: 'bottom', equalWeightButtons: true },
    preferencesModal: BOX_PREFERENCES,
  },
  'bar-top': {
    consentModal: { layout: 'bar inline', position: 'top', equalWeightButtons: true },
    preferencesModal: BOX_PREFERENCES,
  },
  modal: {
    consentModal: { layout: 'box', position: 'middle center', equalWeightButtons: true },
    preferencesModal: BOX_PREFERENCES,
  },
};

/**
 * Astro integration for Google Consent Mode v2 + cookie consent banner + GTM / GA4 / Meta Pixel / Clarity.
 *
 * @param options Integration options
 * @returns Astro integration definition
 */
export function consent(options: ConsentOptions = {}): AstroIntegration {
  validateOptions(options);

  const hasAnyId = Boolean(
    options.gtmId || options.ga4Id || options.metaPixelId || options.clarityId
  );
  const isEnabled = options.enabled !== undefined ? options.enabled : hasAnyId;

  const mode = options.mode ?? 'basic';
  const lang = options.lang ?? 'pl';
  const defaultPrivacyUrl =
    lang === 'en' ? '/privacy-policy/' : '/polityka-prywatnosci/';
  const privacyUrl = options.privacyUrl ?? defaultPrivacyUrl;
  const revision = options.revision ?? 0;
  const urlPassthrough = options.urlPassthrough ?? true;
  const adsDataRedaction = options.adsDataRedaction ?? true;
  const waitForUpdate = options.waitForUpdate ?? 500;

  const analyticsServices: string[] = [];
  if (options.gtmId) {
    analyticsServices.push('Google Tag Manager');
  } else if (options.ga4Id) {
    analyticsServices.push('Google Analytics');
  }
  if (options.clarityId) {
    analyticsServices.push('Microsoft Clarity');
  }

  const marketingServices: string[] = [];
  if (options.gtmId) {
    marketingServices.push('Google Tag Manager');
  }
  if (options.metaPixelId) {
    marketingServices.push('Meta Pixel');
  }

  const hasAnalytics = analyticsServices.length > 0;
  const hasMarketing = marketingServices.length > 0;

  const resolvedOptions: ResolvedConsentOptions = {
    gtmId: options.gtmId,
    ga4Id: options.gtmId ? undefined : options.ga4Id,
    metaPixelId: options.metaPixelId,
    clarityId: options.clarityId,
    mode,
    lang,
    privacyUrl,
    texts: options.texts,
    gui: options.gui || {},
    revision,
    urlPassthrough,
    adsDataRedaction,
    waitForUpdate,
    enabled: isEnabled,
    hasAnalytics,
    hasMarketing,
    analyticsServices,
    marketingServices,
  };

  const translations = resolveTranslations(
    {
      privacyUrl,
      hasAnalytics,
      hasMarketing,
      analyticsServices,
      marketingServices,
    },
    lang,
    options.texts
  );

  const banner = options.banner ?? 'box-left';
  const overlay = options.overlay ?? banner === 'modal';
  const badge = options.badge ?? false;
  const badgePosition = options.badgePosition ?? 'bottom-left';
  const preset = BANNER_PRESETS[banner];
  const gui: GuiOptions = {
    consentModal: { ...preset.consentModal, ...options.gui?.consentModal },
    preferencesModal: { ...preset.preferencesModal, ...options.gui?.preferencesModal },
  };

  const clientConfig: ClientConfig = {
    hasAnalytics,
    hasMarketing,
    analyticsServices,
    marketingServices,
    lang,
    privacyUrl,
    translations,
    gui,
    overlay,
    badge,
    badgePosition,
    revision,
    mode,
  };

  return {
    name: '@krysmalskipl/astro-consent-mode',
    hooks: {
      'astro:config:setup'({ injectScript, updateConfig, logger }) {
        if (!isEnabled) {
          logger.info(
            'Astro Consent Mode is disabled (no tracking IDs configured or enabled: false).'
          );
          return;
        }

        injectScript('head-inline', buildHeadScript(resolvedOptions));

        updateConfig({
          vite: {
            plugins: [virtualConfigPlugin(clientConfig)],
            optimizeDeps: {
              exclude: ['@krysmalskipl/astro-consent-mode'],
              include: ['vanilla-cookieconsent'],
            },
          },
        });

        injectScript('page', "import '@krysmalskipl/astro-consent-mode/client';");
      },
    },
  };
}

export default consent;
