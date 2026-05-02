import { startTransition, useDeferredValue, useEffect, useEffectEvent, useState } from "react";
import {
  analyzeResume,
  exportPdf,
  generateCoverLetter,
  generateResume,
  improveBullets
} from "./api";
import { InsightPanel } from "./components/InsightPanel";
import { ResumePreview } from "./components/ResumePreview";
import {
  buildDraftResume,
  emptyEducation,
  emptyExperience,
  emptyProject
} from "./helpers";
import { sampleData } from "./sampleData";
import {
  CoverLetterResponse,
  BulletImproveMode,
  GeneratedResume,
  ResumeAnalysis,
  ResumeFormData,
  TemplateName
} from "./types";

type Html2PdfModule = {
  default?: () => {
    set: (options: Record<string, unknown>) => {
      from: (element: HTMLElement) => {
        save: () => Promise<void>;
      };
    };
  };
};

const STORAGE_KEY = "resume-forge-ai-draft";
const BULLET_IMPROVE_MODES: BulletImproveMode[] = ["stronger", "metrics", "ats", "shorten"];

const bulletImproveLabels: Record<BulletImproveMode, string> = {
  stronger: "Stronger",
  metrics: "Add metrics",
  ats: "ATS keywords",
  shorten: "Shorten"
};

const defaultFormData: ResumeFormData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: ""
  },
  targetRole: "",
  targetCompany: "",
  yearsOfExperience: "",
  tone: "confident",
  template: "aurora",
  skills: "",
  certifications: "",
  jobDescription: "",
  experiences: [emptyExperience()],
  education: [emptyEducation()],
  projects: [emptyProject()]
};

async function exportPreviewPdfInBrowser(fileName: string) {
  const element = document.getElementById("resume-preview-sheet");

  if (!element) {
    throw new Error("Resume preview is not ready yet.");
  }

  const html2pdfModule = (await import("html2pdf.js")) as Html2PdfModule;
  const html2pdf = html2pdfModule.default;

  if (!html2pdf) {
    throw new Error("Browser PDF exporter could not be loaded.");
  }

  await html2pdf()
    .set({
      margin: [8, 8, 8, 8],
      filename: fileName,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait"
      },
      pagebreak: {
        mode: ["css", "legacy"]
      }
    })
    .from(element)
    .save();
}

