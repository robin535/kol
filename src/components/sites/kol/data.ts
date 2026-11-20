"use client";

/* Shared KOL data layer: brand, i18n, options, and profile helpers. */

export const BRAND = {
  name: "kol",
  mark: "kol♡",
  title: "kol · Where your spark begins",
  description:
    "kol — explore fictional adult profiles, save your favorites, and invite friends to unlock community chat.",
} as const;

export type Lang = "zh" | "en" | "hi" | "es";
export const LANGS: { code: Lang; label: string }[] = [
  { code: "zh", label: "简体中文" },
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "es", label: "Español" },
];

export type Gender = "man" | "woman";

export const AGE_BANDS = [
  { min: 18, max: 24 },
  { min: 25, max: 29 },
  { min: 30, max: 34 },
  { min: 35, max: 39 },
  { min: 40, max: 49 },
  { min: 50, max: null },
] as const;

export const HOBBY_OPTIONS = [
  { id: "travel", symbol: "✈", zh: "旅行", en: "Travel" },
  { id: "music", symbol: "♫", zh: "音乐", en: "Music" },
  { id: "movies", symbol: "▷", zh: "电影", en: "Movies" },
  { id: "food", symbol: "♨", zh: "美食", en: "Food" },
  { id: "sports", symbol: "◉", zh: "运动", en: "Sports" },
  { id: "reading", symbol: "▤", zh: "阅读", en: "Reading" },
  { id: "gaming", symbol: "⌘", zh: "游戏", en: "Gaming" },
  { id: "photography", symbol: "◎", zh: "摄影", en: "Photography" },
  { id: "pets", symbol: "♧", zh: "宠物", en: "Pets" },
] as const;
export type HobbyId = (typeof HOBBY_OPTIONS)[number]["id"];

export type IdealOption = { id: string; symbol: string; zh: string; en: string };
export const IDEAL_CHOICES: Record<Gender, IdealOption[]> = {
  woman: [
    { id: "sweet", symbol: "♡", zh: "甜美可爱", en: "Sweet & cheerful" },
    { id: "glam", symbol: "✦", zh: "成熟御姐", en: "Poised & mature" },
    { id: "gentle", symbol: "☕", zh: "温柔知性", en: "Gentle & thoughtful" },
    { id: "lively", symbol: "☀", zh: "阳光元气", en: "Bright & lively" },
    { id: "confident", symbol: "◇", zh: "独立自信", en: "Independent & confident" },
    { id: "creative", symbol: "❀", zh: "优雅时尚", en: "Elegant & stylish" },
  ],
  man: [
    { id: "caring", symbol: "♡", zh: "温柔体贴", en: "Warm & caring" },
    { id: "sunny", symbol: "☀", zh: "阳光开朗", en: "Sunny & easygoing" },
    { id: "matureMan", symbol: "☕", zh: "成熟稳重", en: "Mature & grounded" },
    { id: "funny", symbol: "✧", zh: "酷飒有型", en: "Cool & stylish" },
    { id: "active", symbol: "◉", zh: "运动活力", en: "Active & energetic" },
    { id: "creative", symbol: "❀", zh: "文艺内敛", en: "Artistic & thoughtful" },
  ],
};

export const IDEAL_TRAITS: Record<string, string> = {
  sweet: "gentle",
  glam: "confident",
  gentle: "gentle",
  lively: "active",
  confident: "confident",
  creative: "creative",
  caring: "gentle",
  sunny: "active",
  matureMan: "mature",
  funny: "funny",
  active: "active",
};

export type TraitName =
  | "gentle"
  | "confident"
  | "active"
  | "creative"
  | "mature"
  | "funny";

export const TRAIT_LABEL: Record<TraitName, { zh: string; en: string; hi: string }> = {
  gentle: { zh: "温柔", en: "Gentle", hi: "Gentle" },
  confident: { zh: "自信", en: "Confident", hi: "Confident" },
  active: { zh: "活力", en: "Active", hi: "Active" },
  creative: { zh: "文艺", en: "Creative", hi: "Creative" },
  mature: { zh: "成熟", en: "Mature", hi: "Mature" },
  funny: { zh: "幽默", en: "Funny", hi: "Funny" },
};

/* ---------- Questionnaire copy (4 steps) ---------- */
export type QuizCopy = {
  titles: string[];
  subtitles: string[];
  back: string;
  next: string;
  adult: string;
  agePlus: string;
  working: string;
  error: string;
  women: string;
  men: string;
  selected: (n: number) => string;
  hint: string;
  genderMan: string;
  genderWoman: string;
  step: (i: number) => string;
};

