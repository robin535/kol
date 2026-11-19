"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Lang, Profile } from "../data";
import { copyFor, fill } from "./copy";
import { useCountry } from "./country";
import { INVITE_TARGET, marketAmount, marketOf } from "./markets";
import {
  getSession,
  setSessionAccount,
  setSessionInvites,
  setSessionReward,
  updateSessionAccount,
  useSession,
} from "./store";
import { savePersonalProfile, shareReminderDismissed, type RewardRecord } from "./storage";
import { copyText, inviteURL, ROMANTIC_PHOTO, sleep } from "./util";
import Poster from "./Poster";
import BrowserGuide from "./stages/BrowserGuide";
import ChatRoom, { type ChatMessage } from "./stages/ChatRoom";
import Membership from "./stages/Membership";
import PersonalProfile from "./stages/PersonalProfile";
import PhoneRegister from "./stages/PhoneRegister";
import Register from "./stages/Register";
import RewardBank from "./stages/RewardBank";
import ShareReminderModal from "./stages/ShareReminder";
import Welcome from "./stages/Welcome";

export type JourneyStage =
  | "verify"
  | "matching"
  | "guide"
  | "phone"
  | "personal-profile"
  | "register"
  | "membership"
  | "reward"
  | "room";

type Props = {
  lang: Lang;
  profile: Profile | null;
  stage: JourneyStage;
  onStage: (stage: JourneyStage) => void;
  onClose: (() => void) | null;
  /** Full-page variant used by /join instead of the dialog overlay. */
  page?: boolean;
};

function messageId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const LOCKED_STAGES: JourneyStage[] = [
  "verify",
  "matching",
  "guide",
  "phone",
  "personal-profile",
  "register",
];

