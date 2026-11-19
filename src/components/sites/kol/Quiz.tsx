"use client";

import { useState } from "react";
import {
  AGE_BANDS,
  HOBBY_OPTIONS,
  IDEAL_CHOICES,
  IDEAL_TRAITS,
  QUIZ_BY_LANG,
  TRAIT_LABEL,
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
    <div className="quiz-shell">
      {step > 0 && (
        <button className="back-text" onClick={back}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 12H5m6-6-6 6 6 6" />
          </svg>
          {copy.back}
        </button>
      )}

      <div className="question-progress" aria-hidden="true">
        <div className="bars">
          {Array.from({ length: TOTAL }, (_, i) => (
            <i key={i} className={i <= step ? "active" : ""} />
          ))}
        </div>
        <span>{copy.step(step)}</span>
      </div>

      <h2 className="question-title">{copy.titles[step]}</h2>
      <p className="question-subtitle">{copy.subtitles[step]}</p>

      {step === 0 && (
        <div className="quiz-genders">
          <button
            type="button"
            className={`quiz-gender-card ${gender === "woman" ? "selected" : ""}`}
            onClick={() => pickGender("woman")}
          >
            <span className="gender-symbol woman">♀</span>
            <strong>{copy.genderWoman}</strong>
          </button>
          <button
            type="button"
            className={`quiz-gender-card ${gender === "man" ? "selected" : ""}`}
            onClick={() => pickGender("man")}
          >
            <span className="gender-symbol">♂</span>
            <strong>{copy.genderMan}</strong>
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="quiz-grid age-options">
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
        <div className="quiz-grid hobby-options">
          {HOBBY_OPTIONS.map((h) => (
            <button
              key={h.id}
              type="button"
              className={`quiz-answer hobby-choice ${hobby === h.id ? "selected" : ""}`}
              onClick={() => pickHobby(h.id)}
            >
              <span aria-hidden="true">{h.symbol}</span>
              <strong>{h[lang === "zh" ? "zh" : "en"] ?? h.en}</strong>
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="quiz-grid ideal-options">
          {ideals.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`quiz-answer ideal-choice ${ideal === o.id ? "selected" : ""}`}
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

      <p className="quiz-adult">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="10" width="14" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        {copy.adult}
      </p>
      <p className="quiz-hint">
        {gender === "man"
          ? copy.women
          : gender === "woman"
            ? copy.men
            : copy.hint}
      </p>
      {traitsPreview(ideal) && (
        <p className="quiz-selected">
          <span aria-hidden="true">♡</span>
          {TRAIT_LABEL[traitsPreview(ideal)!]?.[lang === "zh" ? "zh" : "en"]}
        </p>
      )}
    </div>
  );
}

function traitsPreview(id: string | null) {
  if (!id) return null;
  const t = IDEAL_TRAITS[id];
  return t ? (t as keyof typeof TRAIT_LABEL) : null;
}
