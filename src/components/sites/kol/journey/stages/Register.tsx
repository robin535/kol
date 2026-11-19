"use client";

import { useState } from "react";
import type { Lang } from "../../data";
import { copyFor, fill } from "../copy";
import { ROMANTIC_PHOTO } from "../util";

type Props = {
  lang: Lang;
  amount: string;
  mode: "register" | "login";
  busy: boolean;
  error: string;
  onToggleMode: () => void;
  onSubmit: (values: { username: string; password: string }) => void;
};

const EYE = (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default function Register({ lang, amount, mode, busy, error, onToggleMode, onSubmit }: Props) {
  const m = copyFor(lang);
  const login = mode === "login";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  return (
    <section className="registration-layout">
      <div className="registration-visual" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ROMANTIC_PHOTO} alt="" />
      </div>
      <div className="registration-hero">
        <div className="registration-hero-copy">
          <p className="registration-kicker">{m.registrationEyebrow}</p>
          <h1 id="journey-title">
            {m.registrationTitle.split("\n").map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </h1>
          <p className="registration-intro">{m.registrationIntro}</p>
        </div>
        <span className="registration-spark" aria-hidden="true">✧</span>
      </div>
      <div className="registration-panel register-view">
        <div className="registration-form-heading">
          <span className="registration-heart" aria-hidden="true">♡</span>
          <h2>{login ? m.loginTitle : m.registrationFormTitle}</h2>
          <p>{login ? m.loginSub : m.registrationSub}</p>
        </div>
        <form
          id="registration-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (busy) return;
            onSubmit({ username: username.trim(), password });
          }}
        >
          <label htmlFor="registration-username">{m.username}</label>
          <input
            id="registration-username"
            name="username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            minLength={3}
            maxLength={24}
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="registration-password">{m.password}</label>
          <div className="registration-password">
            <input
              id="registration-password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete={login ? "current-password" : "new-password"}
              minLength={6}
              maxLength={128}
              placeholder={m.registrationHint}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              data-registration-password=""
              aria-label={show ? m.registrationHide : m.registrationShow}
              aria-pressed={show}
              onClick={() => setShow((v) => !v)}
            >
              {EYE}
            </button>
          </div>
          <p className="form-error" id="form-error" role="alert">{error}</p>
          <button className="primary" type="submit" disabled={busy}>
            {busy ? m.processing : login ? m.loginCta : m.registrationCta}{" "}
            <span aria-hidden="true">→</span>
          </button>
        </form>
        <button
          className="journey-secondary registration-login"
          data-journey="toggle-login"
          type="button"
          onClick={onToggleMode}
        >
          {login ? m.haveNoAccount : m.haveAccount}
        </button>
        <p className="registration-adult">18+ · {m.registrationAdult}</p>
      </div>
      <div className="registration-benefit">
        <span aria-hidden="true">✦</span>
        <div>
          <strong>{m.registrationReward}</strong>
          <p>{fill(m.registrationRewardSub, amount)}</p>
        </div>
      </div>
    </section>
  );
}