export default function Journey({ lang, profile, stage, onStage, onClose, page = false }: Props) {
  const router = useRouter();
  const session = useSession();
  const account = session.account;
  const invites = session.invites;
  const reward = session.reward;

  const m = copyFor(lang);
  const [country] = useCountry();
  const amount = marketAmount(country);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loginMode, setLoginMode] = useState(false);
  const [status, setStatus] = useState("");
  const [showReminder, setShowReminder] = useState(false);
  const [showPoster, setShowPoster] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const botTimer = useRef<number | null>(null);
  const [welcomeKey, setWelcomeKey] = useState(0);

  const inviteLink = useMemo(() => inviteURL(account?.id ?? null), [account?.id]);

  const go = useCallback(
    (next: JourneyStage) => {
      setError("");
      setStatus("");
      onStage(next);
    },
    [onStage],
  );

  const goRoom = useCallback(() => {
    setError("");
    setStatus("");
    if (messages.length === 0 && account) {
      const thumb = profile?.portrait.thumb;
      setMessages([
        { id: messageId(), author: profile?.name ?? m.roomTitle, bot: true, thumb, content: m.welcome },
        { id: messageId(), author: profile?.name ?? m.roomTitle, bot: true, thumb, content: m.topic },
      ]);
    }
    onStage("room");
  }, [account, m, messages.length, onStage, profile]);

  /* The share reminder appears once after a fresh registration. */
  useEffect(() => {
    if (!account || account.member || invites >= INVITE_TARGET) return;
    if (shareReminderDismissed(account)) return;
    const left = account.createdAt + 3_600_000 - Date.now();
    if (left <= 0 || left > 3_600_000) return;
    const timer = window.setTimeout(() => setShowReminder(true), 900);
    return () => window.clearTimeout(timer);
  }, [account, invites]);

  useEffect(() => {
    return () => {
      if (botTimer.current) window.clearTimeout(botTimer.current);
    };
  }, []);

  const finishEntry = useCallback(() => {
    if (onClose) onClose();
    else router.push("/");
  }, [onClose, router]);

  /* Once the guest entry has verified, go straight into account creation so
     the rest of the journey (phone, profile, rewards, chat) is reachable. */
  const finishMatch = useCallback(() => {
    if (account) {
      finishEntry();
      return;
    }
    go("register");
  }, [account, finishEntry, go]);

  const register = useCallback(
    (values: { username: string; password: string }) => {
      const username = values.username.trim();
      if (!/^[\w一-龥ऀ-ॿ]{3,24}$/.test(username)) {
        setError(m.usernameError);
        return;
      }
      if (values.password.length < 6) {
        setError(m.passwordError);
        return;
      }
      setError("");
      setBusy(true);
      window.setTimeout(() => {
        setBusy(false);
        if (loginMode) {
          const existing = getSession().account;
          if (existing) {
            go(existing.phoneRegistered ? "membership" : "phone");
          } else {
            setError(m.credentials);
          }
          return;
        }
        const next: AccountLike = {
          id: makeId(),
          username,
          createdAt: Date.now(),
          role: "user",
          guest: true,
          phoneRegistered: false,
          member: false,
          personalProfileComplete: false,
        };
        setSessionAccount(next);
        setStatus(m.accountCreated);
        window.setTimeout(() => {
          setStatus("");
          go("phone");
        }, 700);
      }, 350);
    },
    [go, loginMode, m.accountCreated, m.credentials, m.passwordError, m.usernameError],
  );

  const submitPhone = useCallback(
    (values: { phone: string }) => {
      if (!/^\d{5,15}$/.test(values.phone.replace(/[\s-]/g, ""))) {
        setError(m.phoneInvalid);
        return;
      }
      setError("");
      setBusy(true);
      window.setTimeout(() => {
        setBusy(false);
        updateSessionAccount({ phoneRegistered: true });
        go("personal-profile");
      }, 400);
    },
    [go, m.phoneInvalid],
  );

  const unlock = useCallback(async () => {
    if (!account) return;
    setBusy(true);
    setError("");
    await sleep(600);
    setBusy(false);
    updateSessionAccount({ member: true });
    setSessionInvites(Math.max(INVITE_TARGET, invites));
    setShowReminder(false);
  }, [account, invites]);

  const simulateInvite = useCallback(() => {
    if (!account) return;
    const next = Math.min(INVITE_TARGET, invites + 1);
    setSessionInvites(next);
    setStatus(m.progress(next));
  }, [account, invites, m]);

  const saveBank = useCallback(
    (values: { bankAccount: string }) => {
      if (!account) return;
      setBusy(true);
      window.setTimeout(() => {
        setBusy(false);
        const market = marketOf(country);
        const record: RewardRecord = {
          status: "pending",
          amount: market.reward * 100,
          currency: market.currency,
          last4: values.bankAccount.replace(/\s/g, "").slice(-4),
        };
        setSessionReward(record);
        goRoom();
      }, 500);
    },
    [account, country, goRoom],
  );

  const sendMessage = useCallback(
    (text: string) => {
      if (!account) return;
      setMessages((prev) => [...prev, { id: messageId(), author: m.me, mine: true, content: text }]);
      if (botTimer.current) window.clearTimeout(botTimer.current);
      botTimer.current = window.setTimeout(() => {
        const lines = [m.replyA, m.replyB, m.replyC];
        const line = lines[Math.floor(Math.random() * lines.length)];
        setMessages((prev) => [
          ...prev,
          {
            id: messageId(),
            author: profile?.name ?? m.roomTitle,
            bot: true,
            thumb: profile?.portrait.thumb,
            content: line,
          },
        ]);
      }, 1200);
    },
    [account, m, profile],
  );

  function openRoom() {
    if (!account) {
      go("register");
      return;
    }
    if (!account.member) {
      go("membership");
      return;
    }
    goRoom();
  }

  const dark =
    ["verify", "matching", "guide"].includes(stage) ||
    stage === "register" ||
    stage === "phone" ||
    stage === "personal-profile";

  const header = (
    <header className="journey-header">
      <span className="wordmark">
        kol<span>♡</span>
      </span>
      {onClose && !LOCKED_STAGES.includes(stage) && (
        <button className="journey-close" data-journey="close" aria-label={m.close} onClick={onClose}>
          ×
        </button>
      )}
    </header>
  );

  let body: React.ReactNode = null;
  if (stage === "verify") {
    body = (
      <Welcome
        key={`verify-${welcomeKey}`}
        lang={lang}
        mode="verify"
        country={country}
        onStart={() => go("matching")}
        onMatched={finishMatch}
      />
    );
  } else if (stage === "matching") {
    body = (
      <Welcome
        key={`match-${welcomeKey}`}
        lang={lang}
        mode="matching"
        country={country}
        onStart={() => undefined}
        onMatched={finishMatch}
      />
    );
  } else if (stage === "guide") {
    body = (
      <BrowserGuide
        lang={lang}
        busy={busy}
        error={error}
        onRetry={() => {
          setBusy(true);
          setError("");
          window.setTimeout(() => {
            setBusy(false);
            setWelcomeKey((k) => k + 1);
            go("verify");
          }, 900);
        }}
      />
    );
  } else if (stage === "phone") {
    body = (
      <PhoneRegister
        lang={lang}
        country={country}
        profile={profile}
        busy={busy}
        error={error}
        onSubmit={submitPhone}
      />
    );
  } else if (stage === "personal-profile") {
    body = (
      <PersonalProfile
        lang={lang}
        initial={null}
        defaults={{ gender: account?.settings?.gender, hobby: account?.settings?.hobby }}
        busy={busy}
        error={error}
        onSubmit={(value) => {
          if (!account) return;
          savePersonalProfile(account.id, value);
          setBusy(true);
          window.setTimeout(() => {
            setBusy(false);
            updateSessionAccount({ personalProfileComplete: true });
            go("membership");
          }, 450);
        }}
      />
    );
  } else if (stage === "register") {
    body = (
      <Register
        lang={lang}
        amount={amount}
        mode={loginMode ? "login" : "register"}
        busy={busy}
        error={error}
        onToggleMode={() => {
          setLoginMode((v) => !v);
          setError("");
        }}
        onSubmit={register}
      />
    );
  } else if (stage === "membership") {
    body = (
      <Membership
        lang={lang}
        amount={amount}
        member={Boolean(account?.member)}
        invites={invites}
        link={inviteLink}
        profile={profile}
        rewardLabel={reward ? m.rewardAction : m.rewardSubmit}
        status={status}
        error={error}
        busy={busy}
        onUnlock={() => void unlock()}
        onCopy={async () => {
          const ok = await copyText(inviteLink);
          setStatus(ok ? m.copied : m.copyFail);
        }}
        onRefresh={() => {
          setSessionInvites(getSession().invites);
          setStatus(m.refresh);
        }}
        onLogout={() => {
          setSessionAccount(null);
          go("verify");
        }}
        onReward={() => go("reward")}
        onRoom={openRoom}
        onDiscover={finishEntry}
        onPoster={() => setShowPoster(true)}
      />
    );
  } else if (stage === "reward") {
    body = (
      <RewardBank
        lang={lang}
        country={country}
        amount={amount}
        reward={reward}
        busy={busy}
        onDiscover={finishEntry}
        onSubmit={saveBank}
      />
    );
  } else if (stage === "room") {
    body = (
      <ChatRoom
        lang={lang}
        profile={profile}
        messages={messages}
        muted={false}
        closed={false}
        error={error}
        rewardLabel={reward ? `${amount} · ${m[reward.status]}` : `${amount} · ${m.cash}`}
        onBack={() => go("membership")}
        onReward={() => go("reward")}
        onSend={sendMessage}
      />
    );
  }

  const stageClass = page
    ? `journey-page ${dark ? "journey-dark" : ""}`
    : `kj-dialog ${stage === "verify" || stage === "matching" ? "kj-full" : ""}`;

  /* The source paints one shared romantic photograph behind the invitation
     and reward steps. */
  const ambience = ["membership", "reward", "guide"].includes(stage);

  const shell = (
    <div className={`journey-shell ${ambience ? "kol-ambience-surface" : ""}`}>
      {ambience && (
        <div className="kol-ambience" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ROMANTIC_PHOTO} alt="" />
        </div>
      )}
      {header}
      {body}
    </div>
  );

  const overlays = (
    <>
      {showReminder && account && (
        <ShareReminderModal
          lang={lang}
          account={account}
          amount={amount}
          plus={m.plus}
          terms={fill(m.terms, amount)}
          shareText={fill(m.shareText, amount)}
          link={inviteLink}
          onClose={() => setShowReminder(false)}
        />
      )}
      {showPoster && (
        <Poster
          lang={lang}
          amount={amount}
          link={inviteLink}
          status={status}
          onClose={() => setShowPoster(false)}
          onCopy={async () => {
            const ok = await copyText(inviteLink);
            setStatus(ok ? m.copied : m.copyFail);
          }}
        />
      )}
      {stage === "membership" && !account?.member && (
        <button type="button" className="dev-invite" onClick={simulateInvite}>
          {m.simulate}
        </button>
      )}
    </>
  );

  if (page) {
    return (
      <div className="kol-root join-body">
        <div className={stageClass} data-journey-stage={stage}>
          {shell}
        </div>
        {overlays}
      </div>
    );
  }

  return (
    <div className={`kj-overlay ${dark ? "kj-dark" : ""}`}>
      <div className={stageClass} data-journey-stage={stage}>
        {shell}
      </div>
      {overlays}
    </div>
  );
}

/* Local aliases keep the component free of storage-layer type imports. */
type AccountLike = NonNullable<ReturnType<typeof getSession>["account"]>;

function makeId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `a${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
