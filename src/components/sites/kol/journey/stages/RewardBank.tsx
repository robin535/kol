"use client";

import { useState } from "react";
import type { Lang } from "../../data";
import { copyFor, fill } from "../copy";
import { marketOf } from "../markets";
import type { RewardRecord } from "../storage";

type Props = {
  lang: Lang;
  country: string;
  amount: string;
  reward: RewardRecord | null;
  busy: boolean;
  onDiscover: () => void;
  onSubmit: (values: {
    holder: string;
    bankAccount: string;
    confirmation: string;
    ifsc?: string;
    pixType?: string;
  }) => void;
};

export default function RewardBank({
  lang,
  country,
  amount,
  reward,
  busy,
  onDiscover,
  onSubmit,
}: Props) {
  const m = copyFor(lang);
  const market = marketOf(country);
  const kind = market.bankType;

  const [holder, setHolder] = useState("");
  const [account, setAccount] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [pixType, setPixType] = useState("email");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");

  if (reward && reward.status !== "needs_update") {
    return (      <section className="bank-view">
        <p className="journey-eyebrow">{m.cashStatus}</p>
        <h1 id="journey-title">{m[reward.status]}</h1>
        <div className="bank-reward-total">{amount}</div>
        <p>
          {m.last4} <strong>•••• {reward.last4}</strong>
        </p>
        {reward.reference && (
          <p>
            {m.reference}: {reward.reference}
          </p>
        )}
        <p className="journey-intro">{m.rewardHelp}</p>
        <button className="primary" data-journey="discover" onClick={onDiscover}>
          {m.browseAfterReward} →
        </button>
      </section>
    );
  }

  const label = kind === "ifsc" || kind === "swift" ? m.bankAccount : m[kind];
  const confirmLabel =
    kind === "ifsc" || kind === "swift" ? m.bankConfirmation : m[`${kind}Confirm` as const];
  const hint = kind === "swift" ? m.swiftHint : m[`${kind}Hint` as const];
  const attrs =
    kind === "ifsc"
      ? { inputMode: "numeric" as const, pattern: "[0-9]{6,34}", minLength: 6, maxLength: 34 }
      : kind === "clabe"
        ? { inputMode: "numeric" as const, pattern: "[0-9 ]{18,24}", minLength: 18, maxLength: 24 }
        : kind === "iban"
          ? { autoCapitalize: "characters" as const, minLength: 24, maxLength: 34, spellCheck: false }
          : { maxLength: 77, spellCheck: false, autoCapitalize: "none" as const };

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!consent) {
      setError(m.bankConsentError);
      return;
    }
    if (account.trim() !== confirmation.trim()) {
      setError(m.bankMismatch);
      return;
    }
    if (kind === "ifsc" && !/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(ifsc.trim())) {
      setError(m.bankError);
      return;
    }
    setError("");
    onSubmit({
      holder: holder.trim(),
      bankAccount: account.trim(),
      confirmation: confirmation.trim(),
      ifsc: ifsc.trim().toUpperCase(),
      pixType: kind === "pix" ? pixType : undefined,
    });
  }

  return (
    <section className="register-view bank-view">
      <p className="journey-eyebrow">{m.plus}</p>
      <h1 id="journey-title">{fill(m.bankTitle, amount)}</h1>
      <p className="journey-intro">{m.bankSub}</p>
      {reward?.note && <p className="form-error">{reward.note}</p>}
      <form id="bank-form" onSubmit={submit}>
        <label>
          {m.holder}
          <input
            name="holder"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            required
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
          />
        </label>

        {kind === "pix" && (
          <label>
            {m.pixType}
            <select name="pixType" value={pixType} onChange={(e) => setPixType(e.target.value)}>
              <option value="email">{m.pixEmail}</option>
              <option value="phone">{m.pixPhone}</option>
              <option value="random">{m.pixRandom}</option>
            </select>
          </label>
        )}

        <label>
          {label}
          <input
            name="bankAccount"
            autoComplete="off"
            required
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            {...attrs}
          />
        </label>
        <label>
          {confirmLabel}
          <input
            name="confirmation"
            autoComplete="off"
            required
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            {...attrs}
          />
        </label>

        {kind === "ifsc" ? (
          <label>
            {m.ifsc}
            <input
              name="ifsc"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              minLength={11}
              maxLength={11}
              required
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
            />
            <small>{m.ifscHint}</small>
          </label>
        ) : (
          <p className="journey-note">{hint}</p>
        )}

        <label className="bank-consent">
          <input
            type="checkbox"
            name="consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
          />
          <span>{m.bankConsent}</span>
        </label>
        <p className="form-error" id="form-error" role="alert">{error}</p>
        <button className="primary" type="submit" disabled={busy}>
          {busy ? m.saving : m.bankSubmit} →
        </button>
      </form>
      <p className="journey-note">{m.bankPrivacy}</p>
    </section>
  );
}
