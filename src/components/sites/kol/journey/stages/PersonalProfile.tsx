"use client";

import { useRef, useState } from "react";
import type { Lang } from "../../data";
import { copyFor } from "../copy";
import type { PersonalProfile as PersonalProfileRecord } from "../storage";

type Props = {
  lang: Lang;
  initial: PersonalProfileRecord | null;
  defaults: { gender?: "man" | "woman"; hobby?: string };
  busy: boolean;
  error: string;
  onSubmit: (value: PersonalProfileRecord) => void;
};

const OCCUPATIONS = [
  "tech_engineering",
  "education",
  "healthcare",
  "business_admin",
  "sales_service",
  "hospitality_travel",
  "arts_media",
  "production_trade",
  "student",
  "other",
];
const PERSONALITIES = ["gentle", "confident", "funny", "creative", "active", "mature"];
const HOBBIES = [
  "travel",
  "music",
  "movies",
  "food",
  "sports",
  "reading",
  "gaming",
  "photography",
  "pets",
];

function validName(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length >= 1 && trimmed.length <= 80;
}

async function preparePhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    throw new Error("photo_read");
  }
  if (file.size > 30 * 1024 * 1024) throw new Error("photo_large");

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("photo_read"));
    };
    img.src = url;
  });

  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (!width || !height) throw new Error("photo_read");

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("photo_read");

  const ratio = Math.min(1, 1024 / Math.max(width, height));
  let targetWidth = Math.max(1, Math.round(width * ratio));
  let targetHeight = Math.max(1, Math.round(height * ratio));
  let blob: Blob | null = null;

  for (let round = 0; round < 4; round++) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, targetWidth, targetHeight);
    context.drawImage(image, 0, 0, targetWidth, targetHeight);
    for (const quality of [0.88, 0.76, 0.62, 0.48]) {
      blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality),
      );
      if (blob && blob.type === "image/jpeg" && blob.size > 0 && blob.size <= 500_000) {
        break;
      }
    }
    if (blob && blob.type === "image/jpeg" && blob.size > 0 && blob.size <= 500_000) {
      break;
    }
    targetWidth = Math.max(1, Math.floor(targetWidth * 0.8));
    targetHeight = Math.max(1, Math.floor(targetHeight * 0.8));
  }
  if (!blob || blob.type !== "image/jpeg" || blob.size <= 0 || blob.size > 500_000) {
    throw new Error("photo_read");
  }

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("photo_read"));
    reader.readAsDataURL(blob as Blob);
  });
}

