const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "have",
  "ideal",
  "in",
  "is",
  "of",
  "on",
  "or",
  "our",
  "the",
  "their",
  "to",
  "we",
  "with",
  "you",
  "your"
]);

const preferredPhrases = [
  "react",
  "typescript",
  "node.js",
  "node",
  "design systems",
  "performance",
  "analytics",
  "accessibility",
  "leadership",
  "mentoring",
  "experimentation",
  "graphql",
  "rest api",
  "product collaboration",
  "stakeholder management",
  "automation",
  "testing"
];

const tokenize = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9+\-.\s]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !stopWords.has(token));

export const cleanList = (value, separators = /[,\n]/) =>
  value
    .split(separators)
    .map((item) => item.trim())
    .filter(Boolean);

export function extractKeywords(jobDescription = "") {
  const normalizedText = jobDescription.toLowerCase();
  const foundPreferred = preferredPhrases.filter((phrase) => normalizedText.includes(phrase));
  const counts = new Map();

  for (const token of tokenize(jobDescription)) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  const sorted = [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([word]) => word);

  return [...new Set([...foundPreferred, ...sorted])].slice(0, 18);
}

export function resumeTextFromFormData(formData) {
  const experienceText = formData.experiences
    .map((item) => `${item.role} ${item.company} ${item.bullets} ${item.technologies}`)
    .join(" ");
  const educationText = formData.education
    .map((item) => `${item.degree} ${item.school} ${item.details}`)
    .join(" ");
  const projectText = formData.projects
    .map((item) => `${item.name} ${item.description} ${item.impact} ${item.technologies}`)
    .join(" ");

  return [
    formData.targetRole,
    formData.skills,
    formData.certifications,
    experienceText,
    educationText,
    projectText
  ].join(" ");
}

export function resumeTextFromGeneratedResume(resume) {
  return [
    resume.title,
    resume.summary,
    resume.skillGroups.flatMap((group) => group.items).join(" "),
    resume.experience.flatMap((entry) => [entry.role, entry.company, ...entry.bullets]).join(" "),
    resume.projects.flatMap((entry) => [entry.name, ...entry.bullets]).join(" "),
    resume.education.flatMap((entry) => [entry.school, entry.degree, ...entry.details]).join(" "),
    resume.certifications.join(" ")
  ].join(" ");
}

export function buildAnalysis({ formData, resume }) {
  const keywords = extractKeywords(formData.jobDescription);
  const sourceText = resume
    ? resumeTextFromGeneratedResume(resume).toLowerCase()
    : resumeTextFromFormData(formData).toLowerCase();

  const matchingKeywords = keywords.filter((keyword) => sourceText.includes(keyword.toLowerCase()));
  const missingKeywords = keywords.filter((keyword) => !matchingKeywords.includes(keyword));
  const keywordCoverage = keywords.length === 0 ? 0.72 : matchingKeywords.length / keywords.length;
  const metricsBonus = /\d/.test(sourceText) ? 0.08 : 0;
  const summaryBonus = resume?.summary ? 0.05 : 0;
  const skillBonus = sourceText.includes("react") || sourceText.includes("node") ? 0.05 : 0;
  const rawScore = 48 + keywordCoverage * 42 + metricsBonus * 100 + summaryBonus * 100 + skillBonus * 100;
  const matchScore = Math.max(52, Math.min(98, Math.round(rawScore)));

  const atsTips = [
    missingKeywords[0]
      ? `Add "${missingKeywords[0]}" naturally to a relevant bullet if you have that experience.`
      : "Keyword coverage is already strong. Focus on keeping the resume concise.",
    /\d/.test(sourceText)
      ? "You already include metrics. Keep prioritizing quantified wins near the top of each role."
      : "Add measurable outcomes such as percentages, revenue, speed, or user growth to improve ATS and recruiter confidence.",
    sourceText.includes("led") || sourceText.includes("owned")
      ? "Leadership signals are present. Keep pairing them with business outcomes."
      : "Include ownership verbs like led, launched, optimized, or delivered for stronger impact."
  ];

  return {
    matchScore,
    matchingKeywords,
    missingKeywords,
    atsTips,
    roleFitSummary:
      formData.jobDescription.trim().length === 0
        ? "Add a job description to get tailored ATS recommendations."
        : `The resume aligns with ${matchingKeywords.length} of ${keywords.length || 0} detected target keywords and is positioned as a ${formData.targetRole || "candidate"} profile.`
  };
}
