import { GeneratedResume, TemplateName } from "../types";

interface ResumePreviewProps {
  resume: GeneratedResume;
  template: TemplateName;
}

export function ResumePreview({ resume, template }: ResumePreviewProps) {
  return (
    <article id="resume-preview-sheet" className={`resume-sheet template-${template}`}>
      <header className="resume-header">
        <div>
          <p className="resume-kicker">ATS-Ready Resume</p>
          <h1>{resume.fullName}</h1>
          <h2>{resume.title}</h2>
        </div>
        <ul className="resume-contact">
          {resume.contact.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </header>

      <section className="resume-block">
        <div className="resume-block-heading">
          <span>Summary</span>
        </div>
        <p>{resume.summary}</p>
      </section>

      <section className="resume-block">
        <div className="resume-block-heading">
          <span>Core Skills</span>
        </div>
        <div className="skill-grid">
          {resume.skillGroups.map((group) => (
            <div key={group.title} className="skill-group">
              <h3>{group.title}</h3>
              <p>{group.items.join(" • ")}</p>
            </div>
          ))}
        </div>
      </section>

      {resume.experience.length > 0 && (
        <section className="resume-block">
          <div className="resume-block-heading">
            <span>Experience</span>
          </div>
          <div className="resume-stack">
            {resume.experience.map((item) => (
              <div key={`${item.company}-${item.role}`} className="resume-entry">
                <div className="resume-entry-topline">
                  <div>
                    <h3>{item.role}</h3>
                    <p>{item.company}</p>
                  </div>
                  <div className="resume-entry-meta">
                    <span>{item.location}</span>
                    <span>{item.dates}</span>
                  </div>
                </div>
                <ul className="resume-bullets">
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {resume.projects.length > 0 && (
        <section className="resume-block">
          <div className="resume-block-heading">
            <span>Projects</span>
          </div>
          <div className="resume-stack">
            {resume.projects.map((item) => (
              <div key={item.name} className="resume-entry">
                <div className="resume-entry-topline">
                  <div>
                    <h3>{item.name}</h3>
                    {item.link && <p>{item.link}</p>}
                  </div>
                </div>
                <ul className="resume-bullets">
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {resume.education.length > 0 && (
        <section className="resume-block">
          <div className="resume-block-heading">
            <span>Education</span>
          </div>
          <div className="resume-stack">
            {resume.education.map((item) => (
              <div key={`${item.school}-${item.degree}`} className="resume-entry">
                <div className="resume-entry-topline">
                  <div>
                    <h3>{item.degree}</h3>
                    <p>{item.school}</p>
                  </div>
                  <div className="resume-entry-meta">
                    <span>{item.location}</span>
                    <span>{item.dates}</span>
                  </div>
                </div>
                {item.details.length > 0 && (
                  <ul className="resume-bullets">
                    {item.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {resume.certifications.length > 0 && (
        <section className="resume-block">
          <div className="resume-block-heading">
            <span>Certifications</span>
          </div>
          <ul className="pill-list">
            {resume.certifications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
