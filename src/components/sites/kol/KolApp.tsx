"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { QuizResult } from "./Quiz";
import QuizDialog from "./QuizDialog";
import {
  BRAND,
  LANGS,
  IDEAL_CHOICES,
  normalizeProfiles,
  pickText,
  type Gender,
  type Lang,
  type Profile,
} from "./data";
import { CampaignBanner, SwipeGuide } from "./journey/CardExtras";
import { useCountry } from "./journey/country";
import Journey, { type JourneyStage } from "./journey/Journey";
import { COUNTRY_ORDER, marketAmount } from "./journey/markets";
import { MusicToggle } from "./journey/MusicToggle";
import { setLikeIds, useLikeIds, useSession } from "./journey/store";

type Screen = "about" | "discover";

type Props = {
  heroes: { man: string; woman: string };
};

export default function KolApp({ heroes }: Props) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  useEffect(() => {
    let live = true;
    fetch("/data/profiles.json")
      .then((r) => r.json())
      .then((raw: Profile[]) => {
        if (live) setProfiles(normalizeProfiles(raw));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  const [lang, setLang] = useState<Lang>("en");
  const [langOpen, setLangOpen] = useState(false);
  const [country, setCountry] = useCountry();
  const [, setScreen] = useState<Screen>("about");
  const [editOpen, setEditOpen] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const [tab, setTab] = useState<"discover" | "likes">("discover");
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<
    { profile: Profile; action: "like" | "pass" }[]
  >([]);
  const [info, setInfo] = useState<Profile | null>(null);

  /* Journey overlay opened from the profile card or the campaign banner. */
  const [journey, setJourney] = useState<{
    stage: JourneyStage;
    profile: Profile | null;
  } | null>(null);

  const session = useSession();
  const account = session.account;
  const likedIds = useLikeIds();
  const likes = useMemo(
    () =>
      likedIds
        .map((id) => profiles.find((p) => p.id === id))
        .filter((p): p is Profile => Boolean(p)),
    [likedIds, profiles],
  );

  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; active: boolean } | null>(null);
  const dragRef = useRef({ x: 0, y: 0 });

  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);
  const toastSeq = useRef(0);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1700);
    return () => window.clearTimeout(t);
  }, [toast]);

  /* Deck is derived: rebuilt whenever the answer or the loaded profiles change. */
  const deck = useMemo<Profile[]>(() => {
    if (!result || !profiles.length) return [];
    const wanted: Gender = result.gender === "man" ? "woman" : "man";
    const ideal = IDEAL_CHOICES[wanted].find((o) => o.id === result.idealType);
    return profiles
      .filter((p) => p.gender === wanted)
      .slice()
      .sort((a, b) => {
        const score = (p: Profile) =>
          (p.traits?.includes(result.traits[0]) ? 2 : 0) +
          (ideal && p.ideal === ideal.id ? 1 : 0);
        return score(b) - score(a);
      });
  }, [result, profiles]);

  const top = deck[index];
  const under = deck[index + 1];
  const discoverActive = tab === "discover";
  const likesActive = tab === "likes";

  function showToast(msg: string) {
    toastSeq.current += 1;
    setToast({ msg, key: toastSeq.current });
  }




  /* Source flow: answering the dialog closes it, then the dialog reopens over the
     editorial landing (welcome-stage) while profiles are prepared. */
  function onQuizComplete(r: QuizResult) {
    setResult(r);
    setIndex(0);
    setHistory([]);
    setTab("discover");
    setScreen("about");
    setEditOpen(false);
  }

  function likeProfile(p: Profile) {
    setLikeIds([p.id, ...likedIds.filter((id) => id !== p.id)]);
    setIndex((i) => i + 1);
    setHistory((prev) => [...prev, { profile: p, action: "like" }]);
    showToast(`${p.name} added to your likes`);
  }
  function passTop() {
    if (!top) return;
    setIndex((i) => i + 1);
    setHistory((prev) => [...prev, { profile: top, action: "pass" }]);
    showToast(`Skipped ${top.name}`);
  }
  function undo() {
    const last = history[history.length - 1];
    if (!last) return;
    setHistory((prev) => prev.slice(0, -1));
    setIndex((i) => Math.max(0, i - 1));
    if (last.action === "like") {
      setLikeIds(likedIds.filter((id) => id !== last.profile.id));
    }
    showToast("Went back one");
  }
  function restart() {
    if (!result) return;
    setIndex(0);
    setHistory([]);
    setScreen("discover");
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!top) return;
    dragStart.current = { x: e.clientX, y: e.clientY, active: true };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const s = dragStart.current;
    if (!s?.active) return;
    const next = { x: e.clientX - s.x, y: e.clientY - s.y };
    dragRef.current = next;
    setDrag(next);
  }
  function onPointerUp() {
    const s = dragStart.current;
    if (!s?.active) return;
    s.active = false;
    const dx = dragRef.current.x;
    dragRef.current = { x: 0, y: 0 };
    setDrag({ x: 0, y: 0 });
    setDragging(false);
    if (dx > 110 && top) likeProfile(top);
    else if (dx < -110) passTop();
  }
  function cancelDrag() {
    if (dragStart.current) dragStart.current.active = false;
    dragRef.current = { x: 0, y: 0 };
    setDrag({ x: 0, y: 0 });
    setDragging(false);
  }

  const likeStamp = dragging ? Math.min(Math.max(drag.x, 0) / 120, 1) : 0;
  const passStamp = dragging ? Math.min(Math.max(-drag.x, 0) / 120, 1) : 0;
  const rotate = dragging ? drag.x / 18 : 0;

  /* Source landing artwork before any answer: man on the left, woman on the right. */
  const heroSrc = !result || result.gender === "man" ? heroes.man : heroes.woman;
  const amount = marketAmount(country);

  const openJourney = (stage: JourneyStage, profile: Profile | null = info) => {
    setJourney({ stage, profile });
    setInfo(null);
  };

  const heroNote = useMemo(
    () => (lang === "zh" ? "成年示例人物 · 喜欢已保存" : "Fictional adults · likes are saved"),
    [lang],
  );

  // Source page runs the discovery layout while the deck screen is active.
  useEffect(() => {
    document.body.classList.add("in-discovery");
    return () => document.body.classList.remove("in-discovery");
  }, []);

  return (
    <div className="kol-root">
      <div className="desktop-wordmark" aria-hidden="true">
        kol<span>♡</span>
      </div>

      <main className="workspace">
        <aside className="editorial" aria-label={BRAND.title}>
          <div className="editorial-kicker">
            {lang === "es" ? "UN POCO DE QUÍMICA." : "A LITTLE CHEMISTRY."}
          </div>
          {lang === "es" ? (
            <h1>
              Alguien
              <br />
              de tu <em>tipo.</em>
            </h1>
          ) : (
            <h1>
              Someone
              <br />
              your <em>kind.</em>
            </h1>
          )}
          <p className="editorial-sub">
            {lang === "es"
              ? "Una mirada. Una chispa. Un nuevo comienzo."
              : "A glance. A spark. A new beginning."}
          </p>
          <div className="editorial-portraits" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="portrait-one" src={heroSrc} alt="" width={1024} height={1536} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="portrait-two"
              src={result?.gender === "man" ? heroes.woman : heroes.man}
              alt=""
              width={1024}
              height={1536}
            />
            <span className="portrait-heart">♡</span>
          </div>
        </aside>

        <section className="phone-app" aria-label={`${BRAND.name} mobile preview`}>
          <header className="app-header">
            <Link className="wordmark" href="/" aria-label={`${BRAND.name} home`}>
              kol<span>♡</span>
            </Link>
            <div className="header-right">
              <MusicToggle lang={lang} />
              <button
                className="language-button"
                aria-haspopup="true"
                aria-expanded={langOpen}
                onClick={() => setLangOpen((v) => !v)}
              >
                {LANGS.find((l) => l.code === lang)?.label ?? "English"} <span>⌄</span>
              </button>
            </div>
            <div className="language-menu" hidden={!langOpen}>
              <label className="country-select-label">
                <span>{lang === "zh" ? "国家 / 地区" : "Country"}</span>
                <select
                  name="country"
                  aria-label={lang === "zh" ? "国家 / 地区" : "Country"}
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setLangOpen(false);
                  }}
                >
                  {COUNTRY_ORDER.map((code) => (
                    <option key={code} value={code}>
                      {code} · {new Intl.DisplayNames([lang === "zh" ? "zh-CN" : lang], {
                        type: "region",
                        fallback: "code",
                      }).of(code) ?? code}
                    </option>
                  ))}
                </select>
              </label>
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setLangOpen(false);
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </header>

          <div className="app-content">
            {!result ? (
              <div className="welcome-stage" aria-hidden="true">
                <span>♡</span>
                <p>A LITTLE CHEMISTRY.</p>
                <h2>
                  Someone
                  <br />
                  your kind.
                </h2>
              </div>
            ) : tab === "discover" ? (
              <div className="discover">
                <div className="discover-top">
                  <div className="discover-tabs">
                    <button
                      className={`tab ${discoverActive ? "active" : ""}`}
                      onClick={() => setTab("discover")}
                    >
                      {lang === "zh" ? "发现" : "Discover"}{" "}
                      <span className="count">{Math.max(0, deck.length - index)}</span>
                    </button>
                    <button
                      className={`tab ${likesActive ? "active" : ""}`}
                      onClick={() => setTab("likes")}
                    >
                      {lang === "zh" ? "喜欢" : "Likes"}{" "}
                      <span className="count">{likes.length}</span>
                    </button>
                  </div>
                  <button
                    className="icon-btn"
                    aria-label="Adjust preferences"
                    onClick={() => setEditOpen(true)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 7h9m4 0h3M4 17h3m4 0h9" />
                      <circle cx="15" cy="7" r="2" />
                      <circle cx="9" cy="17" r="2" />
                    </svg>
                  </button>
                </div>

                <CampaignBanner
                  lang={lang}
                  amount={amount}
                  onInvite={() => openJourney(account ? "membership" : "verify", null)}
                />

                {top ? (
                  <>
                    <div className="deck">
                      <SwipeGuide lang={lang} />
                      <div className="card-under" aria-hidden="true" />
                      {under && (
                        <div
                          className="profile-card under"
                          style={{ transform: "scale(0.97) translateY(10px)" }}
                          aria-hidden="true"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img className="profile-photo" src={under.portrait.card} alt="" />
                          <div className="photo-shade" />
                        </div>
                      )}
                      <div
                        className={`profile-card ${dragging ? "dragging" : ""}`}
                        style={{
                          transform: `translate(${drag.x}px, ${drag.y}px) rotate(${rotate}deg)`,
                          transition: dragging ? "none" : "transform .18s ease",
                        }}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={cancelDrag}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="profile-photo"
                          src={top.portrait.card}
                          alt=""
                          draggable={false}
                        />
                        <div className="photo-shade" />
                        <span className="sample-label">
                          {lang === "zh" ? "成年示例人物" : "Fictional adult"}
                        </span>
                        <button
                          className="card-info-button"
                          aria-label={`About ${top.name}`}
                          onClick={() => setInfo(top)}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 11v6M12 7h.01" />
                          </svg>
                        </button>
                        <div className="profile-copy">
                          <span className="shared">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />
                            </svg>
                            {lang === "zh" ? "为你发现" : "For you"}
                          </span>
                          <h2>
                            {top.name} <span>{top.age}</span>
                          </h2>
                          <div className="profile-location">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
                              <circle cx="12" cy="10" r="2" />
                            </svg>
                            {top.city}
                          </div>
                          <div className="profile-tags">
                            {(top.traits ?? []).slice(0, 3).map((t) => (
                              <span key={t}>{t}</span>
                            ))}
                          </div>
                        </div>
                        <div className="swipe-stamp" style={{ opacity: likeStamp }}>
                          LIKE
                        </div>
                        <div className="swipe-stamp pass" style={{ opacity: passStamp }}>
                          PASS
                        </div>
                      </div>
                    </div>

                    <div className="deck-actions">
                      <div className="action-row">
                        <button
                          className="round-action undo"
                          aria-label="Undo last swipe"
                          disabled={history.length === 0}
                          onClick={undo}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M4 9h9a7 7 0 1 1-6.3 10M4 9l5-5M4 9l5 5" />
                          </svg>
                        </button>
                        <button className="round-action pass-action" aria-label="Pass" onClick={passTop}>
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="m6 6 12 12M6 18 18 6" />
                          </svg>
                        </button>
                        <button
                          className="round-action like-action"
                          aria-label="Like"
                          onClick={() => top && likeProfile(top)}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                          </svg>
                        </button>
                      </div>
                      <div className="swipe-directions">
                        <span>
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M19 12H5m6-6-6 6 6 6" />
                          </svg>
                          {lang === "zh" ? "左滑跳过" : "Swipe left to pass"}
                        </span>
                        <span>
                          {lang === "zh" ? "右滑喜欢" : "Swipe right to like"}{" "}
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M5 12h14m-6-6 6 6-6 6" />
                          </svg>
                        </span>
                      </div>
                    </div>
                    <p className="sample-footer">{heroNote}</p>
                  </>
                ) : (
                  <div className="empty">
                    <div className="empty-icon">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                      </svg>
                    </div>
                    <h2>{lang === "zh" ? "这一轮，看完啦。" : "That’s everyone for now."}</h2>
                    <p>
                      {lang === "zh"
                        ? `你喜欢了 ${likes.length} 位示例人物。去看看谁最让你心动。`
                        : `You liked ${likes.length} ${likes.length === 1 ? "person" : "people"}.`}
                    </p>
                    <button className="primary" onClick={restart}>
                      {lang === "zh" ? "重新体验" : "Start over"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="discover">
                <div className="discover-top">
                  <div className="discover-tabs">
                    <button
                      className={`tab ${discoverActive ? "active" : ""}`}
                      onClick={() => setTab("discover")}
                    >
                      {lang === "zh" ? "发现" : "Discover"}{" "}
                      <span className="count">{Math.max(0, deck.length - index)}</span>
                    </button>
                    <button
                      className={`tab ${likesActive ? "active" : ""}`}
                      onClick={() => setTab("likes")}
                    >
                      {lang === "zh" ? "喜欢" : "Likes"}{" "}
                      <span className="count">{likes.length}</span>
                    </button>
                  </div>
                  <button
                    className="icon-btn"
                    aria-label="Adjust preferences"
                    onClick={() => setEditOpen(true)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 7h9m4 0h3M4 17h3m4 0h9" />
                      <circle cx="15" cy="7" r="2" />
                      <circle cx="9" cy="17" r="2" />
                    </svg>
                  </button>
                </div>

                {likes.length === 0 ? (
                  <div className="empty">
                    <div className="empty-icon">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                      </svg>
                    </div>
                    <h2>{lang === "zh" ? "还没有心动的人" : "No sparks yet"}</h2>
                    <p>
                      {lang === "zh"
                        ? "遇见喜欢的类型，右滑一下。你的喜欢会出现在这里。"
                        : "Meet someone your kind and swipe right. Your likes show up here."}
                    </p>
                    <button className="primary" onClick={() => setTab("discover")}>
                      {lang === "zh" ? "继续发现" : "Keep discovering"}
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="likes-heading">
                      {lang === "zh" ? "你喜欢的人" : "People you liked"}
                    </p>
                    <div className="likes-grid">
                      {likes.map((p) => (
                        <button
                          key={p.id}
                          className="liked-card"
                          onClick={() => setInfo(p)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.portrait.thumb} alt="" />
                          <span className="liked-heart">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                            </svg>
                          </span>
                          <span>
                            {p.name}
                            <small>
                              {p.age} · {p.city}
                            </small>
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">
            {toast && (
              <>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                </svg>{" "}
                {toast.msg}
              </>
            )}
          </div>
        </section>
      </main>

      {(editOpen || !result) && (
        <QuizDialog
          lang={lang}
          initial={result ?? undefined}
          onDismiss={() => setEditOpen(false)}
          onLangChange={setLang}
          onComplete={(next) => {
            setEditOpen(false);
            onQuizComplete(next);
          }}
        />
      )}

      {info && (
        <div
          className="kol-modal"
          onClick={() => setInfo(null)}
          role="presentation"
        >
          <div
            className="kol-modal-card profile-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="kol-dialog-title"
          >
            <div className="profile-dialog-head">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="profile-detail-photo"
                src={info.portrait.src}
                alt=""
              />
              <button
                className="dialog-close"
                aria-label="Close"
                onClick={() => setInfo(null)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 6 12 12M6 18 18 6" />
                </svg>
              </button>
            </div>
            <div className="dialog-content">
              <h2 id="kol-dialog-title">
                {info.name} <span>{info.age}</span>
              </h2>
              <p className="dialog-meta">
                {info.city} · {pickText(info.job, lang)}
              </p>
              <p className="bio">{pickText(info.bio, lang)}</p>
              <div className="detail-tags">
                <span>{info.languages}</span>
                {(info.traits ?? []).slice(0, 3).map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <button
                className="primary"
                onClick={() => {
                  likeProfile(info);
                  setInfo(null);
                  setTab("discover");
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                </svg>
                {lang === "zh" ? "喜欢这个人" : "Like this profile"}
              </button>
              <div className="profile-contact-actions">
                <button
                  className="primary"
                  onClick={() => openJourney(account ? "membership" : "verify", info)}
                >
                  ♡ {lang === "zh" ? "立即联系" : "Contact now"}
                </button>
                <button
                  className="profile-remove-small"
                  onClick={() => {
                    if (!info) return;
                    setLikeIds(likedIds.filter((id) => id !== info.id));
                    setInfo(null);
                  }}
                >
                  {lang === "zh" ? "从喜欢中移除" : "Remove from likes"}
                </button>
              </div>
              <p className="dialog-sample">{heroNote}</p>
            </div>
          </div>
        </div>
      )}

      {journey && (
        <Journey
          lang={lang}
          profile={journey.profile}
          stage={journey.stage}
          onStage={(stage) => setJourney({ stage, profile: journey.profile })}
          onClose={() => setJourney(null)}
        />
      )}
    </div>
  );
}
