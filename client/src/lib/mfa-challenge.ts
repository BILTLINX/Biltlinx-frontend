import type { MfaChallenge } from "@/types/api/auth";

const KEY = "biltlinx.mfa-challenge";

export function saveMfaChallenge(challenge: MfaChallenge) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(challenge));
  } catch {}
}

export function takeMfaChallenge(): MfaChallenge | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (!raw) return null;
    const challenge = JSON.parse(raw) as MfaChallenge;
    return new Date(challenge.expiresAt).getTime() > Date.now() ? challenge : null;
  } catch {
    return null;
  }
}
