# 🌌 DSA-Vault

<p align="center">
  <img src="https://img.shields.io/badge/Problems%20Solved-66-blue?style=for-the-badge&logo=leetcode&logoColor=white">
  <img src="https://img.shields.io/badge/Pipeline-Active-brightgreen?style=for-the-badge">
</p>

DSA-Vault is a high-performance, automated publishing engine and educational coding notebook designed to showcase a continuous journal of software engineering problem-solving. It dynamically synchronizes solutions from a GitHub repository (`LeetCode`) and renders them in a state-of-the-art, fully searchable database portfolio.

Live Production URL: **[https://ubiquitous-dango-feef0b.netlify.app](https://ubiquitous-dango-feef0b.netlify.app)**

---

## 🌟 Key Features

* **⚡ Real-Time Synchronizer Webhook**: Instantly ingests new solution pushes from GitHub, parsing Markdown descriptions, mapping complexity difficulty, and compiling code content into a Neon PostgreSQL database.
* **🌀 Instant Next.js Cache Revalidation**: Webhook triggers automatic Next.js `revalidatePath()` calls to immediately clear page caches on ingestion, making new solutions visible instantly.
* **🎨 Premium UI/UX Design System**: High-contrast, responsive visual interface featuring custom radial gradients, glassmorphism cards, interactive difficulty indicators, and modern pill-style navigation.
* **🏷️ Smart DSA Filters**: Categorize, sort, and search problems by name, topic tags, or exact LeetCode problem numbers (supports `#` prefixes).
* **💻 Dynamic Language Support**: Automatic detection and selection tabs for C++, Java, Python, and SQL with custom server-side Shiki syntax highlighting.
* **🔍 Search Engine & AI Agent Optimization**: Embedded dynamic `@graph` schemas mapping `TechArticle` and `SoftwareSourceCode` items for Google Rich Snippet indexing and AI search agent scraping (ChatGPT/Claude bot-friendly).
* **🌓 Seamless Theme Toggling**: Class-based light and dark phase layouts configured natively with Tailwind CSS and local storage persistency.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 16 (App Router), React, Tailwind CSS, Lucide Icons, Framer Motion
* **Database & ORM**: PostgreSQL (hosted on Neon serverless), Prisma ORM
* **Authentication**: NextAuth.js with Google OAuth 2.0
* **Syntax Highlighting**: Shiki (Server-side compilation)

---

## ⚙️ Project Pipeline Ingestion Workflow

```mermaid
graph TD
    A[Push C++/Java solution files to thunderrbox/LeetCode] -->|GitHub Actions Hook| B(Webhook Post to Ingestion API)
    B -->|HMAC-SHA256 Signature Check| C[Parse Markdown descriptions and source files]
    C -->|Prisma Ingest & Upsert| D[(Neon PostgreSQL Database)]
    D -->|Instantly Trigger revalidatePath| E[Rebuild Next.js HTML Static Cache]
    E -->|Deploy Update| F[Live Site Display]
```

---

## 📦 Getting Started

### 1. Environment Variables

Create a `.env` file in the root of the project directory and configure the following variables:

```env
DATABASE_URL="postgresql://neondb_owner:...@..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-jwt-auth-secret-key"
SYNC_SECRET="your-shared-webhook-secret-hmac-key"
GITHUB_REPOSITORY="thunderrbox/LeetCode"
NEXT_PUBLIC_SITE_URL="https://ubiquitous-dango-feef0b.netlify.app"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
```

### 2. Development Setup

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Sync migrations
npx prisma db push

# Start local server
npm run dev
```

### 3. Run Test Suites

```bash
# Execute Jest unit tests
npm run test
```

---

## 🔒 Security & Operations

* **Webhook Protection**: Incoming sync requests are authenticated using HMAC-SHA256 encryption. Payloads must contain the `X-Hub-Signature-256` header signed with your shared `SYNC_SECRET` key.
* **OAuth Integrity**: Authenticated user session tokens are stored in secure HTTP-Only cookies to protect against XSS vectors.
