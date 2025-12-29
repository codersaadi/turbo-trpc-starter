import {
  AppNamespaces,
  ORG_LOCALE_HEADER,
  validateLocale,
} from "@repo/i18n/config/client";
import { translation } from "@repo/i18n/functions/translation";
import { cookies } from "next/headers";

export const getLocaleFromCookie = async () => {
  const cookiesList = await cookies();
  const locale = validateLocale(cookiesList.get(ORG_LOCALE_HEADER)?.value);
  return locale;
};

// translate should be used in server components
export const translate = async <TNamespace extends AppNamespaces>(
  ns: TNamespace,
) => {
  const locale = await getLocaleFromCookie();
  const { t } = await translation(ns, locale);
  return t;
};
