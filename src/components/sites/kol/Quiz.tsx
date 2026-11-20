"use client";

import { useState } from "react";
import {
  AGE_BANDS,
  HOBBY_OPTIONS,
  IDEAL_CHOICES,
  IDEAL_TRAITS,
  QUIZ_BY_LANG,
  type Gender,
  type HobbyId,
  type Lang,
} from "./data";

export type QuizResult = {
  gender: Gender;
  ageRange: { min: number; max: number | null };
  hobby: HobbyId;
  idealType: string;
  traits: string[];
};

type Props = {
  lang: Lang;
  onComplete: (r: QuizResult) => void;
  initial?: Partial<QuizResult>;
};

const TOTAL = 4;

/* Mirrors the source illustration map: ideal option id → asset filename. */
const ILLUSTRATION: Record<string, string> = {
  sweet: "sweet",
  glam: "curvy",
  gentle: "elegant",
  lively: "lively",
  confident: "flirty",
  creative: "glam",
  caring: "caring",
  sunny: "sunny",
  matureMan: "matureMan",
  funny: "cool",
  active: "muscular",
};

/**
 * Source `questionnaire()` markup: one section per step, every choice commits on a
 * single tap (source `chooseAnswer()` advances the step without a Continue button).
 */
export default function Quiz({ lang, onComplete, initial }: Props) {
  const copy = QUIZ_BY_LANG[lang];
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<Gender | null>(initial?.gender ?? null);
  const [band, setBand] = useState<{ min: number; max: number | null } | null>(
    initial?.ageRange ?? null,
  );
  const [hobby, setHobby] = useState<HobbyId | null>(initial?.hobby ?? null);
  const [ideal, setIdeal] = useState<string | null>(initial?.idealType ?? null);

  const ideals = IDEAL_CHOICES[gender === "man" ? "woman" : "man"];

  function pickGender(g: Gender) {
    setGender(g);
    setStep(1);
  }
  function pickBand(b: (typeof AGE_BANDS)[number]) {
    setBand({ min: b.min, max: b.max });
    setStep(2);
  }
  function pickHobby(h: HobbyId) {
    setHobby(h);
    setStep(3);
  }
  function pickIdeal(id: string) {
    setIdeal(id);
    if (!gender || !band || !hobby) return;
    onComplete({
      gender,
      ageRange: band,
      hobby,
      idealType: id,
      traits: [IDEAL_TRAITS[id] ?? "gentle"],
    });
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  return (
    <section
      className="single-question quick-question full-questionnaire"
      data-question-step={step}
    >
      <div className="question-progress" aria-label={copy.step(step)}>
        <div className="bars">
          {Array.from({ length: TOTAL }, (_, i) => (
            <i key={i} className={i <= step ? "active" : ""} />
          ))}
        </div>
        <span>{copy.step(step)}</span>
      </div>

      {step > 0 && (
        <button type="button" className="back-text" onClick={back}>
          ← {copy.back}
        </button>
      )}

      <h1 className="question-title" tabIndex={-1}>
        {copy.titles[step]}
      </h1>
      <p className="question-subtitle">{copy.subtitles[step]}</p>

      {step === 0 && (
        <div className="quiz-options quiz-genders">
          {(
            [
              ["woman", "♀", copy.genderWoman, copy.men],
              ["man", "♂", copy.genderMan, copy.women],
            ] as const
          ).map(([value, symbol, label, hint]) => (
            <button
              key={value}
              type="button"
              className={`quiz-answer gender-choice ${value} ${gender === value ? "selected" : ""}`}
              onClick={() => pickGender(value)}
            >
              <span className={`gender-symbol ${value}`} aria-hidden="true">
                {symbol}
              </span>
              <strong>{label}</strong>
              <small>{hint}</small>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="quiz-options age-options">
          {AGE_BANDS.map((b) => (
            <button
              key={b.min}
              type="button"
              className={`quiz-answer ${band?.min === b.min ? "selected" : ""}`}
              onClick={() => pickBand(b)}
            >
              {b.max === null ? copy.agePlus : `${b.min}–${b.max}`}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="quiz-options hobby-options" role="radiogroup" aria-label={copy.titles[2]}>
          {HOBBY_OPTIONS.map((h) => (
            <button
              key={h.id}
              type="button"
              className={`quiz-answer hobby-choice ${hobby === h.id ? "selected" : ""}`}
              role="radio"
              aria-checked={hobby === h.id}
              onClick={() => pickHobby(h.id)}
            >
              <span aria-hidden="true">{h.symbol}</span>
              <strong>{h[lang === "zh" ? "zh" : "en"] ?? h.en}</strong>
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="quiz-options ideal-options">
          {ideals.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`quiz-answer ideal-choice ${ideal === o.id ? "selected" : ""}`}
              aria-pressed={ideal === o.id}
              onClick={() => pickIdeal(o.id)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/assets/types/${ILLUSTRATION[o.id] ?? o.id}.webp`}
                alt=""
                width={110}
                height={94}
              />
              <strong>{o[lang === "zh" ? "zh" : "en"] ?? o.en}</strong>
            </button>
          ))}
        </div>
      )}

      <p className="question-hint">{step === 2 ? copy.hint : copy.adult}</p>
      <p className="question-status" role="status" />
    </section>
  );
}
