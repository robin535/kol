export type Market = {
  name: string;
  nameZh: string;
  language: "en" | "zh" | "es" | "it" | "pt" | "tr" | "de" | "fr" | "nl" | "ar";
  locale: string;
  currency: string;
  reward: number;
  bankType: "ifsc" | "clabe" | "iban" | "pix" | "swift";
};

/** Mirrors the source market catalogue (config/markets.json). */
export const MARKETS: Record<string, Market> = {
  WW: { name: "International", nameZh: "其他国家", language: "en", locale: "en-US", currency: "USD", reward: 20, bankType: "swift" },
  IN: { name: "India", nameZh: "印度", language: "en", locale: "en-IN", currency: "INR", reward: 2000, bankType: "ifsc" },
  TR: { name: "Türkiye", nameZh: "土耳其", language: "tr", locale: "tr-TR", currency: "USD", reward: 20, bankType: "swift" },
  PT: { name: "Portugal", nameZh: "葡萄牙", language: "pt", locale: "pt-PT", currency: "USD", reward: 20, bankType: "swift" },
  MX: { name: "México", nameZh: "墨西哥", language: "es", locale: "es-MX", currency: "MXN", reward: 450, bankType: "clabe" },
  ES: { name: "España", nameZh: "西班牙", language: "es", locale: "es-ES", currency: "EUR", reward: 20, bankType: "iban" },
  IT: { name: "Italia", nameZh: "意大利", language: "it", locale: "it-IT", currency: "EUR", reward: 20, bankType: "iban" },
  BR: { name: "Brasil", nameZh: "巴西", language: "pt", locale: "pt-BR", currency: "BRL", reward: 120, bankType: "pix" },
  DE: { name: "Deutschland", nameZh: "德国", language: "de", locale: "de-DE", currency: "USD", reward: 20, bankType: "swift" },
  PE: { name: "Perú", nameZh: "秘鲁", language: "es", locale: "es-PE", currency: "USD", reward: 20, bankType: "swift" },
  CL: { name: "Chile", nameZh: "智利", language: "es", locale: "es-CL", currency: "USD", reward: 20, bankType: "swift" },
  LY: { name: "ليبيا", nameZh: "利比亚", language: "ar", locale: "ar-LY", currency: "USD", reward: 20, bankType: "swift" },
  BE: { name: "België / Belgique", nameZh: "比利时", language: "nl", locale: "nl-BE", currency: "USD", reward: 20, bankType: "swift" },
  FR: { name: "France", nameZh: "法国", language: "fr", locale: "fr-FR", currency: "USD", reward: 20, bankType: "swift" },
  US: { name: "United States", nameZh: "美国", language: "en", locale: "en-US", currency: "USD", reward: 20, bankType: "swift" },
};

/** Visitor-facing picker order used by the login country selector. */
export const COUNTRY_ORDER: string[] = [
  "IN", "BR", "MX", "TR", "IT", "ES", "PT", "DE", "FR", "BE", "US", "PE", "CL", "LY", "WW",
].filter((code, index, list) => list.indexOf(code) === index && Boolean(MARKETS[code]));

export function marketOf(code: string | null | undefined): Market {
  if (code && MARKETS[code]) return MARKETS[code];
  return MARKETS.WW;
}

export function marketAmount(code: string): string {
  const market = marketOf(code);
  try {
    return new Intl.NumberFormat(market.locale, {
      style: "currency",
      currency: market.currency,
      maximumFractionDigits: 0,
    }).format(market.reward);
  } catch {
    return `${market.currency} ${market.reward}`;
  }
}

export const INVITE_TARGET = 1;
export const BROWSE_LIMIT = 10;

/** Country calling codes used by the phone registration step. */
export const PHONE_COUNTRIES: Record<string, string> = {
  IN: "91", MX: "52", BR: "55", TR: "90", IT: "39", ES: "34", PT: "351", DE: "49",
  PE: "51", CL: "56", LY: "218", BE: "32", FR: "33", US: "1", NL: "31", GB: "44",
  CO: "57", AR: "54", CA: "1", AU: "61", AE: "971",
};

export function countryName(code: string, lang: string): string {
  try {
    return new Intl.DisplayNames([lang === "zh" ? "zh-CN" : lang], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
