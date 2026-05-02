import { z } from "zod";

const personalInfoSchema = z.object({
  fullName: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  linkedin: z.string().default(""),
  portfolio: z.string().default("")
});

const experienceSchema = z.object({
  id: z.string().default(""),
  company: z.string().default(""),
  role: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  current: z.boolean().default(false),
  bullets: z.string().default(""),
  technologies: z.string().default("")
});

const educationSchema = z.object({
  id: z.string().default(""),
  school: z.string().default(""),
  degree: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  details: z.string().default("")
});

const projectSchema = z.object({
  id: z.string().default(""),
  name: z.string().default(""),
  link: z.string().default(""),
  description: z.string().default(""),
  impact: z.string().default(""),
  technologies: z.string().default("")
});

export const formDataSchema = z.object({
  personalInfo: personalInfoSchema,
  targetRole: z.string().default(""),
  targetCompany: z.string().default(""),
  yearsOfExperience: z.string().default(""),
  tone: z.enum(["concise", "confident", "executive"]).default("confident"),
  template: z.enum(["aurora", "graphite", "linen"]).default("aurora"),
  skills: z.string().default(""),
  certifications: z.string().default(""),
  jobDescription: z.string().default(""),
  experiences: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  projects: z.array(projectSchema).default([])
});

const skillGroupSchema = z.object({
  title: z.string(),
  items: z.array(z.string())
});

const generatedResumeSchema = z.object({
  fullName: z.string(),
  title: z.string(),
  contact: z.array(z.string()),
  summary: z.string(),
  skillGroups: z.array(skillGroupSchema),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      location: z.string(),
      dates: z.string(),
      bullets: z.array(z.string())
    })
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      link: z.string(),
      bullets: z.array(z.string())
    })
  ),
  education: z.array(
    z.object({
      school: z.string(),
      degree: z.string(),
      location: z.string(),
      dates: z.string(),
      details: z.array(z.string())
    })
  ),
  certifications: z.array(z.string()),
  atsKeywords: z.array(z.string()),
  strengths: z.array(z.string())
});

export const resumeRequestSchema = formDataSchema;

export const analyzeRequestSchema = z.object({
  formData: formDataSchema,
  resume: generatedResumeSchema.optional()
});

export const coverLetterRequestSchema = z.object({
  formData: formDataSchema,
  resume: generatedResumeSchema.optional()
});

export const exportPdfRequestSchema = z.object({
  resume: generatedResumeSchema,
  template: z.enum(["aurora", "graphite", "linen"])
});

export const improveBulletsRequestSchema = z.object({
  formData: formDataSchema,
  bullets: z.string().default(""),
  mode: z.enum(["stronger", "metrics", "ats", "shorten"]).default("stronger"),
  context: z
    .object({
      section: z.enum(["experience", "project"]).default("experience"),
      title: z.string().default(""),
      company: z.string().default("")
    })
    .default({})
});
