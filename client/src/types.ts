export type TemplateName = "aurora" | "graphite" | "linen";

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
}

export interface ExperienceInput {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string;
  technologies: string;
}

export interface EducationInput {
  id: string;
  school: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  details: string;
}

export interface ProjectInput {
  id: string;
  name: string;
  link: string;
  description: string;
  impact: string;
  technologies: string;
}

export interface ResumeFormData {
  personalInfo: PersonalInfo;
  targetRole: string;
  targetCompany: string;
  yearsOfExperience: string;
  tone: "concise" | "confident" | "executive";
  template: TemplateName;
  skills: string;
  certifications: string;
  jobDescription: string;
  experiences: ExperienceInput[];
  education: EducationInput[];
  projects: ProjectInput[];
}

export interface SkillGroup {
  title: string;
  items: string[];
}

export interface ResumeSectionExperience {
  company: string;
  role: string;
  location: string;
  dates: string;
  bullets: string[];
}

export interface ResumeSectionProject {
  name: string;
  link: string;
  bullets: string[];
}

export interface ResumeSectionEducation {
  school: string;
  degree: string;
  location: string;
  dates: string;
  details: string[];
}

export interface GeneratedResume {
  fullName: string;
  title: string;
  contact: string[];
  summary: string;
  skillGroups: SkillGroup[];
  experience: ResumeSectionExperience[];
  projects: ResumeSectionProject[];
  education: ResumeSectionEducation[];
  certifications: string[];
  atsKeywords: string[];
  strengths: string[];
}

export interface ResumeAnalysis {
  matchScore: number;
  scoreBreakdown: {
    skills: number;
    experience: number;
    keywords: number;
    education: number;
    impact: number;
  };
  matchingKeywords: string[];
  missingKeywords: string[];
  keywordSuggestions: Array<{
    keyword: string;
    section: string;
    suggestion: string;
  }>;
  atsTips: string[];
  roleFitSummary: string;
}

export interface CoverLetterResponse {
  coverLetter: string;
  talkingPoints: string[];
}

export interface GenerationMeta {
  mode: "openai" | "demo";
  model: string;
}

export interface AuthUser {
  id: number;
  googleSub: string;
  email: string;
  name: string;
  picture: string | null;
  createdAt: string;
  lastSignIn: string;
}

export interface AuthConfigResponse {
  googleClientId: string;
}

export interface GoogleAuthResponse {
  user: AuthUser;
}

export interface GenerateResumeResponse {
  resume: GeneratedResume;
  analysis: ResumeAnalysis;
  meta: GenerationMeta;
}

export interface AnalyzeResponse {
  analysis: ResumeAnalysis;
  meta: GenerationMeta;
}

export interface CoverLetterApiResponse {
  coverLetter: CoverLetterResponse;
  meta: GenerationMeta;
}

export type BulletImproveMode = "stronger" | "metrics" | "ats" | "shorten";

export interface ImproveBulletsResponse {
  result: {
    bullets: string[];
    reason: string;
  };
  meta: GenerationMeta;
}
