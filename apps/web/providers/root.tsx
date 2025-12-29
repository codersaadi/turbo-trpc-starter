import React from "react";
import { LambdaQueryProvider } from "./query-provider";
import { EdgeQueryProvider } from "./edge-query-provider";
import { UIProvider } from "./ui-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import LocaleProvider from "@/i18n/components/Locale";
import { isRtl } from "@repo/i18n/utils";
import { ORG_LOCALE_HEADER, validateLocale } from "@repo/i18n/config/client";
import { cookies } from "next/headers";
import { getLocaleFromCookie } from "@/utils/get-locale";

interface GlobalLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

/**
 * Root Provider
 *
 * Provides both Lambda (main API with DB) and Edge (feature flags, system) tRPC clients
 */
export default async function AppLayout({
  children,
  modal,
}: GlobalLayoutProps) {
  const locale = await getLocaleFromCookie();
  const direction = isRtl(locale) ? "rtl" : "ltr";

  return (
    <NuqsAdapter>
      <UIProvider>
        <LocaleProvider locale={locale} direction={direction}>
          <LambdaQueryProvider>
            <EdgeQueryProvider>
              {children}
              {modal}
            </EdgeQueryProvider>
          </LambdaQueryProvider>
        </LocaleProvider>
      </UIProvider>
    </NuqsAdapter>
  );
}