export default function PersonalProfile({
  lang,
  initial,
  defaults,
  busy,
  error,
  onSubmit,
}: Props) {
  const m = copyFor(lang);
  const [photo, setPhoto] = useState<string | null>(initial?.photo ?? null);
  const [processing, setProcessing] = useState(false);
  const [localError, setLocalError] = useState("");
  const [displayName, setDisplayName] = useState(initial?.displayName ?? "");
  const [gender, setGender] = useState<"man" | "woman" | "">(initial?.gender ?? defaults.gender ?? "");
  const [age, setAge] = useState<number | "">(initial?.age ?? "");
  const [occupation, setOccupation] = useState(initial?.occupation ?? "");
  const [personality, setPersonality] = useState(initial?.personality ?? "");
  const [hobby, setHobby] = useState(initial?.hobby ?? defaults.hobby ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  function message(code: string): string {
    if (code === "name") return m.nameError;
    if (code === "photo") return m.photoError;
    if (code === "photo_large") return m.photoLarge;
    if (code === "photo_read") return m.photoReadError;
    if (code === "required") return m.required;
    return m.saveError;
  }

  const complete =
    validName(displayName) &&
    Boolean(photo) &&
    (gender === "man" || gender === "woman") &&
    typeof age === "number" &&
    age >= 18 &&
    age <= 100 &&
    Boolean(occupation) &&
    Boolean(personality) &&
    Boolean(hobby);

  async function onFile(file: File | undefined) {
    if (!file || busy) return;
    setProcessing(true);
    setLocalError("");
    try {
      const data = await preparePhoto(file);
      setPhoto(data);
    } catch (cause) {
      setLocalError(message((cause as Error).message));
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setProcessing(false);
    }
  }

  return (
    <section className="personal-profile">
      <p className="personal-eyebrow">{m.personalEyebrow}</p>
      <h1 id="journey-title">{m.personalTitle}</h1>
      <p className="personal-intro">{m.personalIntro}</p>
      <form
        id="personal-profile-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (busy || processing) return;
          if (!complete || typeof age !== "number" || (gender !== "man" && gender !== "woman")) {
            setLocalError(m.required);
            return;
          }
          onSubmit({
            displayName: displayName.trim(),
            gender,
            age,
            occupation,
            personality,
            hobby,
            photo: photo ?? undefined,
          });
        }}
      >
        <div className="personal-photo-section">
          <label className="personal-photo-pick" htmlFor="personal-photo">
            <span className="personal-photo-placeholder" hidden={Boolean(photo)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7h4l2-3h4l2 3h4v13H4z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="personal-photo-preview"
              alt={m.photoPreview}
              src={photo ?? undefined}
              hidden={!photo}
            />
            <input
              type="file"
              id="personal-photo"
              name="photo"
              accept="image/jpeg,image/png,image/webp,image/*"
              ref={inputRef}
              onChange={(e) => void onFile(e.target.files?.[0])}
              required
            />
            <span className="personal-photo-action">
              {processing ? m.processing : photo ? m.replacePhoto : m.choosePhoto}
            </span>
          </label>
          <p className="personal-photo-hint">
            {m.photoHint} <b aria-hidden="true">*</b>
          </p>
        </div>

        <label className="personal-field">
          <span>{m.personalName} <b aria-hidden="true">*</b></span>
          <input
            type="text"
            name="name"
            value={displayName}
            autoComplete="name"
            maxLength={160}
            placeholder={m.namePlaceholder}
            required
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>

        <fieldset className="personal-choice-group">
          <legend>{m.gender} <b aria-hidden="true">*</b></legend>
          <div className="personal-gender-options">
            {([["man", m.man], ["woman", m.woman]] as const).map(([value, label]) => (
              <label className="personal-radio" key={value}>
                <input
                  type="radio"
                  name="gender"
                  value={value}
                  checked={gender === value}
                  onChange={() => setGender(value)}
                  required
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="personal-field">
          <span>{m.age} <b aria-hidden="true">*</b></span>
          <select
            name="age"
            required
            value={age === "" ? "" : String(age)}
            onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">{m.choose}</option>
            {Array.from({ length: 83 }, (_, i) => i + 18).map((value) => (
              <option key={value} value={value}>{`${value} ${m.ageUnit}`}</option>
            ))}
          </select>
        </label>

        <label className="personal-field">
          <span>{m.occupation} <b aria-hidden="true">*</b></span>
          <select name="occupation" required value={occupation} onChange={(e) => setOccupation(e.target.value)}>
            <option value="">{m.choose}</option>
            {OCCUPATIONS.map((id, index) => (
              <option key={id} value={id}>{m.occupationLabels[index]}</option>
            ))}
          </select>
        </label>

        <fieldset className="personal-choice-group">
          <legend>{m.personality} <b aria-hidden="true">*</b></legend>
          <div className="personal-personality-options">
            {PERSONALITIES.map((value, index) => (
              <label className="personal-radio" key={value}>
                <input
                  type="radio"
                  name="personality"
                  value={value}
                  checked={personality === value}
                  onChange={() => setPersonality(value)}
                  required
                />
                <span>{m.personalityLabels[index]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="personal-field">
          <span>{m.hobby} <b aria-hidden="true">*</b></span>
          <select name="hobby" required value={hobby} onChange={(e) => setHobby(e.target.value)}>
            <option value="">{m.choose}</option>
            {HOBBIES.map((id, index) => (
              <option key={id} value={id}>{m.hobbyLabels[index]}</option>
            ))}
          </select>
        </label>

        <p className="personal-privacy">{m.privacy}</p>
        <div className="personal-profile-footer">
          <p className="personal-profile-error form-error" role="alert">
            {error || localError}
          </p>
          <button
            type="submit"
            className="primary personal-profile-submit"
            disabled={busy || processing || !complete}
          >
            {busy ? m.saving : processing ? m.processing : m.personalSubmit}
          </button>
        </div>
      </form>
    </section>
  );
}
