import { buildAnalysis, cleanList, extractKeywords } from "./analysis.js";

const monthFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric"
});

const actionVerbs = [
  "Led",
  "Built",
  "Delivered",
  "Optimized",
  "Improved",
  "Scaled",
  "Launched",
  "Developed",
  "Streamlined"
];

function formatMonth(value) {
  if (!value) {
    return "";
  }

  const normalized = value.length === 7 ? `${value}-01` : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return monthFormatter.format(date);
}

function formatRange(startDate, endDate, current) {
  const start = formatMonth(startDate);
  const end = current ? "Present" : formatMonth(endDate);
  return [start, end].filter(Boolean).join(" - ");
}

function normalizeBullet(bullet, index = 0) {
  const trimmed = bullet.trim().replace(/^[\-\u2022]\s*/, "");
  if (!trimmed) {
    return "";
  }

  const withVerb = /^[A-Z]/.test(trimmed) ? trimmed : `${actionVerbs[index % actionVerbs.length]} ${trimmed}`;
  return /[.!?]$/.test(withVerb) ? withVerb : `${withVerb}.`;
}

function groupSkills(skills) {
  return [
    {
      title: "Core Skills",
      items: skills.slice(0, 6)
    },
    {
      title: "Platforms & Methods",
      items: skills.slice(6, 12)
    }
  ].filter((group) => group.items.length > 0);
}

export function buildFallbackResume(formData) {
  const skills = cleanList(formData.skills);
  const keywords = extractKeywords(formData.jobDescription);
  const summaryLead = {
    concise: "Results-oriented",
    confident: "High-ownership",
    executive: "Strategic, business-aware"
  }[formData.tone];

  return {
    fullName: formData.personalInfo.fullName || "Candidate Name",
    title: formData.targetRole || "Target Role",
    contact: [
      formData.personalInfo.email,
      formData.personalInfo.phone,
      formData.personalInfo.location,
      formData.personalInfo.linkedin,
      formData.personalInfo.portfolio
    ].filter(Boolean),
    summary: `${summaryLead} ${formData.targetRole || "professional"} with ${formData.yearsOfExperience || "several"}+ years of experience across ${skills.slice(0, 4).join(", ") || "cross-functional delivery"}. Known for translating requirements into measurable outcomes, using structured ATS-friendly language, and aligning execution to target job priorities.`,
    skillGroups: groupSkills([
      ...new Set([...skills, ...keywords.slice(0, 6)])
    ]),
    experience: formData.experiences
      .filter((item) => item.company || item.role || item.bullets)
      .map((item) => ({
        company: item.company || "Company",
        role: item.role || "Role",
        location: item.location || "",
        dates: formatRange(item.startDate, item.endDate, item.current),
        bullets: cleanList(item.bullets, /\n/)
          .map((bullet, index) => normalizeBullet(bullet, index))
          .concat(
            item.technologies
              ? [`Tools used: ${cleanList(item.technologies).join(", ")}.`]
              : []
          )
          .filter(Boolean)
      })),
    projects: formData.projects
      .filter((item) => item.name || item.description || item.impact)
      .map((item) => ({
        name: item.name || "Project",
        link: item.link || "",
        bullets: [item.description, item.impact, item.technologies && `Built with ${item.technologies}`]
          .filter(Boolean)
          .map((entry, index) => normalizeBullet(entry, index))
      })),
    education: formData.education
      .filter((item) => item.school || item.degree)
      .map((item) => ({
        school: item.school || "Institution",
        degree: item.degree || "Degree",
        location: item.location || "",
        dates: formatRange(item.startDate, item.endDate, false),
        details: cleanList(item.details, /\n/).map((detail, index) => normalizeBullet(detail, index))
      })),
    certifications: cleanList(formData.certifications, /\n/),
    atsKeywords: keywords.slice(0, 12),
    strengths: [
      "Structured headings and concise bullet formatting for ATS parsing",
      "Target-role alignment using job-description keywords",
      "Impact-oriented summary and role bullets"
    ]
  };
}

export function buildFallbackCoverLetter(formData, resume) {
  const candidateName = formData.personalInfo.fullName || "Candidate";
  const company = formData.targetCompany || "your team";
  const role = formData.targetRole || "the role";
  const strongestBullets = resume.experience.flatMap((item) => item.bullets).slice(0, 2);
  const keywordBlend = extractKeywords(formData.jobDescription).slice(0, 3).join(", ");

  return {
    coverLetter: `Dear Hiring Team,\n\nI am applying for the ${role} opportunity at ${company}. My background combines hands-on execution with measurable delivery across ${resume.skillGroups
      .flatMap((group) => group.items)
      .slice(0, 4)
      .join(", ")}.\n\nIn recent roles, I have focused on outcomes that matter to hiring teams: ${strongestBullets[0] || "delivering high-quality work under changing priorities"} ${strongestBullets[1] || "while collaborating effectively with cross-functional partners"} This mix of ownership, communication, and execution is what I would bring to your team.\n\nI am especially interested in this role because the job description emphasizes ${keywordBlend || "building high-impact work"}, which aligns well with the work I have already delivered. I would welcome the opportunity to discuss how I can contribute quickly and help move priorities forward.\n\nSincerely,\n${candidateName}`,
    talkingPoints: [
      `Connect ${role} experience to ${company}'s current needs.`,
      strongestBullets[0] || "Highlight a measurable achievement from recent work.",
      strongestBullets[1] || "Show how your core skills map to the job description."
    ]
  };
}

export function buildFallbackAnalysis(formData, resume) {
  return buildAnalysis({ formData, resume });
}

export function buildFallbackImprovedBullets({ formData, bullets, mode }) {
  const keywords = extractKeywords(formData.jobDescription).slice(0, 3);
  const lines = cleanList(bullets, /\n/);
  const actionMap = {
    stronger: "Delivered",
    metrics: "Improved",
    ats: "Applied",
    shorten: "Led"
  };

  const improved = lines.map((line, index) => {
    const cleaned = line
      .trim()
      .replace(/^[\-\u2022]\s*/, "")
      .replace(/[.!?]$/, "")
      .replace(/^(built|created|delivered|designed|improved|launched|led|optimized|owned|reduced|scaled|shipped)\s+/i, "");
    const keyword = keywords[index % Math.max(keywords.length, 1)];
    const prefix = actionMap[mode] || "Delivered";
    const metric = mode === "metrics" && !/\d/.test(cleaned) ? " by [X%]" : "";
    const keywordText = mode === "ats" && keyword ? ` using ${keyword}` : "";
    const normalized = `${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`;
    const sentence = `${prefix} ${normalized}${keywordText}${metric}`;

    return mode === "shorten"
      ? normalizeBullet(sentence.split(/\s+/).slice(0, 18).join(" "), index)
      : normalizeBullet(sentence, index);
  });

  return {
    bullets: improved.length > 0 ? improved : ["Delivered measurable results aligned to the target role."],
    reason:
      mode === "metrics"
        ? "Added metric placeholders where exact numbers were not provided."
        : "Rewrote bullets with stronger resume language while preserving the original facts."
  };
}
