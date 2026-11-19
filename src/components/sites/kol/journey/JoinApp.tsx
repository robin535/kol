"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { normalizeProfiles, type Lang, type Profile } from "../data";
import { setCountry } from "./country";
import Journey, { type JourneyStage } from "./Journey";
import { getSession } from "./store";

const VALID_LANGS: Lang[] = ["zh", "en", "hi"];

const noopSubscribe = () => () => {};

type Params = {
  lang: Lang;
  profileId: string | null;
  next: string | null;
  country: string | null;
};

const SERVER_PARAMS: Params = { lang: "en", profileId: null, next: null, country: null };

function readParams(): Params {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("lang") ?? "";
  return {
    lang: (VALID_LANGS as string[]).includes(raw) ? (raw as Lang) : "en",
    profileId: params.get("profile"),
    next: params.get("next"),
    country: params.get("country"),
  };
}

export default function JoinApp() {
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const params = isClient ? readParams() : SERVER_PARAMS;
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stage, setStage] = useState<JourneyStage>("verify");
  const lang = params.lang;

  useEffect(() => {
    const current = readParams();
    if (current.country) setCountry(current.country);
    if (current.next === "phone" && getSession().account) {
      const timer = window.setTimeout(() => setStage("phone"), 0);
      fetch("/data/profiles.json")
        .then((response) => response.json())
        .then((raw: Profile[]) => setProfiles(normalizeProfiles(raw)))
        .catch(() => {});
      return () => window.clearTimeout(timer);
    }
    fetch("/data/profiles.json")
      .then((response) => response.json())
      .then((raw: Profile[]) => setProfiles(normalizeProfiles(raw)))
      .catch(() => {});
  }, []);

  const profile =
    (params.profileId && profiles.find((item) => item.id === params.profileId)) ||
    (() => {
      const ideal = getSession().account?.settings?.idealType;
      return ideal ? (profiles.find((item) => item.id === ideal) ?? null) : null;
    })();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <Journey
      page
      lang={lang}
      profile={profile}
      stage={stage}
      onStage={setStage}
      onClose={null}
    />
  );
}
