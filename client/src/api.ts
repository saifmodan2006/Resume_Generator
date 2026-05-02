import {
  AnalyzeResponse,
  AuthConfigResponse,
  AuthUser,
  BulletImproveMode,
  CoverLetterApiResponse,
  GenerateResumeResponse,
  GeneratedResume,
  GoogleAuthResponse,
  ImproveBulletsResponse,
  ResumeFormData
} from "./types";

async function postJson<T>(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return (await response.json()) as T;
}

export async function getAuthConfig() {
  const response = await fetch("/api/auth/config");

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unable to load auth config" }));
    throw new Error(error.error || "Unable to load auth config");
  }

  return (await response.json()) as AuthConfigResponse;
}

export const signInWithGoogle = (credential: string) =>
  postJson<GoogleAuthResponse>("/api/auth/google", { credential });

export function persistAuthUser(user: AuthUser) {
  localStorage.setItem("resume-forge-auth-user", JSON.stringify(user));
}

export function getPersistedAuthUser() {
  const saved = localStorage.getItem("resume-forge-auth-user");

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved) as AuthUser;
  } catch {
    localStorage.removeItem("resume-forge-auth-user");
    return null;
  }
}

export function clearPersistedAuthUser() {
  localStorage.removeItem("resume-forge-auth-user");
}

export const generateResume = (formData: ResumeFormData) =>
  postJson<GenerateResumeResponse>("/api/generate-resume", formData);

export const analyzeResume = (formData: ResumeFormData, resume?: GeneratedResume) =>
  postJson<AnalyzeResponse>("/api/analyze-resume", { formData, resume });

export const generateCoverLetter = (formData: ResumeFormData, resume?: GeneratedResume) =>
  postJson<CoverLetterApiResponse>("/api/generate-cover-letter", { formData, resume });

export const improveBullets = (
  formData: ResumeFormData,
  bullets: string,
  mode: BulletImproveMode,
  context: { section: "experience" | "project"; title: string; company?: string }
) =>
  postJson<ImproveBulletsResponse>("/api/improve-bullets", {
    formData,
    bullets,
    mode,
    context
  });

export const exportPdf = async (
  resume: GeneratedResume,
  template: ResumeFormData["template"]
) => {
  const response = await fetch("/api/export-pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ resume, template })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "PDF export failed" }));
    throw new Error(error.error || "PDF export failed");
  }

  return response.blob();
};
