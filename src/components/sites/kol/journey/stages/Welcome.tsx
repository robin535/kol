"use client";

import { useEffect, useState } from "react";
import type { Lang } from "../../data";
import { copyFor } from "../copy";
import { WELCOME_BR, WELCOME_MX } from "../util";

type Props = {
  lang: Lang;
  mode: "verify" | "matching";
  country: string;
  onStart: () => void;
  onMatched: () => void;
};

export default function Welcome({ lang, mode, country, onStart, onMatched }: Props) {
  const m = copyFor(lang);
  const photos =
    country === "BR"
      ? { intro: WELCOME_BR, memory: WELCOME_MX, matching: WELCOME_BR }
      : { intro: WELCOME_MX, memory: WELCOME_BR, matching: WELCOME_BR };

  const [progress, setProgress] = useState(0);
  const [opening, setOpening] = useState(false);

  /* Source `bind()`: the start button reports `opening` for ~650 ms while the
     entry challenge is issued, then the matching panel takes over. */
  useEffect(() => {
    if (!opening) return;
    const timer = window.setTimeout(onStart, 650);
    return () => window.clearTimeout(timer);
  }, [opening, onStart]);

  useEffect(() => {
    if (mode !== "matching") return;
    let value = 0;
    const started = Date.now();
    const timer = window.setInterval(() => {
      const left = Math.max(0, 10_000 - (Date.now() - started));
      value = Math.min(100, Math.floor((10_000 - left) / 100));
      setProgress(value);
      if (!left) {
        window.clearInterval(timer);
        onMatched();
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [mode, onMatched]);

  if (mode === "matching") {
    return (
      <section className="guest-entry guest-matching">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="guest-romance-background" src={photos.matching} alt="" />
        <div className="guest-panel">
          <span className="guest-spark" aria-hidden="true">♡</span>
          <h1 id="journey-title">{m.matching}</h1>
          <p className="guest-intro">{m.guestHint}</p>
          <div
            className="guest-progress"
            role="progressbar"
            aria-label={m.matching}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <i style={{ transform: `scaleX(${progress / 100})` }} />
          </div>
          <p className="guest-percent">{progress}%</p>
          <p id="journey-error" className="form-error" role="alert" />
        </div>
      </section>
    );
  }

  return (
    <section className="platform-welcome">
      <div className="welcome-card">
        <div className="welcome-hero" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="welcome-main-photo" src={photos.intro} alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="welcome-memory-photo" src={photos.memory} alt="" />
          <span className="welcome-heart">♡</span>
        </div>
        <div className="welcome-copy">
          <p className="welcome-eyebrow">{m.welcomeEyebrow}</p>
          <h1 id="journey-title">
            <span className="welcome-title-primary">{m.welcomeTitle}</span>
            <span className="welcome-title-secondary">{m.welcomeSubtitle}</span>
          </h1>
          <div className="welcome-intro">
            <p>{m.welcomeIntro}</p>
            <p>{m.welcomeDetail}</p>
          </div>
          <button
            id="guest-start"
            type="button"
            className="welcome-start"
            disabled={opening}
            aria-busy={opening}
            onClick={() => setOpening(true)}
          >
            {opening ? m.opening : m.welcomeStart}
            {!opening && <span aria-hidden="true">↗</span>}
          </button>
          <p id="guest-adult" className="welcome-adult">{m.welcomeAdult}</p>
          <p id="journey-error" className="form-error" role="alert" />
        </div>
      </div>
    </section>
  );
}
