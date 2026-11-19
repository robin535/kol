import type { Profile } from "../data";

/** Source data uses "./assets/…" paths; normalise them for any route depth. */
export function asset(path: string | undefined): string {
  if (!path) return "";
  if (path.startsWith("./")) return `/${path.slice(2)}`;
  if (path.startsWith("assets/")) return `/${path}`;
  return path;
}

export function portraitOf(profile: Profile | null | undefined): {
  src: string;
  thumb: string;
  card: string;
} {
  return {
    src: asset(profile?.portrait?.src),
    thumb: asset(profile?.portrait?.thumb || profile?.portrait?.src),
    card: asset(profile?.portrait?.card || profile?.portrait?.src),
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function copyText(value: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    return navigator.clipboard
      .writeText(value)
      .then(() => true)
      .catch(() => fallbackCopy(value));
  }
  return Promise.resolve(fallbackCopy(value));
}

function fallbackCopy(value: string): boolean {
  try {
    const field = document.createElement("textarea");
    field.value = value;
    field.style.position = "fixed";
    field.style.left = "10px";
    field.style.top = "10px";
    field.style.width = "1px";
    field.style.height = "1px";
    field.style.opacity = "0.01";
    document.body.append(field);
    field.select();
    const ok = document.execCommand("copy");
    field.remove();
    return ok;
  } catch {
    return false;
  }
}

export function siteOrigin(): string {
  if (typeof window === "undefined") return "https://kol.example";
  return window.location.origin;
}

export function inviteURL(accountId: string | null): string {
  const url = new URL("/join", siteOrigin());
  url.searchParams.set("invite", accountId ?? "friend");
  return url.href;
}

export function joinURL(params: Record<string, string>): string {
  const url = new URL("/join", siteOrigin());
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.href;
}

export function whatsappURL(message: string, link: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${message}\n${link}`)}`;
}

export const SAFARI_GUIDE = "/assets/safari-guide.png";
export const WHATSAPP_ICON = "/assets/whatsapp.svg";
export const ROMANTIC_PHOTO = "/assets/ambience/romance-kiss-v3-mobile.webp";
export const WELCOME_MX = "/assets/welcome/romance-mx-v3-mobile.webp";
export const WELCOME_BR = "/assets/welcome/romance-br-v3-mobile.webp";
export const BACKGROUND_MUSIC = {
  m4a: "/assets/music/just-your-type-user-v2.m4a",
  mp3: "/assets/music/just-your-type-user-v1.mp3",
};
