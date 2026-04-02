# AI Resume Builder

An end-to-end resume builder that turns user experience into ATS-friendly resumes, cover letters, and printable PDFs.

## Stack

- React + Vite
- Node.js + Express
- OpenAI API with a local fallback mode
- Puppeteer PDF export

## Features

- Tailored AI resume generation from work history and a target job description
- ATS match analysis with keyword coverage, missing terms, and optimization tips
- Cover letter generation from the same source data
- Live resume preview with three visual templates
- Local draft persistence in the browser
- PDF export through Puppeteer
- Demo fallback mode when `OPENAI_API_KEY` is not configured

## Run

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and add your OpenAI key if you want live model generation.

3. Start the app:

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5050`

## Production Build

```bash
npm run build
npm start
```

The backend serves the Vite build from `client/dist` in production.
