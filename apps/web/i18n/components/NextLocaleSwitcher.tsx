"use client";
import {
  FALLBACK_LNG,
  LANGUAGES,
  LOCALE_OPTIONS,
  type SupportedLocales,
} from "@repo/i18n/config/client";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { LocaleSwitcher } from "@/i18n/components/LocaleSwitcher";
import { switchLang } from "@/utils/_change-lang";
import { useAppLocale } from "./Locale";

type NextLocaleSwitcherProps = {
  align?: "start" | "center" | "end";
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
  onLocaleChange?: (locale: SupportedLocales) => void;
};

export default function NextLocaleSwitcher({
  align = "end",
  triggerClassName,
  contentClassName,
  disabled = false,
  onLocaleChange: lc,
}: NextLocaleSwitcherProps) {
  const localeContext = useAppLocale();
  const currentLocale = localeContext?.currentLocale || FALLBACK_LNG;
  const router = useRouter();
  const pathname = usePathname();

  const onLocaleChange = useCallback(
    (locale: SupportedLocales) => {
      // Update i18n instance and cookie
      switchLang(locale);
      lc?.(locale);

      // Build new URL with proper locale handling
      const currentPathSegments = pathname.split("/").filter(Boolean);
      const firstSegment = currentPathSegments[0] || "";

      // Check if current path already has a locale prefix
      const hasLocaleInPath = LANGUAGES.includes(
        firstSegment as SupportedLocales,
      );

      // Remove existing locale from path if present
      const pathWithoutLocale = hasLocaleInPath
        ? `/${currentPathSegments.slice(1).join("/")}`
        : pathname;

      // Always use the clean path (no locale prefix)
      const newPath = pathWithoutLocale || "/";

      // Navigate to new path
      router.push(newPath);
    },

    [router, pathname],
  );

  return (
    <LocaleSwitcher
      currentLocale={currentLocale}
      localeOptions={LOCALE_OPTIONS}
      onLocaleChange={onLocaleChange}
      align={align}
      triggerClassName={triggerClassName}
      contentClassName={contentClassName}
      disabled={disabled}
    />
  );
}
