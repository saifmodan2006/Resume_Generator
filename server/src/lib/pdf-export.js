import PDFDocument from "pdfkit";

function safeLines(lines) {
  if (!Array.isArray(lines)) {
    return [];
  }

  return lines.filter((line) => Boolean(line && String(line).trim()));
}

export function buildResumePdfBuffer(resume) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 42
    });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(22).text(resume.fullName || "", { align: "left" });
    doc.moveDown(0.15);
    doc.fontSize(12).fillColor("#444").text(resume.title || "");
    doc.moveDown(0.2);
    doc.fillColor("#333").fontSize(10).text((resume.contact || []).join(" | "));
    doc.moveDown(0.8);

    if (resume.summary) {
      doc.fontSize(12).fillColor("#111").text("Summary");
      doc.moveDown(0.2);
      doc.fontSize(10).fillColor("#333").text(resume.summary);
      doc.moveDown(0.7);
    }

    if (Array.isArray(resume.skillGroups) && resume.skillGroups.length) {
      doc.fontSize(12).fillColor("#111").text("Skills");
      doc.moveDown(0.2);
      resume.skillGroups.forEach((group) => {
        const label = group?.title || "Skills";
        const items = Array.isArray(group?.items) ? group.items.join(", ") : "";
        doc.fontSize(10).fillColor("#222").text(`${label}: ${items}`);
      });
      doc.moveDown(0.7);
    }

    if (Array.isArray(resume.experience) && resume.experience.length) {
      doc.fontSize(12).fillColor("#111").text("Experience");
      doc.moveDown(0.2);
      resume.experience.forEach((item) => {
        const heading = [item?.role, item?.company].filter(Boolean).join(" - ");
        const subline = [item?.location, item?.dates].filter(Boolean).join(" | ");

        doc.fontSize(10.5).fillColor("#111").text(heading || "Experience");
        if (subline) {
          doc.fontSize(9.5).fillColor("#555").text(subline);
        }

        safeLines(item?.bullets).forEach((bullet) => {
          doc.fontSize(10).fillColor("#333").text(`- ${bullet}`, { indent: 8 });
        });
        doc.moveDown(0.4);
      });
    }

    if (Array.isArray(resume.projects) && resume.projects.length) {
      doc.fontSize(12).fillColor("#111").text("Projects");
      doc.moveDown(0.2);
      resume.projects.forEach((project) => {
        const heading = [project?.name, project?.link].filter(Boolean).join(" | ");
        doc.fontSize(10.5).fillColor("#111").text(heading || "Project");
        safeLines(project?.bullets).forEach((bullet) => {
          doc.fontSize(10).fillColor("#333").text(`- ${bullet}`, { indent: 8 });
        });
        doc.moveDown(0.4);
      });
    }

    if (Array.isArray(resume.education) && resume.education.length) {
      doc.fontSize(12).fillColor("#111").text("Education");
      doc.moveDown(0.2);
      resume.education.forEach((item) => {
        const heading = [item?.degree, item?.school].filter(Boolean).join(" - ");
        const subline = [item?.location, item?.dates].filter(Boolean).join(" | ");
        doc.fontSize(10.5).fillColor("#111").text(heading || "Education");
        if (subline) {
          doc.fontSize(9.5).fillColor("#555").text(subline);
        }
        safeLines(item?.details).forEach((detail) => {
          doc.fontSize(10).fillColor("#333").text(`- ${detail}`, { indent: 8 });
        });
        doc.moveDown(0.4);
      });
    }

    if (Array.isArray(resume.certifications) && resume.certifications.length) {
      doc.fontSize(12).fillColor("#111").text("Certifications");
      doc.moveDown(0.2);
      safeLines(resume.certifications).forEach((cert) => {
        doc.fontSize(10).fillColor("#333").text(`- ${cert}`, { indent: 8 });
      });
    }

    doc.end();
  });
}