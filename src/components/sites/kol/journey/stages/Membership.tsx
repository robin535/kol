"use client";

import type { Lang, Profile } from "../../data";
import { copyFor, fill } from "../copy";
import { INVITE_TARGET } from "../markets";
import { portraitOf, whatsappURL } from "../util";

type Props = {
  lang: Lang;
  amount: string;
  member: boolean;
  invites: number;
  link: string;
  profile: Profile | null;
  rewardLabel: string;
  status: string;
  error: string;
  busy: boolean;
  onUnlock: () => void;
  onCopy: () => void;
  onRefresh: () => void;
  onLogout: () => void;
  onReward: () => void;
  onRoom: () => void;
  onDiscover: () => void;
  onPoster: () => void;
};

export function ProfileStrip({ lang, profile }: { lang: Lang; profile: Profile | null }) {
  const m = copyFor(lang);
  if (!profile) return null;
  const picture = portraitOf(profile).thumb;
  return (
    <div className="journey-person">
      <span className="journey-portrait">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={picture} alt="" />
      </span>
      <div>
        <small>{m.savedProfile}</small>
        <strong>{profile.name}</strong>
        <span>{profile.city}{profile.age ? ` · ${profile.age}` : ""}</span>
      </div>
    </div>
  );
}

export default function Membership({
  lang,
  amount,
  member,
  invites,
  link,
  profile,
  rewardLabel,
  status,
  error,
  busy,
  onUnlock,
  onCopy,
  onRefresh,
  onLogout,
  onReward,
  onRoom,
  onDiscover,
  onPoster,
}: Props) {
  const m = copyFor(lang);
  const message = `${m.shareText}\n${link}`;

  return (
    <section className="membership-view reward-membership">
      <div className="reward-hero">
        <p className="reward-eyebrow">{m.eyebrow}</p>
        <h1 id="journey-title">{m.rewardTitle}</h1>
        <span className="reward-cash-label">{m.cash}</span>
        <div className="reward-amount">{amount}</div>
        <div className="reward-member">{m.plus}</div>
        <p className="reward-timing">{m.transferTiming}</p>
        <p className="reward-benefits">{m.benefits}</p>
      </div>
      <p className="reward-terms">{m.terms}</p>

      {member ? (
        <div className="reward-member-status">
          <h2>{m.unlockedMember}</h2>
          <button className="primary" data-journey="reward" onClick={onReward}>{rewardLabel}</button>
          <button className="journey-secondary" data-journey="room" onClick={onRoom}>{m.room} →</button>
          <button className="journey-secondary" data-journey="discover" onClick={onDiscover}>{m.unlimited}</button>
        </div>
      ) : (
        <div className="invitation-option">
          <h2>{m.inviteTitle}</h2>
          <div className="reward-steps" id="reward-steps">
            {Array.from({ length: INVITE_TARGET }, (_, i) => i + 1).map((n) => (
              <span
                key={n}
                className={`reward-step ${invites >= n ? "complete" : ""}`}
                data-reward-step={n}
                aria-label={`${n} / ${INVITE_TARGET}`}
              >
                <b>{invites >= n ? "✓" : n}</b>
              </span>
            ))}
          </div>
          <div className="invitation-meter">
            <strong id="invite-count">{m.progress(invites)}</strong>
            <progress id="invite-progress" max={INVITE_TARGET} value={Math.min(INVITE_TARGET, invites)} />
          </div>
          <button
            className="primary"
            id="unlock-button"
            data-journey="unlock"
            hidden={invites < INVITE_TARGET}
            disabled={busy}
            onClick={onUnlock}
          >
            {fill(m.unlock, amount)}
          </button>
          <div className="reward-share">
            <button
              type="button"
              className="whatsapp-share"
              onClick={() => window.open(whatsappURL(message, ""), "_blank", "noopener,noreferrer")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/whatsapp.svg" alt="" width={23} height={23} />
              {m.whatsapp}
            </button>
            <button className="journey-secondary poster-button" data-journey="poster" onClick={onPoster}>
              {m.poster}
            </button>
          </div>
          <p className="journey-status" role="status" id="copy-status">{status}</p>
          <button className="journey-secondary" data-journey="refresh-invites" onClick={onRefresh} disabled={busy}>
            {m.refresh}
          </button>
          <details className="journey-link">
            <summary>{m.inviteLink}</summary>
            <input readOnly value={link} onClick={(e) => (e.target as HTMLInputElement).select()} />
          </details>
          <p>{m.inviteSub}</p>
          <button className="journey-secondary" data-journey="copy-invite" onClick={onCopy}>
            {m.inviteCopy}
          </button>
        </div>
      )}

      <ProfileStrip lang={lang} profile={profile} />
      <p id="journey-error" className="form-error" role="alert">{error}</p>
      <button className="journey-secondary" data-journey="logout" onClick={onLogout}>{m.logout}</button>
    </section>
  );
}