const QUIZ_SOURCE: { zh: QuizCopy; en: QuizCopy } = {
  zh: {
    titles: [
      "先认识一下你",
      "你在哪个年龄段？",
      "平时喜欢做些什么？",
      "什么样的人让你心动？",
    ],
    subtitles: [
      "选择你的性别，开启专属心动旅程。",
      "选择你的年龄段，慢慢认识彼此。",
      "选择你最喜欢的一项爱好。",
      "选择一个最让你心动的理想型。",
    ],
    back: "上一步",
    next: "下一步",
    adult: "仅限 18 岁及以上",
    agePlus: "50 岁及以上",
    working: "正在为你准备人物…",
    error: "保存失败，请再次点选理想型重试。",
    women: "推荐成年女性角色",
    men: "推荐成年男性角色",
    selected: (n: number) => `已选 ${n} 项`,
    hint: "遇见兴趣相投、聊得来的人。",
    genderMan: "我是男生",
    genderWoman: "我是女生",
    step: (i: number) => `0${i + 1} / 04`,
  },
  en: {
    titles: [
      "Let’s start with you.",
      "What’s your age range?",
      "What do you enjoy?",
      "Who makes your heart skip?",
    ],
    subtitles: [
      "Choose your gender to begin.",
      "Select your age range.",
      "Choose your favorite interest.",
      "Choose the type you’re most drawn to.",
    ],
    back: "Go back",
    next: "Continue",
    adult: "For adults aged 18 and over",
    agePlus: "50 and over",
    working: "Getting your profiles ready…",
    error: "Couldn’t save. Choose your type again to retry.",
    women: "Discover fictional adult women",
    men: "Discover fictional adult men",
    selected: (n: number) => `${n} selected`,
    hint: "Find someone who shares your interests.",
    genderMan: "I’m a man",
    genderWoman: "I’m a woman",
    step: (i: number) => `0${i + 1} / 04`,
  },
};

const QUIZ_ES: QuizCopy = {
  titles: [
    "Empecemos por ti.",
    "¿Cuál es tu rango de edad?",
    "¿Qué te gusta hacer?",
    "¿A quién te gustaría conocer?",
  ],
  subtitles: [
    "Elige tu género para empezar.",
    "Solo para mayores de 18 años",
    "Elige una de tus aficiones favoritas.",
    "Elige lo que más te atrae",
  ],
  back: "Volver",
  next: "Continuar",
  adult: "Solo para mayores de 18 años",
  agePlus: "50 años o más",
  working: "Preparando tus perfiles…",
  error: "No se pudo guardar. Elige tu tipo otra vez para reintentar.",
  women: "Descubre mujeres adultas ficticias",
  men: "Descubre hombres adultos ficticios",
  selected: (n: number) => `${n} seleccionados`,
  hint: "Encuentra a alguien con tus mismos intereses.",
  genderMan: "Soy hombre",
  genderWoman: "Soy mujer",
  step: (i: number) => `0${i + 1} / 04`,
};

export const QUIZ_COPY: Record<Lang, QuizCopy> = {
  zh: QUIZ_SOURCE.zh,
  en: QUIZ_SOURCE.en,
  hi: QUIZ_SOURCE.en,
  es: QUIZ_ES,
};

/** Language lookup with Hindi falling back to English copy. */
export const QUIZ_BY_LANG: Record<Lang, QuizCopy> = {
  zh: QUIZ_COPY.zh,
  en: QUIZ_COPY.en,
  hi: QUIZ_COPY.en,
  es: QUIZ_ES,
};

/* ---------- Profile data ---------- */
export type Profile = {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  city: string;
  job: { zh?: string; en?: string; hi?: string };
  traits: string[];
  languages: string;
  bio: { zh?: string; en?: string; hi?: string };
  ideal?: string;
  market?: string;
  library?: string;
  portrait: { src: string; thumb: string; card: string };
  sourceProfileId?: string;
};

declare global {
  interface Window {
    KOL_PROFILES?: Profile[];
  }
}

export function getProfiles(): Profile[] {
  if (typeof window === "undefined") return [];
  const raw = window.KOL_PROFILES ?? [];
  return normalizeProfiles(raw);
}

export function normalizeProfiles(raw: Profile[]): Profile[] {
  return raw.map((p) => ({
    ...p,
    portrait: {
      src: p.portrait?.src ?? "",
      thumb: p.portrait?.thumb ?? p.portrait?.src ?? "",
      card: p.portrait?.card ?? p.portrait?.src ?? "",
    },
  }));
}

export function pickText<T extends { zh?: string; en?: string; hi?: string; es?: string }>(
  v: T | string | undefined,
  lang: Lang,
): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v[lang] ?? v.en ?? v.zh ?? v.hi ?? "";
}

export function matchesPreferences(p: Profile, wanted: Gender[]): number {
  let n = 0;
  if (wanted.includes(p.gender)) n += 1;
  if (p.traits?.length) n += 1;
  if (p.languages) n += 1;
  return n;
}
