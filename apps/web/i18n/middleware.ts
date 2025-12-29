import {
  FALLBACK_LNG,
  LANGUAGES,
  ORG_LOCALE_HEADER,
  type SupportedLocales,
} from "@repo/i18n/config/client";
import { parseBrowserLanguage } from "@repo/i18n/utils/parse-locale";
import type { NextRequest } from "next/server";
import { UAParser } from "ua-parser-js";
import { RouteVariants } from "../lib/route-variants";

export const i18nMiddleware = (req: NextRequest) => {
  // Check if URL contains a locale prefix
  const pathSegments = req.nextUrl.pathname.split("/").filter(Boolean);
  const firstSegment = pathSegments[0] || "";
  const localeFromPath = LANGUAGES.find((lang) => firstSegment === lang);

  const browserLanguage = parseBrowserLanguage(req.headers);

  // Priority: URL locale > Cookie > Browser > Fallback
  const locale = (localeFromPath ||
    req.cookies.get(ORG_LOCALE_HEADER)?.value ||
    browserLanguage ||
    FALLBACK_LNG) as SupportedLocales;

  const device = new UAParser(req.headers.get("user-agent") || "").getDevice();
  const routeVariants = RouteVariants.serializeVariants({
    isMobile: device.type === "mobile",
    locale,
  });
  return {
    routeVariants,
    locale,
  };
};
