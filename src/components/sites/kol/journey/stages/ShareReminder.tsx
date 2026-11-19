"use client";

import { useEffect, useState } from "react";
import type { Lang } from "../../data";
import { copyFor } from "../copy";
import { dismissShareReminder, type Account } from "../storage";
import { whatsappURL } from "../util";

type Props = {
  lang: Lang;
  account: Account;
  amount: string;
  terms: string;
  plus: string;
  shareText: string;
  link: string;
  onClose: () => void;
};

export default function ShareReminderModal({
  lang,
  account,
  amount,
  terms,
  plus,
  shareText,
  link,
  onClose,
}: Props) {
  const m = copyFor(lang);
  const target = account.createdAt + 3_600_000;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const left = Math.max(0, Math.ceil((target - now) / 1000));
  const state = {
    label: [Math.floor(left / 3600), Math.floor((left % 3600) / 60), left % 60]
      .map((n) => String(n).padStart(2, "0"))
      .join(":"),
    ended: left === 0,
  };

  function close() {
    dismissShareReminder(account);
    onClose();
  }

  return (
    <div className="kol-modal" role="presentation" onClick={close}>
      <div
        className="kol-modal-card registration-reward-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-reward-title"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="registration-reward-content">
          <div className="registration-success-mark" aria-hidden="true">✓</div>
          <h2 id="registration-reward-title">{m.shareTitle}</h2>
          <p className="registration-reward-intro">{m.shareIntro}</p>
          <strong className="registration-reward-amount">{amount}</strong>
          <p className="registration-reward-membership">{plus}</p>
          <div className={`registration-share-clock ${state.ended ? "reminder-ended" : ""}`}>
            <span>{state.ended ? m.shareEnded : m.shareTimer}</span>
            <time dateTime={state.ended ? undefined : `PT${state.label}S`}>{state.label}</time>
          </div>
          <p className="registration-reward-terms">{terms}</p>
          <footer>
            <a
              className="whatsapp-share"
              href={whatsappURL(shareText, link)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => dismissShareReminder(account)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/whatsapp.svg" alt="" width={23} height={23} />
              {m.shareNow}
            </a>
            <p className="registration-share-hint">{m.shareHelp}</p>
            <button type="button" className="registration-share-later" onClick={close}>
              {m.shareLater}
            </button>
          </footer>
        </section>
      </div>
    </div>
  );
}
