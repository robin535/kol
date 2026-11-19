"use client";

import type { Lang } from "../data";
import { copyFor, fill } from "./copy";
import { ROMANTIC_PHOTO, siteOrigin } from "./util";

type Props = {
  lang: Lang;
  amount: string;
  link: string;
  onClose: () => void;
  onCopy: () => void;
  status: string;
};

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c] ?? c,
  );
}

function wrap(text: string, width: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > width) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = `${line} ${word}`.trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

export default function Poster({ lang, amount, link, onClose, onCopy, status }: Props) {
  const m = copyFor(lang);
  const lines = wrap(link, 52).slice(0, 3);

  function save() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1080" viewBox="0 0 720 1080">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#4d1d3a"/><stop offset=".55" stop-color="#311a2f"/><stop offset="1" stop-color="#1b1221"/>
        </linearGradient>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#1b1221" stop-opacity="0"/><stop offset="1" stop-color="#120b19"/>
        </linearGradient>
      </defs>
      <rect width="720" height="1080" fill="url(#bg)"/>
      <image href="${escapeXml(`${siteOrigin()}${ROMANTIC_PHOTO}`)}" x="0" y="0" width="720" height="720" preserveAspectRatio="xMidYMin slice" opacity=".78"/>
      <rect y="360" width="720" height="720" fill="url(#fade)"/>
      <text x="60" y="120" font-family="Georgia, serif" font-style="italic" font-size="74" fill="#ff9db3">kol</text>
      <text x="60" y="820" font-family="Arial, sans-serif" font-size="22" letter-spacing="4" fill="#ffd6a6">${escapeXml(m.eyebrow)}</text>
      <text x="60" y="920" font-family="Arial, sans-serif" font-weight="800" font-size="118" letter-spacing="-5" fill="#ffe0a6">${escapeXml(amount)}</text>
      <text x="60" y="972" font-family="Arial, sans-serif" font-weight="700" font-size="30" fill="#fff1dc">${escapeXml(m.plus)}</text>
      <text x="60" y="1020" font-family="Arial, sans-serif" font-size="24" fill="#e9c4d1">${escapeXml(fill(m.terms, amount).slice(0, 70))}</text>
      ${lines
        .map(
          (line, index) =>
            `<text x="60" y="${180 + index * 34}" font-family="Arial, sans-serif" font-size="22" fill="#ffe2ec" opacity=".9">${escapeXml(line)}</text>`,
        )
        .join("")}
      <text x="660" y="1046" text-anchor="end" font-family="Arial, sans-serif" font-size="18" fill="#c9a6bb">${escapeXml(m.scan)}</text>
    </svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "kol-invitation.svg";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  return (
    <div className="kol-modal" role="presentation" onClick={onClose}>
      <div
        className="kol-modal-card poster-dialog"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <h2>{m.posterTitle}</h2>
          <button className="text-button" onClick={onClose}>{m.close}</button>
        </header>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 16,
            background: "linear-gradient(150deg,#4d1d3a,#1b1221)",
            color: "#fff1dc",
            padding: "26px 22px 20px",
            textAlign: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ROMANTIC_PHOTO}
            alt=""
            style={{ width: "100%", height: 210, objectFit: "cover", objectPosition: "50% 0%", borderRadius: 12 }}
          />
          <p style={{ font: "italic 44px Georgia, serif", letterSpacing: "-3px", color: "#ff9db3", margin: "12px 0 0" }}>
            kol<span>♡</span>
          </p>
          <p style={{ fontSize: 11, letterSpacing: 3, color: "#ffd6a6", margin: "12px 0 6px" }}>{m.eyebrow}</p>
          <p style={{ fontSize: 62, fontWeight: 800, letterSpacing: "-3px", color: "#ffe0a6", margin: 0, lineHeight: 1.05 }}>
            {amount}
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, margin: "8px 0 0" }}>{m.plus}</p>
          <p style={{ fontSize: 12, color: "#e9c4d1", margin: "10px 0 0", lineHeight: 1.55 }}>
            {fill(m.terms, amount)}
          </p>
          <p style={{ fontSize: 10, color: "#c9a6bb", margin: "12px 0 0", wordBreak: "break-all" }}>{link}</p>
        </div>
        <p>{m.posterHint}</p>
        <div className="poster-actions">
          <button type="button" onClick={save}>{m.posterSave}</button>
          <a
            className="poster-whatsapp"
            href={`https://wa.me/?text=${encodeURIComponent(`${m.shareText}\n${link}`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/whatsapp.svg" alt="" width={21} height={21} />
            {m.whatsapp}
          </a>
          <p className="poster-error" role="status">{status}</p>
        </div>
        <button type="button" className="journey-secondary" onClick={onCopy}>{m.inviteCopy}</button>
      </div>
    </div>
  );
}
