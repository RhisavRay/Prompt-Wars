# Sprint 04 — Reflection Experience

**Sprint:** 04  
**Status:** Planned  
**Priority:** High  
**Estimated Duration:** 2–3 Weeks  
**Last Updated:** 30 June 2026

---

# Objective

Transform AI reflections from generated text into a meaningful experience.

Sprint 03 introduced Reflect's ability to quietly understand individual journals.

Sprint 04 focuses on how those reflections are presented, how users interact with them, and how Reflect develops a calm, trustworthy voice.

The goal is not to generate more AI.

The goal is to make AI feel more human.

---

# Product Goal

Help users feel understood without feeling analyzed.

Reflect should never sound like a therapist.

It should never sound like a chatbot.

It should sound like a thoughtful companion quietly noticing what the user may already know but hasn't yet put into words.

---

# Product Question

> Can Reflect respond in a way that feels supportive, thoughtful, and respectful?

---

# Core Principle

Reflection is a conversation.

Not an evaluation.

AI should encourage curiosity.

Never certainty.

---

# Features

## Feature 1 — Reflection Cards

**Status:** Not Started

Introduce dedicated Reflection Cards beneath completed journals.

Each card should clearly distinguish:

- User writing
- AI observations

The reflection should feel like a continuation of the journal—not a separate report.

---

## Feature 2 — Reflection Formatting

**Status:** Not Started

Improve readability of AI reflections.

Examples:

- Better typography
- Comfortable spacing
- Paragraph separation
- Gentle emphasis where appropriate

The reading experience should remain calm and distraction-free.

---

## Feature 3 — Follow-up Reflection

**Status:** Not Started

After reading an AI reflection, users may receive one thoughtful follow-up question.

Examples:

"What part of this reflection resonated with you most?"

"Is there anything you would describe differently?"

Questions should encourage continued reflection rather than requesting answers.

Users should never feel obligated to respond.

---

## Feature 4 — Reflection Regeneration

**Status:** Not Started

Allow users to regenerate an AI reflection.

Reasons may include:

- Journal edited after AI completed.
- User wants another perspective.
- AI generation previously failed.

Reflection regeneration should remain optional.

---

## Feature 5 — Reflection History

**Status:** Not Started

Store previous AI reflections.

Users should be able to revisit earlier reflections without losing history.

Future improvements may compare how AI observations evolve over time.

---

## Feature 6 — Reflection Feedback

**Status:** Not Started

Allow lightweight feedback.

Examples:

- Helpful
- Not Helpful

This feedback exists to improve future prompts—not to score users.

---

# Success Criteria

Sprint 04 is complete when:

- AI reflections feel calm and readable.
- Users understand reflections are observations rather than conclusions.
- Reflection regeneration works correctly.
- Reflection history is preserved.
- Follow-up prompts encourage curiosity.
- Feedback remains lightweight and optional.

---

# Out of Scope

This sprint intentionally excludes:

- Cross-journal insights
- Weekly summaries
- Monthly summaries
- Long-term memory
- Emotional timelines
- Growth analytics

Those belong to later sprints.

---

# Risks

Potential challenges include:

- AI sounding repetitive.
- AI becoming overly confident.
- Follow-up questions feeling intrusive.
- Reflection cards distracting from user writing.

The user's journal must always remain the primary focus.

---

# Dependencies

Requires:

- Completed Sprint 03
- Stable AI Reflection pipeline
- Reflection storage
- Firestore integration

---

# Definition of Done

Every feature must:

- Follow the Reflect Handbook.
- Follow the AI Philosophy.
- Preserve the user's ownership of their journal.
- Pass TypeScript.
- Pass ESLint.
- Pass `npm run build`.
- Be manually tested.
- Remain accessible.
- Feel emotionally supportive rather than authoritative.

---

# Progress

| Feature | Status |
|----------|--------|
| Reflection Cards | ⬜ |
| Reflection Formatting | ⬜ |
| Follow-up Reflection | ⬜ |
| Reflection Regeneration | ⬜ |
| Reflection History | ⬜ |
| Reflection Feedback | ⬜ |

---

# Lessons Learned

_To be completed during the sprint._

---

# Known Issues

_To be updated if issues are discovered._

---

# Sprint Review

_To be completed after Sprint 04 finishes._

Questions to answer:

- Did Reflect sound calm and trustworthy?
- Did reflections feel supportive rather than analytical?
- Were follow-up prompts genuinely useful?
- Did users understand that AI observations are not facts?
- What aspects of Reflect's voice should continue evolving?

---

# Next Sprint

Sprint 05 — Insights

Once Reflect can thoughtfully respond to individual journals, it can begin recognizing connections across multiple entries.

The focus shifts from understanding a single moment to helping users discover recurring themes, emotional patterns, and long-term personal growth.