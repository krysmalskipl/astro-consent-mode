# Changelog

All notable changes to this project will be documented in this file.

## 0.1.0 - 2026-10-12

### Features

- Initial release of `@krysmalski/astro-consent-mode`.
- Astro integration supporting Google Consent Mode v2 with both `basic` and `advanced` loading strategies.
- Zero-config integration with vanilla-cookieconsent v3.
- Native tag loaders for Google Tag Manager (GTM), Google Analytics 4 (GA4), Meta Pixel, and Microsoft Clarity.
- Support for Microsoft Clarity Consent API v2 (`clarity('consentv2', ...)`).
- Synchronous cookie inspection in `<head>` for returning visitors to eliminate consent lag.
- Auto-cleaning of analytics and marketing cookies when consent is revoked.
- 8 ready-made banner layout presets (`box-left`, `box-right`, `box-center`, `box-wide`, `cloud`, `bar-bottom`, `bar-top`, `modal`) plus optional `overlay` backdrop dimming.
- Dynamic categorization based on configured service IDs.
- Full Polish (`pl`) and English (`en`) built-in translations with deep customization support.
- Fully typed configuration with TypeScript declarations and JSDoc annotations.
