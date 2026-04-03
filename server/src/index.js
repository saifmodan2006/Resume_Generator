import "dotenv/config";
import express from "express";
import { join, resolve, dirname } from "node:path";
import puppeteer from "puppeteer";
import { fileURLToPath } from "node:url";
import { buildAnalysis } from "./lib/analysis.js";
import {
  buildFallbackAnalysis,
  buildFallbackCoverLetter,
  buildFallbackResume
} from "./lib/fallbacks.js";
import {
  analyzeResumeWithAI,
  generateCoverLetterWithAI,
  generateResumeWithAI
} from "./lib/openai.js";
import {
  analyzeRequestSchema,
  coverLetterRequestSchema,
  exportPdfRequestSchema,
  resumeRequestSchema
} from "./lib/schema.js";
import { renderResumeDocument } from "./templates/resume-document.js";

const app = express();
const port = Number(process.env.PORT || 5050);
const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(currentDir, "..", "..");
const clientDist = join(rootDir, "client", "dist");

function getPuppeteerLaunchOptions() {
  const isLinux = process.platform === "linux";
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;

  return {
    headless: true,
    ...(executablePath ? { executablePath } : {}),
    args: isLinux
      ? [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu"
        ]
      : []
  };
}

app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    mode: process.env.OPENAI_API_KEY ? "openai-enabled" : "demo-fallback"
  });
});

app.post("/api/generate-resume", async (request, response) => {
  try {
    const formData = resumeRequestSchema.parse(request.body);

    const aiResult = await generateResumeWithAI(formData).catch(() => null);
    const resume = aiResult?.data ?? buildFallbackResume(formData);
    const analysis = aiResult
      ? (await analyzeResumeWithAI(formData, resume).catch(() => null))?.data ?? buildAnalysis({ formData, resume })
      : buildFallbackAnalysis(formData, resume);

    response.json({
      resume,
      analysis,
      meta: {
        mode: aiResult ? "openai" : "demo",
        model: aiResult?.model || "local-fallback"
      }
    });
  } catch (error) {
    response.status(400).json({
      error: error instanceof Error ? error.message : "Unable to generate resume."
    });
  }
});

app.post("/api/analyze-resume", async (request, response) => {
  try {
    const payload = analyzeRequestSchema.parse(request.body);
    const aiResult = await analyzeResumeWithAI(
      payload.formData,
      payload.resume ?? buildFallbackResume(payload.formData)
    ).catch(() => null);

    response.json({
      analysis: aiResult?.data ?? buildAnalysis(payload),
      meta: {
        mode: aiResult ? "openai" : "demo",
        model: aiResult?.model || "local-fallback"
      }
    });
  } catch (error) {
    response.status(400).json({
      error: error instanceof Error ? error.message : "Unable to analyze resume."
    });
  }
});

app.post("/api/generate-cover-letter", async (request, response) => {
  try {
    const payload = coverLetterRequestSchema.parse(request.body);
    const resume = payload.resume ?? buildFallbackResume(payload.formData);
    const aiResult = await generateCoverLetterWithAI(payload.formData, resume).catch(() => null);

    response.json({
      coverLetter: aiResult?.data ?? buildFallbackCoverLetter(payload.formData, resume),
      meta: {
        mode: aiResult ? "openai" : "demo",
        model: aiResult?.model || "local-fallback"
      }
    });
  } catch (error) {
    response.status(400).json({
      error: error instanceof Error ? error.message : "Unable to generate cover letter."
    });
  }
});

app.post("/api/export-pdf", async (request, response) => {
  let browser;

  try {
    const payload = exportPdfRequestSchema.parse(request.body);
    const document = renderResumeDocument(payload.resume, payload.template);
    const launchOptions = getPuppeteerLaunchOptions();

    console.log("[PDF Export] Environment config", {
      NODE_ENV: process.env.NODE_ENV,
      platform: process.platform,
      PUPPETEER_CACHE_DIR: process.env.PUPPETEER_CACHE_DIR || "default",
      PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH || "none",
      launchOptions: JSON.stringify(launchOptions)
    });

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    await page.setContent(document, {
      waitUntil: "domcontentloaded"
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "18px",
        right: "18px",
        bottom: "18px",
        left: "18px"
      }
    });

    response
      .setHeader("Content-Type", "application/pdf")
      .setHeader("Content-Disposition", 'attachment; filename="resume.pdf"')
      .send(pdf);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unable to export PDF.";
    const errorOutput =
      error instanceof Error && error.stack
        ? `${error.message}\n${error.stack}`
        : errorMsg;

    console.error("[PDF Export] Error launching browser:", errorOutput);

    response.status(400).json({
      error: errorMsg
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.use(express.static(clientDist));

app.use((request, response, next) => {
  if (request.path.startsWith("/api/")) {
    next();
    return;
  }

  response.sendFile(join(clientDist, "index.html"));
});

app.listen(port, () => {
  console.log(`Resume builder server running on http://localhost:${port}`);
});
