function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const templateStyles = {
  aurora: {
    accent: "#2764e0",
    background: "#ffffff",
    heading: "#0f2035"
  },
  graphite: {
    accent: "#1f3b35",
    background: "#ffffff",
    heading: "#13202f"
  },
  linen: {
    accent: "#9d5d28",
    background: "#fffdfa",
    heading: "#332015"
  }
};

const renderList = (items) =>
  items.length
    ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : "";

export function renderResumeDocument(resume, template) {
  const theme = templateStyles[template] ?? templateStyles.aurora;

  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(resume.fullName)} Resume</title>
      <style>
        :root {
          --accent: ${theme.accent};
          --heading: ${theme.heading};
          --background: ${theme.background};
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background: var(--background);
          color: #1b2633;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .page {
          padding: 28px 34px 32px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          padding-bottom: 18px;
          border-bottom: 2px solid rgba(0, 0, 0, 0.08);
        }

        h1 {
          margin: 0 0 4px;
          font-size: 30px;
          color: var(--heading);
        }

        h2 {
          margin: 0;
          font-size: 15px;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        h3 {
          margin: 0;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent);
        }

        .contact {
          list-style: none;
          margin: 0;
          padding: 0;
          font-size: 11px;
          text-align: right;
          line-height: 1.55;
        }

        section {
          margin-top: 18px;
        }

        p {
          margin: 8px 0 0;
          line-height: 1.5;
          font-size: 12px;
        }

        .skills {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .skill-group {
          border: 1px solid rgba(0, 0, 0, 0.07);
          border-radius: 12px;
          padding: 10px 12px;
          background: rgba(39, 100, 224, 0.03);
        }

        .entry {
          margin-top: 12px;
        }

        .entry-top {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          font-size: 12px;
        }

        .entry-role {
          font-weight: 700;
          color: var(--heading);
        }

        .entry-company {
          margin-top: 2px;
          color: #425163;
        }

        .meta {
          text-align: right;
          color: #566373;
        }

        ul {
          margin: 7px 0 0;
          padding-left: 18px;
        }

        li {
          margin-top: 4px;
          line-height: 1.45;
          font-size: 12px;
        }

        .pills {
          padding-left: 18px;
          columns: 2;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <header class="header">
          <div>
            <h1>${escapeHtml(resume.fullName)}</h1>
            <h2>${escapeHtml(resume.title)}</h2>
          </div>
          <ul class="contact">
            ${resume.contact.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </header>

        <section>
          <h3>Summary</h3>
          <p>${escapeHtml(resume.summary)}</p>
        </section>

        <section>
          <h3>Core Skills</h3>
          <div class="skills">
            ${resume.skillGroups
              .map(
                (group) => `
                  <div class="skill-group">
                    <strong>${escapeHtml(group.title)}</strong>
                    <p>${escapeHtml(group.items.join(" • "))}</p>
                  </div>
                `
              )
              .join("")}
          </div>
        </section>

        ${
          resume.experience.length
            ? `<section>
                <h3>Experience</h3>
                ${resume.experience
                  .map(
                    (item) => `
                      <div class="entry">
                        <div class="entry-top">
                          <div>
                            <div class="entry-role">${escapeHtml(item.role)}</div>
                            <div class="entry-company">${escapeHtml(item.company)}</div>
                          </div>
                          <div class="meta">
                            <div>${escapeHtml(item.location)}</div>
                            <div>${escapeHtml(item.dates)}</div>
                          </div>
                        </div>
                        ${renderList(item.bullets)}
                      </div>
                    `
                  )
                  .join("")}
              </section>`
            : ""
        }

        ${
          resume.projects.length
            ? `<section>
                <h3>Projects</h3>
                ${resume.projects
                  .map(
                    (item) => `
                      <div class="entry">
                        <div class="entry-top">
                          <div>
                            <div class="entry-role">${escapeHtml(item.name)}</div>
                            <div class="entry-company">${escapeHtml(item.link)}</div>
                          </div>
                        </div>
                        ${renderList(item.bullets)}
                      </div>
                    `
                  )
                  .join("")}
              </section>`
            : ""
        }

        ${
          resume.education.length
            ? `<section>
                <h3>Education</h3>
                ${resume.education
                  .map(
                    (item) => `
                      <div class="entry">
                        <div class="entry-top">
                          <div>
                            <div class="entry-role">${escapeHtml(item.degree)}</div>
                            <div class="entry-company">${escapeHtml(item.school)}</div>
                          </div>
                          <div class="meta">
                            <div>${escapeHtml(item.location)}</div>
                            <div>${escapeHtml(item.dates)}</div>
                          </div>
                        </div>
                        ${renderList(item.details)}
                      </div>
                    `
                  )
                  .join("")}
              </section>`
            : ""
        }

        ${
          resume.certifications.length
            ? `<section>
                <h3>Certifications</h3>
                <ul class="pills">
                  ${resume.certifications.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                </ul>
              </section>`
            : ""
        }
      </div>
    </body>
  </html>`;
}
