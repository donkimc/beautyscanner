// Consent purposes and their current versions. Bump a version when the wording or scope changes so users are asked again.
export const CONSENT_VERSIONS = {
  terms: "2026-10-03",
  sensitive: "2026-10-03",
  ai: "2026-10-03",
  marketing: "2026-10-03",
} as const;

export type Purpose = keyof typeof CONSENT_VERSIONS;

export const REQUIRED: Record<Purpose, boolean> = { terms: true, sensitive: true, ai: false, marketing: false };

export const PURPOSES = Object.keys(CONSENT_VERSIONS) as Purpose[];
export const isPurpose = (v: unknown): v is Purpose => typeof v === "string" && v in CONSENT_VERSIONS;

export interface StoredConsent { granted: boolean; version: string; at: string }
export type ConsentStore = Partial<Record<Purpose, StoredConsent>>;

// A purpose is "satisfied" if it was decided under the current version.
export const decided = (s: ConsentStore, p: Purpose) => s[p]?.version === CONSENT_VERSIONS[p];
export const granted = (s: ConsentStore, p: Purpose) => decided(s, p) && s[p]!.granted;
