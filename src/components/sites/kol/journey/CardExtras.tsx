"use client";

import { useEffect, useState } from "react";
import type { Lang } from "../data";
import { copyFor } from "./copy";

/** Small first-visit hint overlaid on the discovery card. */
export function SwipeGuide({ lang }: { lang: Lang }) {
  const m = copyFor(lang);
  const [visible, setVisible] = useState(false);
  const [hand, setHand] = useState(0);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.localStorage.getItem("kol-swipe-guide-v1") === "shown";
      if (!seen) window.localStorage.setItem("kol-swipe-guide-v1", "shown");
    } catch {
      seen = true;
    }
    if (seen) return;
    const show = window.setTimeout(() => setVisible(true), 0);
    const timer = window.setTimeout(() => setVisible(false), 5200);
    const dismiss = () => setVisible(false);
    window.addEventListener("pointerdown", dismiss, { capture: true, once: true });
    const keydown = (event: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "Escape", "Enter", " "].includes(event.key)) dismiss();
    };
    window.addEventListener("keydown", keydown, true);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", dismiss, true);
      window.removeEventListener("keydown", keydown, true);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const started = Date.now();
    const timer = window.setInterval(() => {
      const t = (Date.now() - started) % 2600;
      let x = 0;
      if (t >= 1400 && t < 1820) {
        const k = Math.min(1, (t - 1400) / 420);
        x = 45 * k;
      } else if (t >= 2340 && t < 2600) {
        const k = Math.min(1, (t - 2340) / 260);
        x = 45 * (1 - k);
      }
      setHand(x);
    }, 60);
    return () => window.clearInterval(timer);
  }, [visible]);

  if (!visible) return null;
  const text =
    lang === "zh"
      ? { left: "← 左滑 Pass", right: "右滑喜欢 →", hint: "滑动照片试试，也可以点下方按钮" }
      : lang === "hi"
        ? { left: "← बाएँ छोड़ें", right: "दाएँ पसंद करें →", hint: "फ़ोटो स्वाइप करें या नीचे के बटन दबाएँ" }
        : { left: "← Swipe to pass", right: "Swipe to like →", hint: "Swipe the photo, or use the buttons below" };

  return (
    <div className="swipe-guide" role="status" aria-live="polite">
      <div className="swipe-guide-labels">
        <span>{text.left}</span>
        <span>{text.right}</span>
      </div>
      <div className="swipe-guide-track" aria-hidden="true">
        <i>×</i>
        <span className="swipe-guide-hand" style={{ transform: `translateX(${hand}px)` }}>👆</span>
        <i>♥</i>
      </div>
      <p>{text.hint}</p>
      <span className="sr-only">{m.later}</span>
    </div>
  );
}

/** Floating campaign banner used above the discovery deck. */
export function CampaignBanner({
  lang,
  amount,
  onInvite,
}: {
  lang: Lang;
  amount: string;
  onInvite?: () => void;
}) {
  const m = copyFor(lang);
  return (
    <aside className="campaign-banner" aria-label={m.eyebrow}>
      <div className="campaign-heading">
        <strong>{amount}</strong>
        <span>
          {m.cash}
          <b>{m.plus}</b>
        </span>
        {onInvite && (
          <button type="button" className="campaign-invite" onClick={onInvite}>
            {m.inviteNow}
            <span aria-hidden="true"> →</span>
          </button>
        )}
      </div>
      <p>{m.campaignTerms}</p>
    </aside>
  );
}
