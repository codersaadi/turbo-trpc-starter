import { resolveAcceptLanguage } from "resolve-accept-language";
import {
  FALLBACK_LNG,
  LANGUAGES,
  type SupportedLocales,
} from "../config/client";

export function normalizeLocale(locale?: string | null): SupportedLocales {
  if (!locale) {
    return FALLBACK_LNG;
  }
  const lowerLocale = locale.toLowerCase();
  if ((LANGUAGES as readonly string[]).includes(lowerLocale)) {
    return lowerLocale as SupportedLocales;
  }
  const baseLang = lowerLocale.split("-")[0];
  if ((LANGUAGES as readonly string[]).includes(baseLang as string)) {
    return baseLang as SupportedLocales;
  }
  const supportedBaseLangMatch = LANGUAGES.find((sl) =>
    sl.startsWith(`${baseLang}-`),
  );
  if (supportedBaseLangMatch) {
    return supportedBaseLangMatch;
  }
  return FALLBACK_LNG;
}

export function parseAcceptLanguage(
  acceptLangHeader: string | null,
): SupportedLocales {
  // The `resolve-accept-language` library expects BCP47 format.
  // If your LANGUAGES array uses simpler codes (e.g., 'ar'), map them if necessary.
  // Example: const bcp47Languages = LANGUAGES.map(lang => (lang === 'ar' ? 'ar-EG' : lang));
  const resolvedLang = resolveAcceptLanguage(
    acceptLangHeader || "",
    [...LANGUAGES], // Pass your actual supported language codes
    FALLBACK_LNG,
  );
  return normalizeLocale(resolvedLang);
}

export async function parsePageLocale(
  // Adapt this to your specific framework's way of providing params
  searchParams?: { [key: string]: string | string[] | undefined },
): Promise<SupportedLocales> {
  const hl = searchParams?.hl;
  const localeParam = searchParams?.locale;
  const potentialLocale = Array.isArray(hl)
    ? hl[0]
    : hl || (Array.isArray(localeParam) ? localeParam[0] : localeParam);
  return await normalizeLocale(potentialLocale);
}

/**
 * Parse the browser language and return the fallback language
 */
export const parseBrowserLanguage = (
  headers: Headers,
  defaultLang: string = FALLBACK_LNG,
) => {
  // if the default language is not 'en-US', just return the default language as fallback lang
  if (defaultLang !== FALLBACK_LNG) {
    return defaultLang;
  }

  /**
   * The arguments are as follows:
   *
   * 1) The HTTP accept-language header.
   * 2) The available locales (they must contain the default locale).
   * 3) The default locale.
   */
  // Map short codes to BCP 47 format for the library
  const bcp47Languages = LANGUAGES.map((locale) => {
    switch (locale as string) {
      case "ar":
        return "ar-EG";
      case "es":
        return "es-ES";
      case "ca":
        return "ca-ES";
      case "fr":
        return "fr-FR";
      case "it":
        return "it-IT";
      case "pt":
        return "pt-PT";
      case "zh":
        return "zh-CN";
      case "de":
        return "de-DE";
      case "nl":
        return "nl-NL";
      case "ru":
        return "ru-RU";
      default:
        return locale;
    }
  });

  let browserLang: string = resolveAcceptLanguage(
    headers.get("accept-language") || "",
    bcp47Languages,
    defaultLang,
  );

  // Map back to short codes
  if (browserLang === "ar-EG") browserLang = "ar";
  else if (browserLang === "es-ES") browserLang = "es";
  else if (browserLang === "ca-ES") browserLang = "ca";
  else if (browserLang === "fr-FR") browserLang = "fr";
  else if (browserLang === "it-IT") browserLang = "it";
  else if (browserLang === "pt-PT") browserLang = "pt";
  else if (browserLang === "zh-CN") browserLang = "zh";
  else if (browserLang === "de-DE") browserLang = "de";
  else if (browserLang === "nl-NL") browserLang = "nl";
  else if (browserLang === "ru-RU") browserLang = "ru";

  return browserLang;
};
