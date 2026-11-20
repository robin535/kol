"use client";

import { useEffect, useRef } from "react";
import Quiz, { type QuizResult } from "./Quiz";
import { LANGS, type Lang } from "./data";

type Props = {
  lang: Lang;
  initial?: Partial<QuizResult>;
  onComplete: (result: QuizResult) => void;
  onDismiss: () => void;
  onLangChange?: (lang: Lang) => void;
};

/**
 * The source site opens its questionnaire in a native <dialog> (modal),
 * floating over the editorial landing page instead of replacing it inline.
 */
export default function QuizDialog({
  lang,
  initial,
  onComplete,
  onDismiss,
  onLangChange,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    document.body.classList.add("in-questionnaire");
    return () => document.body.classList.remove("in-questionnaire");
  }, []);

  return (
    <dialog
      ref={dialogRef}
      id="questionnaire-dialog"
      aria-label="Get to know you"
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
    >
      <div className="quiz-shell">
        <header className="quiz-header">
          <span className="wordmark">
            kol<span>♡</span>
          </span>
          <div className="quiz-tools">
            <select
              id="quiz-language"
              aria-label="Language"
              value={lang}
              onChange={(event) => onLangChange?.(event.target.value as Lang)}
            >
              {LANGS.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </header>
        <Quiz
          lang={lang}
          initial={initial}
          onComplete={(result) => {
            if (dialogRef.current?.open) dialogRef.current.close();
            onComplete(result);
          }}
        />
      </div>
    </dialog>
  );
}