function App() {
  const [formData, setFormData] = useState<ResumeFormData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return defaultFormData;
    }

    try {
      return JSON.parse(saved) as ResumeFormData;
    } catch {
      return defaultFormData;
    }
  });
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [coverLetter, setCoverLetter] = useState<CoverLetterResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState("Build a draft, then generate an ATS-optimized version.");
  const [generationMode, setGenerationMode] = useState<{
    mode: "openai" | "demo";
    model: string;
  } | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const deferredFormData = useDeferredValue(formData);
  const previewResume = generatedResume ?? buildDraftResume(deferredFormData);

  const persistDraft = useEffectEvent((nextState: ResumeFormData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  });

  useEffect(() => {
    persistDraft(formData);
  }, [formData, persistDraft]);

  const updatePersonalInfo = (field: keyof ResumeFormData["personalInfo"], value: string) => {
    setFormData((current) => ({
      ...current,
      personalInfo: {
        ...current.personalInfo,
        [field]: value
      }
    }));
  };

  const updateField = <K extends keyof ResumeFormData>(field: K, value: ResumeFormData[K]) => {
    setFormData((current) => ({
      ...current,
      [field]: value
    }));
  };

  const updateCollectionItem = <
    K extends "experiences" | "education" | "projects",
    V extends ResumeFormData[K][number]
  >(
    field: K,
    id: string,
    key: keyof V,
    value: string | boolean
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: current[field].map((item) =>
        item.id === id
          ? {
              ...item,
              [key]: value
            }
          : item
      )
    }));
  };

  const addCollectionItem = (field: "experiences" | "education" | "projects") => {
    setFormData((current) => ({
      ...current,
      [field]:
        field === "experiences"
          ? [...current.experiences, emptyExperience()]
          : field === "education"
            ? [...current.education, emptyEducation()]
            : [...current.projects, emptyProject()]
    }));
  };

  const removeCollectionItem = (field: "experiences" | "education" | "projects", id: string) => {
    setFormData((current) => ({
      ...current,
      [field]: current[field].length === 1 ? current[field] : current[field].filter((item) => item.id !== id)
    }));
  };

  const withBusyState = async (label: string, work: () => Promise<void>) => {
    setBusyAction(label);
    try {
      await work();
    } finally {
      setBusyAction(null);
    }
  };

  const handleGenerateResume = () =>
    withBusyState("generate", async () => {
      setStatusMessage("Generating resume and ATS analysis...");
      const response = await generateResume(formData);
      startTransition(() => {
        setGeneratedResume(response.resume);
        setAnalysis(response.analysis);
        setGenerationMode(response.meta);
        setStatusMessage("Resume generated. Review the live preview and export when ready.");
      });
    }).catch((error: Error) => {
      setStatusMessage(error.message);
    });

  const handleAnalyzeResume = () =>
    withBusyState("analyze", async () => {
      setStatusMessage("Analyzing ATS keyword match...");
      const response = await analyzeResume(formData, previewResume);
      startTransition(() => {
        setAnalysis(response.analysis);
        setGenerationMode(response.meta);
        setStatusMessage("ATS analysis updated.");
      });
    }).catch((error: Error) => {
      setStatusMessage(error.message);
    });

  const handleGenerateCoverLetter = () =>
    withBusyState("cover-letter", async () => {
      setStatusMessage("Generating cover letter...");
      const response = await generateCoverLetter(formData, previewResume);
      startTransition(() => {
        setCoverLetter(response.coverLetter);
        setGenerationMode(response.meta);
        setStatusMessage("Cover letter generated.");
      });
    }).catch((error: Error) => {
      setStatusMessage(error.message);
    });

  const handleImproveExperienceBullets = (
    id: string,
    mode: BulletImproveMode,
    context: { title: string; company: string; bullets: string }
  ) =>
    withBusyState(`improve-${id}-${mode}`, async () => {
      if (!context.bullets.trim()) {
        setStatusMessage("Add at least one achievement bullet before improving it.");
        return;
      }

      setStatusMessage("Improving achievement bullets...");
      const response = await improveBullets(formData, context.bullets, mode, {
        section: "experience",
        title: context.title,
        company: context.company
      });

      updateCollectionItem("experiences", id, "bullets", response.result.bullets.join("\n"));
      setGenerationMode(response.meta);
      setStatusMessage(response.result.reason);
    }).catch((error: Error) => {
      setStatusMessage(error.message);
    });

  const handleImproveProjectImpact = (
    id: string,
    mode: BulletImproveMode,
    context: { title: string; impact: string }
  ) =>
    withBusyState(`improve-${id}-${mode}`, async () => {
      if (!context.impact.trim()) {
        setStatusMessage("Add a project impact statement before improving it.");
        return;
      }

      setStatusMessage("Improving project impact...");
      const response = await improveBullets(formData, context.impact, mode, {
        section: "project",
        title: context.title
      });

      updateCollectionItem("projects", id, "impact", response.result.bullets.join("\n"));
      setGenerationMode(response.meta);
      setStatusMessage(response.result.reason);
    }).catch((error: Error) => {
      setStatusMessage(error.message);
    });

  const handleExportPdf = () =>
    withBusyState("pdf", async () => {
      const fileName = `${previewResume.fullName || "resume"}-resume.pdf`;

      try {
        setStatusMessage("Rendering high-quality PDF from preview...");
        await exportPreviewPdfInBrowser(fileName);
        setStatusMessage("PDF downloaded.");
        return;
      } catch {
        setStatusMessage("Browser export unavailable, trying server export...");
      }

      const blob = await exportPdf(previewResume, formData.template);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatusMessage("PDF downloaded.");
    }).catch((error: Error) => {
      setStatusMessage(error.message);
    });

  const handleCopyCoverLetter = async () => {
    if (!coverLetter) {
      setStatusMessage("Generate a cover letter before copying it.");
      return;
    }

    await navigator.clipboard.writeText(coverLetter.coverLetter);
    setStatusMessage("Cover letter copied to clipboard.");
  };

  const handleLoadSample = () => {
    startTransition(() => {
      setFormData(sampleData);
      setGeneratedResume(null);
      setAnalysis(null);
      setCoverLetter(null);
      setGenerationMode(null);
      setStatusMessage("Sample data loaded.");
    });
  };

  const handleReset = () => {
    startTransition(() => {
      setFormData(defaultFormData);
      setGeneratedResume(null);
      setAnalysis(null);
      setCoverLetter(null);
      setGenerationMode(null);
      localStorage.removeItem(STORAGE_KEY);
      setStatusMessage("Draft reset.");
    });
  };

  const templateOptions: Array<{ value: TemplateName; label: string }> = [
    { value: "aurora", label: "Aurora" },
    { value: "graphite", label: "Graphite" },
    { value: "linen", label: "Linen" }
  ];

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="hero">
        <div>
          <p className="eyebrow">AI Resume Builder</p>
          <h1>Resume Forge AI</h1>
          <p className="hero-copy">
            Generate ATS-friendly resumes, pinpoint keyword gaps, draft cover letters, and export polished PDFs from one workflow.
          </p>
        </div>
        <div className="hero-actions">
          <button type="button" className="secondary-button" onClick={handleLoadSample}>
            Load sample
          </button>
          <button type="button" className="secondary-button" onClick={handleReset}>
            Reset draft
          </button>
        </div>
      </header>

      <section className="action-bar glass-card">
        <div>
          <p className="eyebrow">Workflow</p>
          <h2>From experience input to downloadable resume</h2>
          <p className="status-copy">{statusMessage}</p>
        </div>
        <div className="action-row">
          <button
            type="button"
            className="primary-button"
            onClick={handleGenerateResume}
            disabled={busyAction !== null}
          >
            {busyAction === "generate" ? "Generating..." : "Generate Resume"}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={handleAnalyzeResume}
            disabled={busyAction !== null}
          >
            {busyAction === "analyze" ? "Analyzing..." : "Refresh ATS Match"}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={handleGenerateCoverLetter}
            disabled={busyAction !== null}
          >
            {busyAction === "cover-letter" ? "Generating..." : "Generate Cover Letter"}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={handleExportPdf}
            disabled={busyAction !== null}
          >
            {busyAction === "pdf" ? "Exporting..." : "Download PDF"}
          </button>
        </div>
      </section>

      <main className="workspace-grid">
        <section className="builder-panel">
          <div className="glass-card">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Profile</p>
                <h3>Candidate Information</h3>
              </div>
            </div>

            <div className="field-grid two-up">
              <label>
                Full Name
                <input
                  value={formData.personalInfo.fullName}
                  onChange={(event) => updatePersonalInfo("fullName", event.target.value)}
                  placeholder="Priya Sharma"
                />
              </label>
              <label>
                Target Role
                <input
                  value={formData.targetRole}
                  onChange={(event) => updateField("targetRole", event.target.value)}
                  placeholder="Product Designer"
                />
              </label>
              <label>
                Email
                <input
                  value={formData.personalInfo.email}
                  onChange={(event) => updatePersonalInfo("email", event.target.value)}
                  placeholder="priya@email.com"
                />
              </label>
              <label>
                Phone
                <input
                  value={formData.personalInfo.phone}
                  onChange={(event) => updatePersonalInfo("phone", event.target.value)}
                  placeholder="+91 98765 43210"
                />
              </label>
              <label>
                Location
                <input
                  value={formData.personalInfo.location}
                  onChange={(event) => updatePersonalInfo("location", event.target.value)}
                  placeholder="Mumbai, India"
                />
              </label>
              <label>
                Years Of Experience
                <input
                  value={formData.yearsOfExperience}
                  onChange={(event) => updateField("yearsOfExperience", event.target.value)}
                  placeholder="4"
                />
              </label>
              <label>
                LinkedIn
                <input
                  value={formData.personalInfo.linkedin}
                  onChange={(event) => updatePersonalInfo("linkedin", event.target.value)}
                  placeholder="linkedin.com/in/username"
                />
              </label>
              <label>
                Portfolio
                <input
                  value={formData.personalInfo.portfolio}
                  onChange={(event) => updatePersonalInfo("portfolio", event.target.value)}
                  placeholder="portfolio.dev"
                />
              </label>
              <label>
                Target Company
                <input
                  value={formData.targetCompany}
                  onChange={(event) => updateField("targetCompany", event.target.value)}
                  placeholder="Acme Corp"
                />
              </label>
              <label>
                Tone
                <select
                  value={formData.tone}
                  onChange={(event) =>
                    updateField("tone", event.target.value as ResumeFormData["tone"])
                  }
                >
                  <option value="concise">Concise</option>
                  <option value="confident">Confident</option>
                  <option value="executive">Executive</option>
                </select>
              </label>
            </div>

            <label className="full-width">
              Core Skills
              <textarea
                value={formData.skills}
                onChange={(event) => updateField("skills", event.target.value)}
                placeholder="React, TypeScript, Node.js, SQL, Figma"
                rows={3}
              />
            </label>

            <label className="full-width">
              Certifications
              <textarea
                value={formData.certifications}
                onChange={(event) => updateField("certifications", event.target.value)}
                placeholder={"AWS Solutions Architect\nPMP"}
                rows={3}
              />
            </label>

            <div className="template-switcher">
              {templateOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={formData.template === option.value ? "template-pill active" : "template-pill"}
                  onClick={() => updateField("template", option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Target Job</p>
                <h3>Job Description Intake</h3>
              </div>
            </div>
            <label className="full-width">
              Paste the job description you want to tailor for
              <textarea
                value={formData.jobDescription}
                onChange={(event) => updateField("jobDescription", event.target.value)}
                placeholder="Paste a target job description here..."
                rows={9}
              />
            </label>
          </div>

          <div className="glass-card">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Experience</p>
                <h3>Work History</h3>
              </div>
              <button type="button" className="ghost-button" onClick={() => addCollectionItem("experiences")}>
                Add role
              </button>
            </div>

            {formData.experiences.map((item, index) => (
              <div key={item.id} className="repeatable-card">
                <div className="repeatable-header">
                  <span>Role {index + 1}</span>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => removeCollectionItem("experiences", item.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="field-grid two-up">
                  <label>
                    Company
                    <input
                      value={item.company}
                      onChange={(event) =>
                        updateCollectionItem("experiences", item.id, "company", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Role
                    <input
                      value={item.role}
                      onChange={(event) =>
                        updateCollectionItem("experiences", item.id, "role", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Location
                    <input
                      value={item.location}
                      onChange={(event) =>
                        updateCollectionItem("experiences", item.id, "location", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Technologies
                    <input
                      value={item.technologies}
                      onChange={(event) =>
                        updateCollectionItem("experiences", item.id, "technologies", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Start Date
                    <input
                      type="month"
                      value={item.startDate}
                      onChange={(event) =>
                        updateCollectionItem("experiences", item.id, "startDate", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    End Date
                    <input
                      type="month"
                      value={item.endDate}
                      disabled={item.current}
                      onChange={(event) =>
                        updateCollectionItem("experiences", item.id, "endDate", event.target.value)
                      }
                    />
                  </label>
                </div>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={item.current}
                    onChange={(event) =>
                      updateCollectionItem("experiences", item.id, "current", event.target.checked)
                    }
                  />
                  Current role
                </label>
                <label className="full-width">
                  Achievements
                  <textarea
                    value={item.bullets}
                    onChange={(event) =>
                      updateCollectionItem("experiences", item.id, "bullets", event.target.value)
                    }
                    placeholder="One bullet per line"
                    rows={5}
                  />
                </label>
                <div className="ai-tool-row" aria-label={`Improve bullets for ${item.role || `role ${index + 1}`}`}>
                  <span>AI bullet tools</span>
                  {BULLET_IMPROVE_MODES.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className="mini-button"
                      onClick={() =>
                        handleImproveExperienceBullets(item.id, mode, {
                          title: item.role,
                          company: item.company,
                          bullets: item.bullets
                        })
                      }
                      disabled={busyAction !== null}
                    >
                      {busyAction === `improve-${item.id}-${mode}` ? "Working..." : bulletImproveLabels[mode]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Education</p>
                <h3>Academic Background</h3>
              </div>
              <button type="button" className="ghost-button" onClick={() => addCollectionItem("education")}>
                Add entry
              </button>
            </div>

            {formData.education.map((item, index) => (
              <div key={item.id} className="repeatable-card">
                <div className="repeatable-header">
                  <span>Education {index + 1}</span>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => removeCollectionItem("education", item.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="field-grid two-up">
                  <label>
                    School
                    <input
                      value={item.school}
                      onChange={(event) =>
                        updateCollectionItem("education", item.id, "school", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Degree
                    <input
                      value={item.degree}
                      onChange={(event) =>
                        updateCollectionItem("education", item.id, "degree", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Location
                    <input
                      value={item.location}
                      onChange={(event) =>
                        updateCollectionItem("education", item.id, "location", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Start Date
                    <input
                      type="month"
                      value={item.startDate}
                      onChange={(event) =>
                        updateCollectionItem("education", item.id, "startDate", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    End Date
                    <input
                      type="month"
                      value={item.endDate}
                      onChange={(event) =>
                        updateCollectionItem("education", item.id, "endDate", event.target.value)
                      }
                    />
                  </label>
                </div>
                <label className="full-width">
                  Details
                  <textarea
                    value={item.details}
                    onChange={(event) =>
                      updateCollectionItem("education", item.id, "details", event.target.value)
                    }
                    placeholder="One point per line"
                    rows={3}
                  />
                </label>
              </div>
            ))}
          </div>

          <div className="glass-card">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Projects</p>
                <h3>Portfolio Highlights</h3>
              </div>
              <button type="button" className="ghost-button" onClick={() => addCollectionItem("projects")}>
                Add project
              </button>
            </div>

            {formData.projects.map((item, index) => (
              <div key={item.id} className="repeatable-card">
                <div className="repeatable-header">
                  <span>Project {index + 1}</span>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => removeCollectionItem("projects", item.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="field-grid two-up">
                  <label>
                    Project Name
                    <input
                      value={item.name}
                      onChange={(event) =>
                        updateCollectionItem("projects", item.id, "name", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Link
                    <input
                      value={item.link}
                      onChange={(event) =>
                        updateCollectionItem("projects", item.id, "link", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Technologies
                    <input
                      value={item.technologies}
                      onChange={(event) =>
                        updateCollectionItem("projects", item.id, "technologies", event.target.value)
                      }
                    />
                  </label>
                </div>
                <label className="full-width">
                  Description
                  <textarea
                    value={item.description}
                    onChange={(event) =>
                      updateCollectionItem("projects", item.id, "description", event.target.value)
                    }
                    rows={3}
                  />
                </label>
                <label className="full-width">
                  Impact
                  <textarea
                    value={item.impact}
                    onChange={(event) =>
                      updateCollectionItem("projects", item.id, "impact", event.target.value)
                    }
                    rows={3}
                  />
                </label>
                <div className="ai-tool-row" aria-label={`Improve project impact for ${item.name || `project ${index + 1}`}`}>
                  <span>AI impact tools</span>
                  {BULLET_IMPROVE_MODES.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className="mini-button"
                      onClick={() =>
                        handleImproveProjectImpact(item.id, mode, {
                          title: item.name,
                          impact: item.impact
                        })
                      }
                      disabled={busyAction !== null}
                    >
                      {busyAction === `improve-${item.id}-${mode}` ? "Working..." : bulletImproveLabels[mode]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="preview-panel">
          <div className="preview-header glass-card">
            <div>
              <p className="eyebrow">Live Preview</p>
              <h3>{generatedResume ? "AI-tailored resume" : "Draft resume preview"}</h3>
            </div>
            <span className="badge">{formData.template}</span>
          </div>
          <ResumePreview resume={previewResume} template={formData.template} />
        </section>

        <aside className="sidebar-panel">
          <InsightPanel
            analysis={analysis}
            coverLetter={coverLetter}
            formData={formData}
            meta={generationMode}
            onCopyCoverLetter={handleCopyCoverLetter}
          />
        </aside>
      </main>
    </div>
  );
}

export default App;
