# Sprint 02 — Emotional Check-In

**Sprint:** 02  
**Status:** Planned  
**Priority:** High  
**Estimated Duration:** 1–2 Weeks  
**Last Updated:** 28 June 2026

---

# Objective

Transform Reflect from a journaling application into a reflection platform by introducing the Emotional Check-In experience.

This sprint establishes Reflect's emotional philosophy and creates the foundation upon which future AI features will build.

Users should feel welcomed into reflection rather than asked to classify themselves.

---

# Product Goal

Help users begin every journal with a moment of intentional self-awareness.

The Initial Check-In should feel simple, warm, and non-judgmental.

It is not intended to identify the "correct" emotion.

It simply captures where the user believes they are emotionally as they begin writing.

---

# Product Question

> Can users comfortably express where they are emotionally without feeling judged?

---

# Features

## Feature 1 — Initial Check-In

**Status:** Not Started

Replace the existing Mood field with the new Initial Check-In experience.

Requirements:

- Presented before writing begins.
- Optional rather than mandatory.
- Simple and welcoming.
- Never framed as a psychological assessment.

---

## Feature 2 — Emotion Chips

**Status:** Not Started

Replace dropdown selection with emotion chips.

Each chip should contain:

- Emoji
- Emotion label

Example:

😊 Joy

😌 Peace

😟 Anxiety

❤️ Gratitude

Users should be able to select only one starting emotion.

---

## Feature 3 — Gentle Guidance

**Status:** Not Started

Add supporting copy explaining the purpose of the Initial Check-In.

Example:

> Choose the feeling that feels closest to where you're starting today.

> Your journal matters more than choosing the "perfect" emotion.

The wording should reduce hesitation rather than increase it.

---

## Feature 4 — Updated Journal Data Model

**Status:** Not Started

Rename the existing mood field to:

initialCheckIn

The new data model should support future AI reflections without requiring additional migrations.

---

## Feature 5 — Emotional Metadata Foundation

**Status:** Not Started

Prepare the journal model for future AI processing.

Add placeholders (nullable/optional) for:

- aiReflection
- primaryEmotion
- secondaryEmotion
- tertiaryEmotion
- emotionalShift
- themes
- processedAt

These fields should remain unused until Sprint 03.

---

## Feature 6 — UI Refinements

**Status:** Not Started

Improve the writing flow around the Initial Check-In.

Examples:

- Better spacing
- Softer visual hierarchy
- Responsive chip layout
- Improved accessibility
- Keyboard navigation

---

# Success Criteria

Sprint 02 is complete when:

- Mood has been replaced by Initial Check-In.
- Emotion chips are fully implemented.
- The journal model supports future AI fields.
- Existing CRUD functionality continues working.
- Users understand that emotions are suggestions rather than labels.
- The experience feels calm and welcoming.

---

# Out of Scope

This sprint intentionally excludes:

- AI Reflection
- Gemini Integration
- Emotion Detection
- Journal Analysis
- Reflection Cards
- Insights
- Long-term Memory

Those belong to Sprint 03 and beyond.

---

# Risks

Potential challenges include:

- Choosing emotion labels that feel universally understandable.
- Preventing users from feeling pressured to choose an emotion.
- Designing the UI without adding unnecessary cognitive load.

---

# Dependencies

Requires:

- Completed Sprint 01
- Existing Journal CRUD
- Existing Firestore Integration

No AI infrastructure is required yet.

---

# Definition of Done

Every feature must:

- Follow the Reflect Handbook.
- Pass TypeScript.
- Pass ESLint.
- Pass `npm run build`.
- Be manually tested.
- Remain responsive.
- Preserve accessibility.
- Match Reflect's emotional philosophy.

---

# Progress

| Feature | Status |
|----------|--------|
| Initial Check-In | ⬜ |
| Emotion Chips | ⬜ |
| Guidance Text | ⬜ |
| Data Model Update | ⬜ |
| AI Metadata Foundation | ⬜ |
| UI Refinements | ⬜ |

---

# Lessons Learned

_To be completed during the sprint._

---

# Known Issues

_To be updated if issues are discovered._

---

# Sprint Review

_To be completed after Sprint 02 finishes._

Questions to answer:

- Did users understand the Initial Check-In?
- Did emotion chips feel more approachable than dropdowns?
- Did the new language reduce decision anxiety?
- Is the data model ready for AI?
- What should be improved before introducing AI?

---

# Next Sprint

Sprint 03 — AI Foundation

The next sprint introduces Reflect's first AI capabilities.

The user experience should remain unchanged.

AI should work quietly in the background, generating thoughtful reflections only after a journal has been saved.