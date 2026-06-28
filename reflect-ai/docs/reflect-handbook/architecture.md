# Architecture Decision Record (ADR) — Project Foundation & Infrastructure

This document serves as the architectural reference for project **Reflect** (temporary codename). It details the architectural decisions, tech stack selections, folder layout conventions, and development guidelines.

---

## 1. Chosen Tech Stack

*   **Framework**: Next.js 16 (App Router) — Leverages React Server Components (RSC) for performance, streaming, server actions, and search engine optimization.
*   **Language**: TypeScript — Strict type checking with no `any` parameters.
*   **Styling**: Tailwind CSS v4 — Inline responsive style utility classes for rapid UI prototyping.
*   **UI Library**: shadcn/ui — Reusable unstyled components built with Radix UI and Tailwind CSS.
*   **Forms**: React Hook Form — Lightweight form handling.
*   **Validation**: Zod — Declarative runtime schema validation matching TypeScript types.
*   **Animations**: Framer Motion — Smooth micro-animations, transitions, and hover effects for premium feel.
*   **Authentication & Database**: Firebase (Client SDK) — Configured authentication (Google/Email) and Firestore (NoSQL database) for mental wellness data.
*   **AI Engine**: Google Gen AI SDK (`@google/genai`) — Integrates Gemini models for wellness pattern detection and reflection helpers.

---

## 2. Project Structure

The project conforms to a clean `src/` directory model. All development code resides inside `src/` to isolate application files from configuration overhead.

```
reflect-ai/
├── docs/                      # Architectural Decision Records (ADRs)
│   └── architecture.md
├── src/
│   ├── app/                   # Next.js App Router (Layouts, Pages, Error boundaries, Loaders)
│   ├── components/            # Shared, reusable UI elements
│   │   ├── layout/            # Common layouts (Header, PageContainer)
│   │   └── ui/                # shadcn/ui components (Button, Cards, etc.)
│   ├── constants/             # Application-wide constants (Routes, app limits, configurations)
│   ├── contexts/              # React Context skeletons (e.g. AuthContext)
│   ├── features/              # Feature modules (Journaling, Dashboard, Mood Tracking)
│   ├── hooks/                 # Reusable custom hooks
│   ├── lib/                   # Integrations and utilities configured by shadcn or standard tools (e.g., utils.ts)
│   ├── providers/             # React Provider wrappers (Minimal Providers)
│   ├── services/              # External services configuration (Firebase client setup, Gemini structure)
│   ├── types/                 # Custom TypeScript definitions
│   └── utils/                 # General-purpose utility helpers
├── public/                    # Static assets
├── .env.example               # Documentation of required secrets
├── package.json
└── README.md
```

---

## 3. Deployment Strategy

*   **Hosting Provider**: Vercel.
*   **Integration**: Direct GitHub repository hook triggering automatic preview builds on PRs and production deployments on `main` branch merges.
*   **Secrets Management**: Secrets (Firebase credentials, Gemini keys) must reside exclusively in environment variables and set via the Vercel Dashboard. Absolutely no hardcoded API keys are permitted.
*   **Routing**: Native Next.js 15 App Router.

---

## 4. Firebase Choice

*   **Purpose**: Handle user accounts and cloud storage.
*   **Implementation**: Firebase Client SDK is initialized on the client side. Authentication flow and database logic are isolated in the `src/services/` and `src/contexts/` directory.
*   **Decoupling**: No direct inline Firebase calls in UI components. Future service wrappers will intermediate all Firebase read/write tasks.

---

## 5. Gemini Choice

*   **Purpose**: Enable mental wellness analysis, mood tracking patterns, and reflective suggestions.
*   **Implementation**: Client initialization and prompting logic are deferred to a later phase. A placeholder folder structure is created under `src/services/` to prevent directory layout changes.

---

## 6. Coding Conventions

*   **Type Safety**: Mandatory TypeScript typing. Avoid `any` under all circumstances. Define interfaces/types in `src/types/`.
*   **Component Structure**: Use Server Components by default. Add `'use client'` only when hook usage (e.g., `useState`, `useEffect`, `useForm`) or event listeners are required.
*   **Aesthetics**: Follow the modern mental wellness design framework. Soft pastel colors, ample margins (generous whitespace), simple typographic hierarchies, and subtle hover animations.
*   **Naming Conventions**:
    *   Components: PascalCase (e.g., `PageContainer.tsx`, `Header.tsx`).
    *   Hooks: camelCase starting with `use` (e.g., `useAuth.ts`).
    *   Utilities / Services: camelCase or kebab-case.
