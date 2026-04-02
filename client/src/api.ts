import {
  AnalyzeResponse,
  CoverLetterApiResponse,
  GenerateResumeResponse,
  GeneratedResume,
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

export const generateResume = (formData: ResumeFormData) =>
  postJson<GenerateResumeResponse>("/api/generate-resume", formData);

export const analyzeResume = (formData: ResumeFormData, resume?: GeneratedResume) =>
  postJson<AnalyzeResponse>("/api/analyze-resume", { formData, resume });

export const generateCoverLetter = (formData: ResumeFormData, resume?: GeneratedResume) =>
  postJson<CoverLetterApiResponse>("/api/generate-cover-letter", { formData, resume });

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
