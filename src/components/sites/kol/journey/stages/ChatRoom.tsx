"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang, Profile } from "../../data";
import { copyFor } from "../copy";
import { asset } from "../util";
import { ProfileStrip } from "./Membership";

export type ChatMessage = {
  id: string;
  author: string;
  bot?: boolean;
  thumb?: string;
  mine?: boolean;
  content: string;
};

type Props = {
  lang: Lang;
  profile: Profile | null;
  messages: ChatMessage[];
  muted: boolean;
  closed: boolean;
  error: string;
  rewardLabel: string;
  onBack: () => void;
  onReward: () => void;
  onSend: (text: string) => void;
};

export default function ChatRoom({
  lang,
  profile,
  messages,
  muted,
  closed,
  error,
  rewardLabel,
  onBack,
  onReward,
  onSend,
}: Props) {
  const m = copyFor(lang);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const lastKey = useRef("");

  useEffect(() => {
    const container = listRef.current;
    if (!container) return;
    const key = messages.map((message) => message.id).join(",");
    if (key === lastKey.current) return;
    const atEnd =
      container.scrollHeight - container.scrollTop - container.clientHeight < 70;
    lastKey.current = key;
    if (atEnd) container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <section className="chat-view">
      <button className="journey-secondary" data-journey="discover" onClick={onBack}>
        {m.browse}
      </button>
      <h1 id="journey-title">{m.roomTitle}</h1>
      <p className="journey-intro">{m.roomSub}</p>
      <ProfileStrip lang={lang} profile={profile} />
      {profile && (
        <div className="reward-room-link">
          <span>{rewardLabel}</span>
          <button data-journey="reward" onClick={onReward}>{m.rewardAction}</button>
        </div>
      )}
      <p className="chat-disclosure">
        <span className="chat-legend-dot" aria-hidden="true" />
        {m.roomNotice}
      </p>
      <div
        className="chat-messages"
        id="chat-messages"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        ref={listRef}
      >
        {messages.length === 0 ? (
          <p className="journey-note">{m.emptyRoom}</p>
        ) : (
          messages.map((message) => {
            const picture = message.thumb ? asset(message.thumb) : "";
            return (
              <article key={message.id} className={`chat-message ${message.mine ? "mine" : ""}`}>
                {message.bot && picture ? (
                  <div className="chat-avatar">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={picture} alt="" width={34} height={42} />
                    <i className="automated-dot" role="img" aria-label={m.auto} title={m.auto} />
                  </div>
                ) : (
                  <div className="human-avatar" aria-hidden="true">
                    {(message.mine ? m.me : message.author).slice(0, 1)}
                  </div>
                )}
                <div>
                  <header>{message.author}</header>
                  <p>{message.content}</p>
                </div>
              </article>
            );
          })
        )}
      </div>
      <p id="journey-error" className="form-error" role="alert">
        {muted ? m.muted : closed ? m.closed : error}
      </p>
      <form
        id="chat-form"
        className="chat-composer"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = text.trim();
          if (!trimmed || muted || closed) return;
          onSend(trimmed);
          setText("");
        }}
      >
        <input
          name="message"
          maxLength={400}
          required
          autoComplete="off"
          aria-label={m.input}
          placeholder={m.input}
          value={text}
          disabled={muted || closed}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" disabled={muted || closed}>{m.send}</button>
      </form>
    </section>
  );
}
