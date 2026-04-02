import { CoverLetterResponse, GenerationMeta, ResumeAnalysis } from "../types";

interface InsightPanelProps {
  analysis: ResumeAnalysis | null;
  coverLetter: CoverLetterResponse | null;
  meta: GenerationMeta | null;
  onCopyCoverLetter: () => Promise<void>;
}

export function InsightPanel({
  analysis,
  coverLetter,
  meta,
  onCopyCoverLetter
}: InsightPanelProps) {
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
