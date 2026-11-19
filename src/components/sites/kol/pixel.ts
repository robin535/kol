/**
 * Meta Pixel (fbq) loader.
 *
 * The pixel ID never lives in the repo: it is read from NEXT_PUBLIC_META_PIXEL_ID
 * at build time. When unset, every tracking call is a silent no-op.
 */
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

type FbqFn = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
  push: FbqFn;
};

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
  }
}

let loaded = false;

/** Injects the base code once per page load. Safe to call repeatedly: fbq is idempotent. */
export function initMetaPixel(): void {
  if (typeof window === "undefined" || !PIXEL_ID || window.fbq) return;

  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as FbqFn;

  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  if (!window._fbq) window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  fbq("init", PIXEL_ID);
  fbq("track", "PageView");
  loaded = true;
}

/** Counts 15 visible seconds on the current page, then fires Stay15s once. */
export function trackStay15s(): void {
  if (typeof window === "undefined" || !PIXEL_ID || !loaded) return;

  const targetSeconds = 15;
  let activeSeconds = 0;
  let fired = false;

  const timer = window.setInterval(() => {
    if (document.visibilityState === "visible") activeSeconds++;

    if (activeSeconds >= targetSeconds && !fired) {
      fired = true;
      window.clearInterval(timer);
      window.fbq?.("trackCustom", "Stay15s", {
        duration: targetSeconds,
        page_url: window.location.pathname,
      });
    }
  }, 1000);
}
