// biome-ignore lint/performance/noBarrelFile: <minor>
export { i18nEnvConfig, isDev, isOnServerSide } from "./env";
export {
  normalizeLocale,
  parseAcceptLanguage,
  parseBrowserLanguage,
  parsePageLocale,
} from "./parse-locale";
export { isRtl, updateDocumentDirection } from "./rtl";
