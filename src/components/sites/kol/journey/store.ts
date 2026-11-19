"use client";

import { useSyncExternalStore } from "react";
import {
  loadAccount,
  loadInvites,
  loadLikes,
  loadReward,
  saveAccount,
  saveInvites,
  saveLikes,
  saveReward,
  type Account,
  type RewardRecord,
} from "./storage";

/* A tiny external store so session data can be read during render without
   effects. Everything is backed by localStorage. */

export type Session = {
  account: Account | null;
  invites: number;
  reward: RewardRecord | null;
};

const EMPTY: Session = { account: null, invites: 0, reward: null };
const EMPTY_LIKES: string[] = [];
let session: Session | null = null;
let likes: string[] | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSession(): Session {
  if (session) return session;
  if (typeof window === "undefined") return EMPTY;
  const account = loadAccount();
  session = {
    account,
    invites: account ? loadInvites(account.id) : 0,
    reward: account ? loadReward(account.id) : null,
  };
  return session;
}

export function useSession(): Session {
  return useSyncExternalStore(subscribe, getSession, () => EMPTY);
}

export function setSessionAccount(account: Account | null): void {
  saveAccount(account);
  session = {
    account,
    invites: account ? loadInvites(account.id) : 0,
    reward: account ? loadReward(account.id) : null,
  };
  emit();
}

export function updateSessionAccount(patch: Partial<Account>): Account | null {
  const current = getSession().account;
  if (!current) return null;
  const next = { ...current, ...patch };
  saveAccount(next);
  session = { ...getSession(), account: next };
  emit();
  return next;
}

export function setSessionInvites(count: number): void {
  const current = getSession();
  if (!current.account) return;
  const next = Math.max(0, Math.floor(count));
  saveInvites(current.account.id, next);
  session = { ...current, invites: next };
  emit();
}

export function setSessionReward(reward: RewardRecord | null): void {
  const current = getSession();
  if (!current.account) return;
  if (reward) saveReward(current.account.id, reward);
  session = { ...current, reward };
  emit();
}

export function getLikeIds(): string[] {
  if (likes) return likes;
  if (typeof window === "undefined") return EMPTY_LIKES;
  likes = loadLikes();
  return likes;
}

export function useLikeIds(): string[] {
  return useSyncExternalStore(subscribe, getLikeIds, () => EMPTY_LIKES);
}

export function setLikeIds(ids: string[]): void {
  likes = ids;
  saveLikes(ids);
  emit();
}
