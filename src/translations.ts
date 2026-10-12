import type {
  Translation,
  PreferencesSection,
  ConsentOptions,
  DeepPartial,
} from './types';

function isObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects recursively without mutating arguments.
 */
export function deepMerge<T extends Record<string, unknown>>(target: T, source: unknown): T {
  if (!source || typeof source !== 'object') return target;
  const output: Record<string, unknown> = { ...target };
  const sourceRecord = source as Record<string, unknown>;

  for (const key of Object.keys(sourceRecord)) {
    const sourceVal = sourceRecord[key];
    const targetVal = output[key];
    if (sourceVal === undefined) continue;

    if (isObject(sourceVal) && isObject(targetVal)) {
      output[key] = deepMerge(targetVal, sourceVal);
    } else {
      output[key] = sourceVal;
    }
  }

  return output as T;
}

export interface BuildTranslationsParams {
  privacyUrl: string;
  hasAnalytics: boolean;
  hasMarketing: boolean;
  analyticsServices: string[];
  marketingServices: string[];
}

/**
 * Builds default Polish and English translations based on enabled categories and services.
 */
export function buildDefaultTranslations(params: BuildTranslationsParams): Record<string, Translation> {
  const {
    privacyUrl,
    hasAnalytics,
    hasMarketing,
    analyticsServices,
    marketingServices,
  } = params;

  const plAnalyticsSuffix = analyticsServices.length > 0 ? ` (np. ${analyticsServices.join(', ')})` : '';
  const plMarketingSuffix = marketingServices.length > 0 ? ` (np. ${marketingServices.join(', ')})` : '';

  const enAnalyticsSuffix = analyticsServices.length > 0 ? ` (e.g. ${analyticsServices.join(', ')})` : '';
  const enMarketingSuffix = marketingServices.length > 0 ? ` (e.g. ${marketingServices.join(', ')})` : '';

  const plSections: PreferencesSection[] = [
    {
      description: `Możesz w każdej chwili zmienić swoje wybory. Szczegóły znajdziesz w <a href="${privacyUrl}">polityce prywatności</a>.`,
    },
    {
      title: 'Niezbędne',
      description: 'Wymagane do działania strony, np. zapamiętanie Twoich wyborów dotyczących cookies.',
      linkedCategory: 'necessary',
    },
  ];

  if (hasAnalytics) {
    plSections.push({
      title: 'Analityczne',
      description: `Pomagają nam zrozumieć, jak korzystasz ze strony${plAnalyticsSuffix}.`,
      linkedCategory: 'analytics',
    });
  }

  if (hasMarketing) {
    plSections.push({
      title: 'Marketingowe',
      description: `Służą do mierzenia skuteczności reklam i dopasowania ich do Twoich zainteresowań${plMarketingSuffix}.`,
      linkedCategory: 'marketing',
    });
  }

  const enSections: PreferencesSection[] = [
    {
      description: `You can change your choices at any time. For more details, see our <a href="${privacyUrl}">privacy policy</a>.`,
    },
    {
      title: 'Necessary',
      description: 'Required for the site to function properly, e.g. remembering your cookie choices.',
      linkedCategory: 'necessary',
    },
  ];

  if (hasAnalytics) {
    enSections.push({
      title: 'Analytics',
      description: `Help us understand how you use the website${enAnalyticsSuffix}.`,
      linkedCategory: 'analytics',
    });
  }

  if (hasMarketing) {
    enSections.push({
      title: 'Marketing',
      description: `Used to measure advertising effectiveness and tailor ads to your interests${enMarketingSuffix}.`,
      linkedCategory: 'marketing',
    });
  }

  const pl: Translation = {
    consentModal: {
      title: 'Szanujemy Twoją prywatność',
      description:
        'Używamy plików cookies, aby analizować ruch i ulepszać stronę. Cookies analityczne i marketingowe włączymy tylko za Twoją zgodą.',
      acceptAllBtn: 'Akceptuję wszystkie',
      acceptNecessaryBtn: 'Tylko niezbędne',
      showPreferencesBtn: 'Ustawienia',
      footer: `<a href="${privacyUrl}">Polityka prywatności</a>`,
    },
    preferencesModal: {
      title: 'Ustawienia cookies',
      acceptAllBtn: 'Akceptuję wszystkie',
      acceptNecessaryBtn: 'Tylko niezbędne',
      savePreferencesBtn: 'Zapisz wybór',
      closeIconLabel: 'Zamknij',
      sections: plSections,
    },
  };

  const en: Translation = {
    consentModal: {
      title: 'We value your privacy',
      description:
        'We use cookies to analyze traffic and improve the website. Analytics and marketing cookies will only be activated with your consent.',
      acceptAllBtn: 'Accept all',
      acceptNecessaryBtn: 'Necessary only',
      showPreferencesBtn: 'Preferences',
      footer: `<a href="${privacyUrl}">Privacy policy</a>`,
    },
    preferencesModal: {
      title: 'Cookie preferences',
      acceptAllBtn: 'Accept all',
      acceptNecessaryBtn: 'Necessary only',
      savePreferencesBtn: 'Save preferences',
      closeIconLabel: 'Close',
      sections: enSections,
    },
  };

  return { pl, en };
}

/**
 * Resolves translations by merging defaults with user-supplied texts.
 */
export function resolveTranslations(
  params: BuildTranslationsParams,
  defaultLang: 'pl' | 'en',
  customTexts?: DeepPartial<Record<string, Translation>> | DeepPartial<Translation>
): Record<string, Translation> {
  const translations = buildDefaultTranslations(params);

  if (!customTexts) {
    return translations;
  }

  const textsRecord = customTexts as Record<string, unknown>;

  // Check if customTexts is a direct Translation object (has consentModal or preferencesModal)
  if ('consentModal' in textsRecord || 'preferencesModal' in textsRecord) {
    translations[defaultLang] = deepMerge(
      translations[defaultLang] as unknown as Record<string, unknown>,
      textsRecord
    ) as unknown as Translation;
    return translations;
  }

  // Otherwise treat customTexts as a map of language codes
  for (const [langKey, langValue] of Object.entries(textsRecord)) {
    if (!langValue || typeof langValue !== 'object') continue;

    if (translations[langKey]) {
      translations[langKey] = deepMerge(
        translations[langKey] as unknown as Record<string, unknown>,
        langValue
      ) as unknown as Translation;
    } else {
      // New language added by user, fallback to english structure if available then merge
      const base = translations[defaultLang] || translations.en;
      translations[langKey] = deepMerge(
        base as unknown as Record<string, unknown>,
        langValue
      ) as unknown as Translation;
    }
  }

  return translations;
}
