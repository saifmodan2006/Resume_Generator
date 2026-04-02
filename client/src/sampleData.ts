import { ResumeFormData } from "./types";

export const sampleData: ResumeFormData = {
  personalInfo: {
    fullName: "Aarav Mehta",
    email: "aarav.mehta@email.com",
    phone: "+91 98765 43210",
    location: "Bengaluru, India",
    linkedin: "linkedin.com/in/aaravmehta",
    portfolio: "aaravbuilds.dev"
  },
  targetRole: "Senior Frontend Engineer",
  targetCompany: "Nimbus Labs",
  yearsOfExperience: "5",
  tone: "confident",
  template: "aurora",
  skills:
    "React, TypeScript, Node.js, Next.js, REST APIs, GraphQL, Jest, Cypress, Performance Optimization, Figma, Design Systems, Accessibility",
  certifications:
    "AWS Certified Cloud Practitioner\nGoogle UX Design Certificate",
  jobDescription:
    "We are hiring a Senior Frontend Engineer to own high-impact product surfaces, collaborate with design and product, improve performance, and ship accessible React applications. The ideal candidate has strong TypeScript skills, experience with analytics, experimentation, and design systems, and can mentor junior engineers.",
  experiences: [
    {
      id: "exp-1",
      company: "PixelMint",
      role: "Frontend Engineer",
      location: "Bengaluru",
      startDate: "2022-02",
      endDate: "",
      current: true,
      bullets:
        "Led migration of customer dashboard from legacy Angular to React and TypeScript\nImproved Lighthouse performance score from 58 to 93 through code splitting and asset optimization\nPartnered with product and design to launch onboarding funnel that increased activation by 24%\nBuilt reusable component library used across 4 product teams",
      technologies: "React, TypeScript, Vite, Storybook, Cypress"
    },
    {
      id: "exp-2",
      company: "LaunchPilot",
      role: "Software Engineer",
      location: "Remote",
      startDate: "2020-01",
      endDate: "2022-01",
      current: false,
      bullets:
        "Developed analytics dashboards for B2B customers using React and Node.js\nReduced bug backlog by 35% by improving test coverage and release workflows\nCollaborated with QA and product managers to prioritize weekly releases",
      technologies: "React, Node.js, PostgreSQL, Jest"
    }
  ],
  education: [
    {
      id: "edu-1",
      school: "PES University",
      degree: "B.Tech, Computer Science",
      location: "Bengaluru",
      startDate: "2016-08",
      endDate: "2020-05",
      details:
        "Graduated with distinction\nCapstone: Built recommendation engine for campus placement prep"
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "MetricsHub",
      link: "github.com/aaravmehta/metricshub",
      description: "Built a self-serve analytics dashboard for indie SaaS founders.",
      impact: "Reached 1,200 monthly active users and 18% paid conversion in beta.",
      technologies: "Next.js, Prisma, PostgreSQL, Tailwind"
    }
  ]
};
