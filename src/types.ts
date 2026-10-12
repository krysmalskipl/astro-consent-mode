/**
 * Recursive partial utility type.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends readonly (infer U)[]
      ? readonly DeepPartial<U>[]
      : T[P] extends object
        ? DeepPartial<T[P]>
        : T[P];
};

/**
 * Text configuration for the initial consent modal banner.
 */
export interface ConsentModalTranslation {
  /** Title of the consent modal */
  title?: string;
  /** Main description explaining cookie usage */
  description?: string;
  /** Label for the "Accept all" button */
  acceptAllBtn?: string;
  /** Label for the "Reject non-essential / Necessary only" button */
  acceptNecessaryBtn?: string;
  /** Label for the "Preferences / Settings" button */
  showPreferencesBtn?: string;
  /** HTML footer content, e.g. link to Privacy Policy */
  footer?: string;
}

/**
 * Section item in the cookie preferences modal.
 */
export interface PreferencesSection {
  /** Optional title of the preferences category/section */
  title?: string;
  /** Informational description of the category or policy */
  description?: string;
  /** Linked cookie consent category (e.g. 'necessary', 'analytics', 'marketing') */
  linkedCategory?: string;
}

/**
 * Text configuration for the detailed cookie preferences modal.
 */
export interface PreferencesModalTranslation {
  /** Title of the preferences modal */
  title?: string;
  /** Label for the "Accept all" button inside preferences */
  acceptAllBtn?: string;
  /** Label for the "Necessary only" button inside preferences */
  acceptNecessaryBtn?: string;
  /** Label for the "Save choices" button inside preferences */
  savePreferencesBtn?: string;
  /** Accessibility label for the close icon */
  closeIconLabel?: string;
  /** Array of informational and category sections */
  sections?: PreferencesSection[];
}

/**
 * Complete set of translations for a single language.
 */
export interface Translation {
  /** Texts for the primary cookie consent modal */
  consentModal: ConsentModalTranslation;
  /** Texts for the cookie preferences modal */
  preferencesModal: PreferencesModalTranslation;
}

/**
 * Modal layout options for vanilla-cookieconsent.
 */
export interface ModalGuiOptions {
  /** Layout style, e.g. 'box', 'bar', 'cloud' */
  layout?: string;
  /** Modal screen position, e.g. 'bottom left', 'bottom right', 'middle center' */
  position?: string;
  /** Give all primary action buttons equal visual weight */
  equalWeightButtons?: boolean;
  /** Invert button order */
  flipButtons?: boolean;
}

/**
 * GUI configuration options for vanilla-cookieconsent modals.
 */
export interface GuiOptions {
  /** Configuration for the primary consent banner */
  consentModal?: ModalGuiOptions;
  /** Configuration for the preferences management modal */
  preferencesModal?: ModalGuiOptions;
}

/**
 * Ready-made banner layouts. See `ConsentOptions.banner`.
 */
export type BannerPreset =
  | 'box-left'
  | 'box-right'
  | 'box-center'
  | 'box-wide'
  | 'cloud'
  | 'bar-bottom'
  | 'bar-top'
  | 'modal';

/**
 * Options for configuring @krysmalskipl/astro-consent-mode integration.
 */
export interface ConsentOptions {
  /**
   * Google Tag Manager Container ID (e.g. 'GTM-XXXXXX').
   * When provided, GTM handles tag deployment.
   */
  gtmId?: string;

  /**
   * Google Analytics 4 Measurement ID (e.g. 'G-XXXXXX').
   * Used only when gtmId is not specified.
   */
  ga4Id?: string;

  /**
   * Meta Pixel (Facebook Pixel) ID (numeric string, e.g. '123456789012345').
   */
  metaPixelId?: string;

  /**
   * Microsoft Clarity Project ID (alphanumeric string, e.g. 'abcdef1234').
   */
  clarityId?: string;

  /**
   * Consent Mode loading strategy:
   * - 'basic': All tracking tags are blocked until the visitor grants consent.
   * - 'advanced': GTM/GA4 and Clarity load immediately with default 'denied' consent signals.
   * Defaults to 'basic'.
   */
  mode?: 'basic' | 'advanced';

  /**
   * Default language for cookie consent text ('pl' | 'en').
   * Defaults to 'pl'.
   */
  lang?: 'pl' | 'en';

  /**
   * URL to your privacy policy page.
   * Defaults to '/polityka-prywatnosci/' for 'pl', or '/privacy-policy/' for 'en'.
   */
  privacyUrl?: string;

  /**
   * Custom text overrides for translations.
   * Can be provided as a language map (e.g. { pl: { consentModal: { ... } } })
   * or directly for the active language (e.g. { consentModal: { ... } }).
   */
  texts?: DeepPartial<Record<string, Translation>> | DeepPartial<Translation>;

  /**
   * Banner layout preset:
   * - 'box-left' (default): compact card in the bottom left corner
   * - 'box-right': compact card in the bottom right corner
   * - 'box-center': compact card at the bottom center
   * - 'box-wide': wider card in the bottom left corner
   * - 'cloud': wide floating card at the bottom center, buttons next to the text
   * - 'bar-bottom': full-width bar at the bottom of the page
   * - 'bar-top': full-width bar at the top of the page
   * - 'modal': centered dialog with a dimmed page overlay (implies `overlay: true`)
   */
  banner?: BannerPreset;

  /**
   * Dim the page and block interaction until the visitor makes a choice.
   * Defaults to true for the 'modal' preset, false otherwise.
   */
  overlay?: boolean;

  /**
   * Low-level UI configuration for consent and preferences modals.
   * Merged on top of the `banner` preset, so you can fine-tune any of its values.
   */
  gui?: GuiOptions;

  /**
   * Revision number of the consent configuration.
   * Incrementing this number invalidates past user consents and re-prompts visitors.
   * Defaults to 0.
   */
  revision?: number;

  /**
   * Whether to enable Google Tag url_passthrough to preserve ad click identifiers across pages.
   * Defaults to true.
   */
  urlPassthrough?: boolean;

  /**
   * Whether to enable Google Tag ads_data_redaction when ad storage consent is denied.
   * Defaults to true.
   */
  adsDataRedaction?: boolean;

  /**
   * Milliseconds Google Consent Mode waits for an updated consent state before firing tags.
   * Defaults to 500.
   */
  waitForUpdate?: number;

  /**
   * Explicitly enable or disable the integration.
   * Defaults to true when any tracking ID is present; false completely disables scripts.
   */
  enabled?: boolean;
}

/**
 * Fully resolved integration options.
 */
export interface ResolvedConsentOptions {
  gtmId?: string;
  ga4Id?: string;
  metaPixelId?: string;
  clarityId?: string;
  mode: 'basic' | 'advanced';
  lang: 'pl' | 'en';
  privacyUrl: string;
  texts?: DeepPartial<Record<string, Translation>> | DeepPartial<Translation>;
  gui: GuiOptions;
  revision: number;
  urlPassthrough: boolean;
  adsDataRedaction: boolean;
  waitForUpdate: number;
  enabled: boolean;
  hasAnalytics: boolean;
  hasMarketing: boolean;
  analyticsServices: string[];
  marketingServices: string[];
}

/**
 * Client runtime configuration passed via virtual module.
 */
export interface ClientConfig {
  hasAnalytics: boolean;
  hasMarketing: boolean;
  analyticsServices: string[];
  marketingServices: string[];
  lang: 'pl' | 'en';
  privacyUrl: string;
  translations: Record<string, Translation>;
  gui: GuiOptions;
  overlay: boolean;
  revision: number;
  mode: 'basic' | 'advanced';
}
