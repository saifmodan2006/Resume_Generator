import { CoverLetterResponse, GenerationMeta, ResumeAnalysis, ResumeFormData } from "../types";

interface InsightPanelProps {
  analysis: ResumeAnalysis | null;
  coverLetter: CoverLetterResponse | null;
  formData: ResumeFormData;
  meta: GenerationMeta | null;
  onCopyCoverLetter: () => Promise<void>;
}

const actionVerbs = [
  "built",
  "created",
  "delivered",
  "designed",
  "improved",
  "launched",
  "led",
  "optimized",
  "owned",
  "reduced",
  "scaled",
  "shipped"
];

function getQualityChecks(formData: ResumeFormData) {
  const bullets = formData.experiences.flatMap((item) =>
    item.bullets
      .split("\n")
      .map((bullet) => bullet.trim())
      .filter(Boolean)
  );
  const metricBullets = bullets.filter((bullet) => /\d/.test(bullet));
  const actionBullets = bullets.filter((bullet) =>
    actionVerbs.some((verb) => bullet.toLowerCase().startsWith(verb))
  );
  const skills = formData.skills
    .split(/[,\n]/)
    .map((skill) => skill.trim())
    .filter(Boolean);

  return [
    {
      label: "Target job added",
      passed: formData.jobDescription.trim().length > 80,
      detail: "Paste a real job description for stronger ATS matching."
    },
    {
      label: "Contact profile complete",
      passed:
        Boolean(formData.personalInfo.email.trim()) &&
        Boolean(formData.personalInfo.phone.trim()) &&
        Boolean(formData.personalInfo.linkedin.trim()),
      detail: "Add email, phone, and LinkedIn so the resume is recruiter-ready."
    },
    {
      label: "Skill depth",
      passed: skills.length >= 8,
      detail: "Add at least 8 relevant skills across tools, methods, and platforms."
    },
    {
      label: "Achievement coverage",
      passed: bullets.length >= 3,
      detail: "Add 3 or more achievement bullets across your recent roles."
    },
    {
      label: "Measurable impact",
      passed: metricBullets.length >= Math.max(1, Math.ceil(bullets.length / 3)),
      detail: "Add numbers, percentages, revenue, speed, users, or scale where true."
    },
    {
      label: "Action-led bullets",
      passed: actionBullets.length >= Math.max(1, Math.ceil(bullets.length / 2)),
      detail: "Start more bullets with verbs like Led, Built, Delivered, or Optimized."
    }
  ];
}

export function InsightPanel({
  analysis,
  coverLetter,
  formData,
  meta,
  onCopyCoverLetter
}: InsightPanelProps) {
  const qualityChecks = getQualityChecks(formData);
  const passedChecks = qualityChecks.filter((check) => check.passed).length;
  const scoreBreakdown = analysis?.scoreBreakdown;

  return (
    <div className="insight-stack">
      <section className="glass-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Generation Mode</p>
            <h3>{meta?.mode === "openai" ? "OpenAI Live" : "Demo Fallback"}</h3>
          </div>
          <span className="badge">{meta?.model || "not generated yet"}</span>
        </div>
        <p className="panel-copy">
          {meta?.mode === "openai"
            ? "Responses are coming from the OpenAI API."
            : "The app still works end-to-end without an API key by generating a structured demo resume locally."}
        </p>
      </section>

      <section className="glass-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Resume Quality</p>
            <h3>{passedChecks}/{qualityChecks.length} checks passed</h3>
          </div>
        </div>
        <div className="quality-list">
          {qualityChecks.map((check) => (
            <div key={check.label} className={check.passed ? "quality-item pass" : "quality-item warn"}>
              <span>{check.passed ? "Pass" : "Fix"}</span>
              <div>
                <strong>{check.label}</strong>
                <p>{check.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">ATS Match</p>
            <h3>{analysis ? `${analysis.matchScore}% fit score` : "No analysis yet"}</h3>
          </div>
        </div>
        {analysis ? (
          <>
            <p className="panel-copy">{analysis.roleFitSummary}</p>
            <div className="metric-grid">
              <div>
                <span>Matching Keywords</span>
                <strong>{analysis.matchingKeywords.length}</strong>
              </div>
              <div>
                <span>Missing Keywords</span>
                <strong>{analysis.missingKeywords.length}</strong>
              </div>
            </div>

            {scoreBreakdown && (
              <div className="score-stack">
                {Object.entries(scoreBreakdown).map(([label, value]) => (
                  <div key={label} className="score-row">
                    <span>{label}</span>
                    <div className="score-track">
                      <div style={{ width: `${value}%` }} />
                    </div>
                    <strong>{value}%</strong>
                  </div>
                ))}
              </div>
            )}

            <div className="chip-section">
              <p>Matching Keywords</p>
              <div className="chip-wrap">
                {analysis.matchingKeywords.map((item) => (
                  <span key={item} className="chip chip-positive">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="chip-section">
              <p>Missing Keywords</p>
              <div className="chip-wrap">
                {analysis.missingKeywords.map((item) => (
                  <span key={item} className="chip chip-warning">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {(analysis.keywordSuggestions?.length ?? 0) > 0 && (
              <div className="keyword-plan">
                <p>Where to add missing keywords</p>
                {analysis.keywordSuggestions.map((item) => (
                  <div key={`${item.keyword}-${item.section}`}>
                    <span>{item.keyword}</span>
                    <p>{item.suggestion}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="tip-list">
              {analysis.atsTips.map((tip) => (
                <p key={tip}>{tip}</p>
              ))}
            </div>
          </>
        ) : (
          <p className="panel-copy">
            Generate or analyze a resume to see keyword coverage and ATS guidance.
          </p>
        )}
      </section>

      <section className="glass-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Cover Letter</p>
            <h3>{coverLetter ? "Generated Draft" : "Not generated yet"}</h3>
          </div>
          <button type="button" className="ghost-button" onClick={onCopyCoverLetter}>
            Copy text
          </button>
        </div>
        {coverLetter ? (
          <>
            <div className="cover-letter-box">
              <pre>{coverLetter.coverLetter}</pre>
            </div>
            <div className="tip-list">
              {coverLetter.talkingPoints.map((point) => (
                <p key={point}>{point}</p>
              ))}
            </div>
          </>
        ) : (
          <p className="panel-copy">
            Generate a cover letter after filling the resume data and target job.
          </p>
        )}
      </section>
    </div>
  );
}
