"use client";

import { useSyncExternalStore } from "react";

/* Shared country preference: the discovery screen and the join flow both read
   it, so a change in one place applies everywhere. */
const STORAGE_KEY = "kol-country-v1";
let country: string | null = null;
const listeners = new Set<() => void>();

function readStored(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) || "IN";
  } catch {
    return "IN";
  }
}

export function getCountry(): string {
  if (country === null) country = typeof window === "undefined" ? "IN" : readStored();
  return country;
}

export function setCountry(value: string): void {
  country = value;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* storage may be unavailable */
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useCountry(): [string, (value: string) => void] {
  const value = useSyncExternalStore(subscribe, getCountry, () => "IN");
  return [value, setCountry];
}
