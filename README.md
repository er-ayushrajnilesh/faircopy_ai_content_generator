# Faircopy — AI Content Generation Tool

A full-stack app that turns a short prompt into a complete, ready-to-use draft — blog posts, emails, ads, cover letters, and more — streamed live as it's written. Built with a React (Vite + Tailwind) frontend, an Express backend, and Google's Gemini API. No accounts, no database, no subscriptions, no cost — runs entirely on Gemini's free tier.

```
Prompt → content type, tone, length → Generate → live-streamed draft → copy / download
```

## Features

- 10 content types (blog post, email, resume summary, cover letter, product description, advertisement, social caption, story, essay, text summary)
- 7 tones × 3 lengths
- Responses stream token-by-token instead of waiting for the full reply
- Copy, clear, regenerate, and download as `.txt` or `.pdf` — all client-side, no extra API calls
- Friendly error handling for empty prompts, network failures, timeouts, and AI service outages
- Responsive from mobile to desktop
- Backend-only API key — nothing secret ever reaches the browser
- Single Docker image, ready for AWS App Runner (or any container host)

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router |
| Backend | Node.js, Express 5 |
| AI | Google Gemini API (`@google/genai` SDK), free tier — streamed via Server-Sent Events |
| Containerization | Docker (multi-stage build) |
| Deployment target | AWS App Runner |

## Project structure

```
ai-content-generator/
├── client/                 React frontend (Vite)
│   └── src/
│       ├── components/     layout/, landing/, generator/
│       ├── pages/          Home.jsx, Generator.jsx
│       ├── hooks/          useContentGeneration.js
│       ├── services/       api.js (SSE client)
│       ├── constants/      options.js (content types / tones / lengths)
│       └── utils/          clipboard.js, download.js
├── server/                 Express backend
│   ├── routes/             generateRoutes.js, healthRoutes.js
│   ├── controllers/        generateController.js (SSE response)
│   ├── services/           geminiService.js
│   ├── middleware/         validateRequest.js, errorHandler.js, requestLogger.js
│   ├── utils/               promptBuilder.js, AppError.js
│   └── config/              index.js, corsOptions.js
├── Dockerfile               builds client + server into one image
└── README.md
```

## Prerequisites

- Node.js **22+** and npm
- An [API key from Google AI Studio](https://aistudio.google.com/apikey) — free, no billing or credit card required
- Docker, only if you plan to build/run the container

> **No `package-lock.json` is included.** This project was put together in an environment without npm registry access, so the lockfiles couldn't be generated and verified here. The first `npm install` in each of `client/` and `server/` will create one — commit it afterward for reproducible installs.

## Local development

Run the backend and frontend in two terminals.

**1. Backend**

```bash
cd server
cp .env.example .env
# then edit .env and set GEMINI_API_KEY
npm install
npm run dev          # starts on http://localhost:3000
```

**2. Frontend**

```bash
cd client
npm install
npm run dev           # starts on http://localhost:5173
```

Open `http://localhost:5173`. The Vite dev server proxies `/api/*` requests to the backend on port 3000 (see `client/vite.config.js`), so there's nothing else to configure and no CORS setup needed in development.

## Environment variables

Set these in `server/.env` for local development, or pass them to `docker run` / your host's environment configuration in production.

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | — | Your free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey). Requests fail with a clear error until this is set. |
| `GEMINI_MODEL` | No | `gemini-3.6-flash` | Any Gemini Developer API model. This default is Google's current Flash-tier workhorse model; newly-created API keys are blocked from the older `gemini-2.5` family, so a `gemini-3.x` model is required. `gemini-3.5-flash-lite` is fastest/cheapest. |
| `GEMINI_TIMEOUT_MS` | No | `60000` | How long to wait on the AI service before giving up. |
| `PORT` | No | `3000` | Port the Express server listens on. |
| `NODE_ENV` | No | `development` | Set to `production` by the Dockerfile. |
| `ALLOWED_ORIGINS` | No | *(empty)* | Comma-separated extra origins allowed to call the API cross-origin. Not needed for the default same-origin deployment. |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | No | `300000` / `30` | Basic per-IP rate limiting on `/api/generate`, since there's no auth layer in front of it. |
| `PROMPT_MAX_LENGTH` | No | `4000` | Maximum accepted prompt length, in characters. |

