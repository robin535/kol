"use client";

import { useMemo, useState } from "react";
import type { Lang, Profile } from "../../data";
import { copyFor } from "../copy";
import { PHONE_COUNTRIES, countryName } from "../markets";
import { portraitOf } from "../util";

type Props = {
  lang: Lang;
  country: string;
  profile: Profile | null;
  busy: boolean;
  error: string;
  onSubmit: (values: { country: string; phone: string }) => void;
};

export default function PhoneRegister({ lang, country, profile, busy, error, onSubmit }: Props) {
  const m = copyFor(lang);
  const [code, setCode] = useState(country);
  const [phone, setPhone] = useState("");

  const options = useMemo(() => {
    const list = Object.keys(PHONE_COUNTRIES);
    const priority = ["BR", "MX", "TR", "IT", "ES", "PT"];
    return [...new Set([code, ...priority, ...list])].filter((c) => PHONE_COUNTRIES[c]);
  }, [code]);

  const picture = profile ? portraitOf(profile).thumb : "";

  return (
    <section className="phone-registration">
      <p className="phone-eyebrow">{m.phoneEyebrow}</p>
      <h1 id="journey-title">{m.phoneTitle}</h1>
      <p className="phone-intro">{m.phoneIntro}</p>
      {profile && (
        <div className="phone-selected">
          {picture && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={picture} alt="" width={48} height={56} />
          )}
          <div>
            <small>{m.phoneSelected}</small>
            <strong>
              {profile.name}
              {profile.age ? `, ${profile.age}` : ""}
            </strong>
          </div>
          <span aria-hidden="true">♡</span>
        </div>
      )}
      <div className="phone-form-card">
        <form
          id="phone-registration-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (busy) return;
            onSubmit({ country: code, phone });
          }}
        >
          <label htmlFor="phone-number">{m.phoneLabel}</label>
          <div className="phone-number-row">
            <select
              name="country"
              id="phone-country"
              aria-label={m.phoneCountry}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            >
              <option value="">{m.phoneChoose}</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {`${option} +${PHONE_COUNTRIES[option]} · ${countryName(option, lang)}`}
                </option>
              ))}
            </select>
            <input
              id="phone-number"
              name="phone"
              type="tel"
              dir="ltr"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder={m.phonePlaceholder}
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <p id="form-error" className="form-error" role="alert">{error}</p>
          <button className="primary phone-submit" type="submit" disabled={busy}>
            {busy ? m.saving : m.phoneSubmit} <span aria-hidden="true">→</span>
          </button>
        </form>
        <p className="phone-form-note">{m.phoneNote}</p>
      </div>
    </section>
  );
}
