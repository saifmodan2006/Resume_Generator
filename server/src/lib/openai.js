import OpenAI from "openai";

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

function extractText(response) {
  if (response.output_text) {
    return response.output_text;
  }

  const output = response.output ?? [];
  return output
    .flatMap((item) => item.content ?? [])
    .map((item) => item.text ?? "")
    .join("\n");
}

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");

    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    }

    throw new Error("Model response was not valid JSON.");
  }
}

async function requestJson(prompt) {
  const client = getClient();
  if (!client) {
    return null;
  }

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    input: prompt
  });

  return {
    data: safeParseJson(extractText(response)),
    model: response.model || process.env.OPENAI_MODEL || "gpt-4.1-mini"
  };
}

export async function generateResumeWithAI(formData) {
  const prompt = `
Return JSON only. No markdown fences.

Create an ATS-optimized resume tailored to the target job description. Keep language concise, impact-focused, and specific. Preserve facts from the source data and do not invent employers, dates, or achievements.

Use this JSON shape:
{
  "fullName": "string",
  "title": "string",
  "contact": ["string"],
  "summary": "string",
  "skillGroups": [{"title": "string", "items": ["string"]}],
  "experience": [{"company": "string", "role": "string", "location": "string", "dates": "string", "bullets": ["string"]}],
  "projects": [{"name": "string", "link": "string", "bullets": ["string"]}],
  "education": [{"school": "string", "degree": "string", "location": "string", "dates": "string", "details": ["string"]}],
  "certifications": ["string"],
  "atsKeywords": ["string"],
  "strengths": ["string"]
}

Source data:
${JSON.stringify(formData, null, 2)}
`;

  return requestJson(prompt);
}

export async function analyzeResumeWithAI(formData, resume) {
  const prompt = `
Return JSON only. No markdown fences.

Analyze the fit between this resume and the target job description. Focus on ATS-style keyword coverage and clarity.

Use this JSON shape:
{
  "matchScore": 0,
  "matchingKeywords": ["string"],
  "missingKeywords": ["string"],
  "atsTips": ["string"],
  "roleFitSummary": "string"
}

Form data:
${JSON.stringify(formData, null, 2)}

Resume:
${JSON.stringify(resume, null, 2)}
`;

  return requestJson(prompt);
}

export async function generateCoverLetterWithAI(formData, resume) {
  const prompt = `
Return JSON only. No markdown fences.

Write a tailored cover letter that is professional, concise, and based only on the supplied data.

Use this JSON shape:
{
  "coverLetter": "string",
  "talkingPoints": ["string"]
}

Form data:
${JSON.stringify(formData, null, 2)}

Resume:
${JSON.stringify(resume, null, 2)}
`;

  return requestJson(prompt);
}

export async function improveBulletsWithAI({ formData, bullets, mode, context }) {
  const modeInstructions = {
    stronger: "Rewrite each bullet with a strong action verb, clearer ownership, and tighter business impact.",
    metrics: "Rewrite each bullet to leave realistic placeholders for metrics where the source does not provide exact numbers. Do not invent numbers.",
    ats: "Rewrite each bullet to naturally include relevant target-job keywords only when they fit the user's actual background.",
    shorten: "Make each bullet concise, recruiter-friendly, and no more than 22 words."
  };

  const prompt = `
Return JSON only. No markdown fences.

Improve these resume bullets. Preserve facts, do not invent employers, tools, dates, or exact metrics. If a metric is missing and the mode asks for metrics, use bracketed placeholders such as [X%] or [number].

Mode: ${mode}
Instruction: ${modeInstructions[mode]}

Use this JSON shape:
{
  "bullets": ["string"],
  "reason": "string"
}

Context:
${JSON.stringify(context, null, 2)}

Target role: ${formData.targetRole}
Target company: ${formData.targetCompany}
Job description:
${formData.jobDescription}

Original bullets:
${bullets}
`;

  return requestJson(prompt);
}