The client also reads two optional variables from `client/.env` — see `client/.env.example`. Neither is needed for the default setup.

## API

### `POST /api/generate`

**Request body**

```json
{
  "prompt": "Benefits of AI in education",
  "type": "Blog Post",
  "tone": "Professional",
  "length": "Medium"
}
```

`type` must be one of the content types, `tone` one of the tones, and `length` one of `Short` / `Medium` / `Long` — see `server/utils/promptBuilder.js` for the exact lists.

**Response**

A validation failure (empty prompt, unknown type/tone/length, or a misconfigured server) returns a normal JSON error before any AI call is made:

```json
{ "message": "Please enter a prompt before generating.", "code": "EMPTY_PROMPT" }
```

A valid request returns `200` with `Content-Type: text/event-stream` and streams newline-delimited SSE frames as plain text is generated:

```
data: {"type":"chunk","content":"AI is "}

data: {"type":"chunk","content":"reshaping how students learn..."}

data: {"type":"done"}
```

If generation fails after streaming has started (the only point at which the HTTP status can no longer change), the stream ends with an error frame instead:

```
data: {"type":"error","message":"The AI service is temporarily unavailable. Please try again shortly."}
```

### `GET /api/health`

Returns `{ "status": "ok", "aiConfigured": true, "uptimeSeconds": 42 }`. Used by the Docker `HEALTHCHECK` and works well as an AWS App Runner health check path too.

## Docker

Build and run the whole app — frontend build included — as a single container:

```bash
docker build -t ai-content-generator .
docker run --rm -p 3000:3000 --env-file .env ai-content-generator
```

(`cp .env.example .env` at the project root first, and set `GEMINI_API_KEY`.) Open `http://localhost:3000` — the same Express server now serves both the built React app and the `/api` routes.

## Deploying to AWS App Runner

These are the general steps; consult the current [App Runner console](https://console.aws.amazon.com/apprunner) for exact screens, since AWS updates its UI more often than its underlying concepts.

1. **Push the image to Amazon ECR:**
   ```bash
   aws ecr create-repository --repository-name ai-content-generator
   aws ecr get-login-password | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
   docker tag ai-content-generator:latest <account-id>.dkr.ecr.<region>.amazonaws.com/ai-content-generator:latest
   docker push <account-id>.dkr.ecr.<region>.amazonaws.com/ai-content-generator:latest
   ```
2. **Create an App Runner service** from that ECR image.
3. Set **port 3000** as the service port.
4. Add `GEMINI_API_KEY` (and any other variables you want to override) under the service's environment variables — App Runner stores and injects these securely at runtime, so no secret ever needs to live in the image.
5. Set the health check path to `/api/health`.
6. Deploy. App Runner provisions a public HTTPS URL automatically.

## Security notes

- The Gemini API key lives only in the server's environment and is never sent to the client.
- `/api/generate` is rate-limited per IP, since there's no authentication layer in front of it (by design — see "Out of scope" below). This also helps stay within Gemini's free-tier request limits.
- CORS is locked to an explicit allowlist; in production the frontend and API share an origin, so no cross-origin requests are needed at all.
- Errors are translated into generic, friendly messages before reaching the client; the original error (with stack trace) is logged server-side only.
- Gemini's free tier has a daily/per-minute request limit (it varies by model and changes over time — check [ai.google.dev/gemini-api/docs/rate-limits](https://ai.google.dev/gemini-api/docs/rate-limits) for current numbers). Hitting it returns a friendly "please wait a bit" message rather than a crash.

## Out of scope

Deliberately not included, to keep this a focused, single-purpose tool: user accounts and authentication, a database, generation history, team features, image or voice generation, and offline support. The modular structure (routes → middleware → controllers → services) leaves room to add any of these later without a rewrite.
