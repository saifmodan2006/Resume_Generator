import {
  EducationInput,
  ExperienceInput,
  GeneratedResume,
  ProjectInput,
  ResumeFormData
} from "./types";

const monthFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric"
});

const cleanList = (value: string, separators = /[,\n]/) =>
  value
    .split(separators)
    .map((item) => item.trim())
    .filter(Boolean);

const formatMonth = (value: string) => {
  if (!value) {
    return "";
  }

  const normalized = value.length === 7 ? `${value}-01` : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return monthFormatter.format(date);
};

const formatRange = (startDate: string, endDate: string, current: boolean) => {
  const start = formatMonth(startDate);
  const end = current ? "Present" : formatMonth(endDate);
  return [start, end].filter(Boolean).join(" - ");
};

const normalizeBullet = (bullet: string) => {
  const trimmed = bullet.trim().replace(/^[\-\u2022]\s*/, "");
  if (!trimmed) {
    return "";
  }

  return /[.!?]$/.test(trimmed)
    ? trimmed
    : `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}.`;
};

const fallbackSummary = (formData: ResumeFormData) => {
  const skills = cleanList(formData.skills).slice(0, 5).join(", ");
  const years = formData.yearsOfExperience || "several";
  const toneLead = {
    concise: "Results-focused",
    confident: "Strategic and delivery-minded",
    executive: "Business-facing and high-impact"
  }[formData.tone];

  return `${toneLead} ${formData.targetRole || "professional"} with ${years}+ years of experience delivering measurable outcomes across ${skills || "modern product teams"}. Combines product thinking, execution discipline, and ATS-friendly positioning to communicate impact clearly.`;
};

const groupSkills = (formData: ResumeFormData) => {
  const skills = cleanList(formData.skills);

  return [
    {
      title: "Core Skills",
      items: skills.slice(0, 6)
    },
    {
      title: "Tools & Platforms",
      items: skills.slice(6)
    }
  ].filter((group) => group.items.length > 0);
};

const mapExperience = (experiences: ExperienceInput[]) =>
  experiences
    .filter((item) => item.company || item.role)
    .map((item) => ({
      company: item.company || "Company",
      role: item.role || "Role",
      location: item.location,
      dates: formatRange(item.startDate, item.endDate, item.current),
      bullets: cleanList(item.bullets, /\n/).map(normalizeBullet).filter(Boolean)
    }));

const mapProjects = (projects: ProjectInput[]) =>
  projects
    .filter((item) => item.name || item.description || item.impact)
    .map((item) => ({
      name: item.name || "Project",
      link: item.link,
      bullets: [item.description, item.impact, item.technologies && `Stack: ${item.technologies}`]
        .filter(Boolean)
        .map((entry) => normalizeBullet(entry))
    }));

const mapEducation = (education: EducationInput[]) =>
  education
    .filter((item) => item.school || item.degree)
    .map((item) => ({
      school: item.school || "Institution",
      degree: item.degree || "Degree",
      location: item.location,
      dates: formatRange(item.startDate, item.endDate, false),
      details: cleanList(item.details, /\n/).map(normalizeBullet).filter(Boolean)
    }));

export const buildDraftResume = (formData: ResumeFormData): GeneratedResume => ({
  fullName: formData.personalInfo.fullName || "Your Name",
  title: formData.targetRole || "Target Role",
  contact: [
    formData.personalInfo.email,
    formData.personalInfo.phone,
    formData.personalInfo.location,
    formData.personalInfo.linkedin,
    formData.personalInfo.portfolio
  ].filter(Boolean),
  summary: fallbackSummary(formData),
  skillGroups: groupSkills(formData),
  experience: mapExperience(formData.experiences),
  projects: mapProjects(formData.projects),
  education: mapEducation(formData.education),
  certifications: cleanList(formData.certifications, /\n/),
  atsKeywords: cleanList(formData.jobDescription).slice(0, 10),
  strengths: [
    "Clear measurable impact bullets",
    "Modern skills aligned to target role",
    "Structured sections for ATS parsing"
  ]
});

export const createId = () =>
  `item-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;

export const emptyExperience = (): ExperienceInput => ({
  id: createId(),
  company: "",
  role: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  bullets: "",
  technologies: ""
});

export const emptyEducation = (): EducationInput => ({
  id: createId(),
  school: "",
  degree: "",
  location: "",
  startDate: "",
  endDate: "",
  details: ""
});

export const emptyProject = (): ProjectInput => ({
  id: createId(),
  name: "",
  link: "",
  description: "",
  impact: "",
  technologies: ""
});
