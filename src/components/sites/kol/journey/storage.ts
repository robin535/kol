/* Shared local persistence for the KOL journey demo. All state lives in the
   visitor's browser; no account, reward or bank data leaves this device. */

export const ACCOUNT_KEY = "kol-account-v1";
export const COUNTRY_KEY = "kol-country-v1";
export const SWIPE_GUIDE_KEY = "kol-swipe-guide-v1";
export const SHARE_REMINDER_KEY = "kol-registration-share-v1";

export type Account = {
  id: string;
  username: string;
  createdAt: number;
  role: "user";
  guest: boolean;
  phoneRegistered: boolean;
  member: boolean;
  personalProfileComplete: boolean;
  settings?: {
    gender?: "man" | "woman";
    ageRange?: { min: number; max: number | null };
    hobby?: string;
    hobbies?: string[];
    idealType?: string;
  };
};

export type PersonalProfile = {
  displayName: string;
  gender: "man" | "woman";
  age: number;
  occupation: string;
  personality: string;
  hobby: string;
  photo?: string;
};

export type RewardRecord = {
  status: "pending" | "paid" | "needs_update";
  amount: number;
  currency: string;
  last4: string;
  reference?: string;
  note?: string;
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable in private windows */
  }
}

export function loadAccount(): Account | null {
  const value = read<Account | null>(ACCOUNT_KEY, null);
  return value && typeof value === "object" && value.id ? value : null;
}

export function saveAccount(account: Account | null): void {
  if (account) write(ACCOUNT_KEY, account);
  else if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(ACCOUNT_KEY);
    } catch {
      /* ignore */
    }
  }
}

export function updateAccount(patch: Partial<Account>): Account | null {
  const current = loadAccount();
  if (!current) return null;
  const next = { ...current, ...patch };
  saveAccount(next);
  return next;
}

export function makeAccountId(): string {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `a${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

const PROFILE_KEY = (id: string) => `kol-personal-profile-v1:${id}`;
const INVITES_KEY = (id: string) => `kol-invites-v1:${id}`;
const REWARD_KEY = (id: string) => `kol-reward-v1:${id}`;
const LIKES_KEY = "kol-likes-v1";
const HISTORY_KEY = "kol-swipes-v1";

export function loadPersonalProfile(id: string): PersonalProfile | null {
  return read<PersonalProfile | null>(PROFILE_KEY(id), null);
}
export function savePersonalProfile(id: string, profile: PersonalProfile): void {
  write(PROFILE_KEY(id), profile);
}
export function loadInvites(id: string): number {
  const n = read<number>(INVITES_KEY(id), 0);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}
export function saveInvites(id: string, count: number): void {
  write(INVITES_KEY(id), Math.max(0, Math.floor(count)));
}
export function loadReward(id: string): RewardRecord | null {
  return read<RewardRecord | null>(REWARD_KEY(id), null);
}
export function saveReward(id: string, reward: RewardRecord | null): void {
  if (reward) write(REWARD_KEY(id), reward);
}

export function loadLikes(): string[] {
  const value = read<string[]>(LIKES_KEY, []);
  return Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];
}
export function saveLikes(ids: string[]): void {
  write(LIKES_KEY, ids);
}
export function loadHistory(): { profileId: string; action: "like" | "pass" }[] {
  const value = read<{ profileId: string; action: "like" | "pass" }[]>(HISTORY_KEY, []);
  return Array.isArray(value) ? value : [];
}
export function saveHistory(items: { profileId: string; action: "like" | "pass" }[]): void {
  write(HISTORY_KEY, items);
}

export function loadCountry(): string {
  return read<string>(COUNTRY_KEY, "IN");
}
export function saveCountry(code: string): void {
  write(COUNTRY_KEY, code);
}

export function registrationShareKey(account: Account): string {
  return `${SHARE_REMINDER_KEY}:${account.id}:${account.createdAt}`;
}
export function shareReminderDismissed(account: Account): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(registrationShareKey(account)) === "dismissed";
  } catch {
    return true;
  }
}
export function dismissShareReminder(account: Account): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(registrationShareKey(account), "dismissed");
  } catch {
    /* ignore */
  }
}
