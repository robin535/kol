"use client";

import { useState } from "react";
import type { Lang } from "../../data";
import { copyFor } from "../copy";

type Props = {
  lang: Lang;
  busy: boolean;
  error: string;
  onRetry: () => void;
};

export default function BrowserGuide({ lang, busy, error, onRetry }: Props) {
  const m = copyFor(lang);
  const [opening, setOpening] = useState(false);

  return (
    <section className="browser-guide">
      <div className="guide-content">
        <div className="guide-heading">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="safari-icon" src="/assets/safari-guide.png" alt="" />
          <h1 id="journey-title">{m.guideTitle}</h1>
        </div>
        <p className="guide-intro">{m.guideSub}</p>
        <ol className="browser-steps">
          <li>{m.step1}</li>
          <li>{m.step2}</li>
          <li>{m.step3}</li>
        </ol>
        <p className="journey-note">{m.guideHint}</p>
      </div>
      <div className="guide-copy-panel">
        <button
          type="button"
          className="primary"
          disabled={busy || opening}
          onClick={() => {
            if (busy || opening) return;
            setOpening(true);
            onRetry();
            window.setTimeout(() => setOpening(false), 1200);
          }}
        >
          {busy ? m.opening : m.browser}
        </button>
        <p className="form-error" role="alert">{error}</p>
      </div>
    </section>
  );
}
