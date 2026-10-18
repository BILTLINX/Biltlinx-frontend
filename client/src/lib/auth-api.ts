import { apiRequest, clearCsrfToken } from "@/lib/api";
import type { CurrentUser, LoginResult, MfaChallenge, MfaMethod } from "@/types/api/auth";

export function register(input: { username: string; primaryContact: string; email: string; password: string }) {
  return apiRequest("/auth/register", { method: "POST", body: input });
}

export function verifyOtp(input: { email: string; otp: string }) {
  return apiRequest("/auth/verify", { method: "POST", body: input });
}

export function resendOtp(input: { email: string }) {
  return apiRequest("/auth/resend-otp", { method: "POST", body: input });
}

export function forgotPassword(input: { email?: string; phone?: string }) {
  return apiRequest("/auth/forgot-password", { method: "POST", body: input });
}

export function resetPassword(input: {
  email?: string;
  phone?: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}) {
  return apiRequest("/auth/forgot-password-reset", { method: "POST", body: input });
}

export async function login(input: {
  email?: string;
  phone?: string;
  password: string;
  rememberMe?: boolean;
}): Promise<LoginResult> {
  const result = await apiRequest<MfaChallenge | undefined>("/auth/login", { method: "POST", body: input });
  clearCsrfToken();
  if (result?.mfaRequired) return result;
  return { mfaRequired: false };
}

export async function completeMfaLogin(input: { challengeToken: string; code: string; method: MfaMethod }) {
  await apiRequest("/auth/login/mfa", { method: "POST", body: input });
  clearCsrfToken();
}

export function sendMfaOtp(input: { challengeToken: string; channel: "email" | "sms" }) {
  return apiRequest("/auth/login/mfa/send-otp", { method: "POST", body: input });
}

export function getMe() {
  return apiRequest<CurrentUser>("/auth/me", { skipSignInRedirect: true });
}

export async function logout() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } finally {
    clearCsrfToken();
  }
}
