# Sprint 03 — AI Foundation

**Sprint:** 03  
**Status:** Complete ✅
**Priority:** High  
**Estimated Duration:** 2–3 Weeks  
**Last Updated:** 12 July 2026

---

# Objective

Introduce artificial intelligence into Reflect without changing the core journaling experience.

The user should continue experiencing Reflect primarily as a journaling application.

AI should operate quietly in the background, generating thoughtful observations only after a journal has been saved.

This sprint establishes the AI infrastructure that every future AI capability will build upon.

---

# Product Goal

Make AI feel invisible.

The user should never wait for AI before continuing with their day.

Reflection comes first.

AI comes second.

---

# Product Question

> Can AI quietly help users without becoming the center of attention?

---

# Core Principle

The journal always belongs to the user.

AI is a guest.

It should observe respectfully, never dominate the conversation.

---

# Memory Foundation

Sprint 03 introduces Reflect's layered memory architecture.

Rather than treating every journal as an isolated event, Reflect begins maintaining an evolving understanding of the user through three complementary memory layers.

### Journal Memory

Each journal produces its own structured AI memory.

This represents the permanent understanding of that individual journal.

### Active User Memory

Reflect maintains a continuously evolving understanding of the user's current context, ongoing life events, recurring themes, communication style, and behavioural observations.

This memory changes over time and serves as the primary context for future reflections.

### Archive Memory

Older journal memories remain available for retrieval while being excluded from normal AI processing.

When an older event becomes relevant again, Reflect may recover it from the archive and reincorporate it into Active User Memory.

This architecture allows Reflect to provide increasingly personalised reflections while remaining computationally efficient.

Implementation details are governed by ADR-007.

---

# Features

## Feature 1 — Background AI Processing

**Status:** Complete ✅

After a journal is successfully saved:

- Save immediately.
- Return control to the user.
- Trigger AI processing asynchronously.

The user should never wait for AI.

---

## Feature 2 — Gemini Integration

**Status:** Complete ✅

Integrate Google's Gemini API through the service layer.

Requirements:

- Secure server-side API calls.
- Environment variable configuration.
- Robust error handling.
- Retry strategy for transient failures.
- Graceful degradation if AI is unavailable.

The journaling experience must continue even if AI fails.

---

## Feature 3 — AI Reflection Generation

**Status:** Complete ✅

Generate an AI reflection for each journal.

The reflection should include:

- Brief summary
- Primary emotion
- Secondary emotion
- Tertiary emotion
- Emotional shift
- Major themes

All language must follow the AI Philosophy document.

AI provides observations.

Never conclusions.

---

## Feature 4 — Reflection Prompt

**Status:** Complete ✅

Generate one thoughtful follow-up question.

Examples:

"What part of today surprised you?"

"You mentioned feeling overwhelmed. What do you think contributed most to that?"

Reflection prompts should invite curiosity.

They should never instruct.

---

## Feature 5 — AI Processing Status

**Status:** Complete ✅

Provide subtle feedback indicating that reflection is being prepared.

Examples:

- Reflecting...
- Preparing insights...

Avoid:

- Progress bars
- Percentages
- Long loading screens

AI should feel calm.

---

## Feature 6 — AI Memory & Reflection Storage

**Status:** Complete ✅

Store AI-generated reflection data and structured memory inside Firestore.

This includes:

- User-authored journal content.
- AI-generated reflection.
- Journal Memory.
- Active User Memory.

Journal Memory represents one journal.

Active User Memory represents Reflect's evolving understanding of the user.

Memory updates occur after every journal creation, update, and deletion.

Implementation follows ADR-006 and ADR-007.

---

## Feature 7 — AI Failure Handling

**Status:** Complete ✅

If AI processing fails:

- Journal remains saved.
- User is not interrupted.
- Failure is logged.
- Retry remains possible.

AI should never block journaling.

---

# Success Criteria

Sprint 03 is complete when:

- Journals save immediately.
- AI processes in the background.
- AI reflections appear after processing.
- User-written content remains untouched.
- AI language follows Reflect's philosophy.
- AI failures do not affect journaling.

---

# Out of Scope

This sprint intentionally excludes:

- Long-term insights
- Growth timeline
- Memory retrieval UI
- User-facing memory management
- Reflection timeline
- Analytics
- Monthly summaries
- Cross-journal insights
- Growth milestones
- Reflection cards

These belong to later sprints.

---

# Risks

Potential challenges include:

- API rate limits.
- AI latency.
- Prompt consistency.
- Hallucinations.
- Cost optimization.

All AI responses should remain lightweight and deterministic wherever practical.

---

# Dependencies

Requires:

- Completed Sprint 02.
- Initial Check-In.
- Updated journal model.
- Gemini API.
- Firestore.

---

# Definition of Done

Every feature must:

- Follow the Reflect Handbook.
- Follow the AI Philosophy.
- Pass TypeScript.
- Pass ESLint.
- Pass `npm run build`.
- Be manually tested.
- Preserve user privacy.
- Never interrupt journaling.

---

# Progress

|        Feature        | Status |
|-----------------------|--------|
| Background Processing |   ✅   |
| Gemini Integration    |   ✅   |
| AI Reflection         |   ✅   |
| Reflection Prompt     |   ✅   |
| Processing Status     |   ✅   |
| Reflection Storage    |   ✅   |
| Failure Handling      |   ✅   |

---

# Lessons Learned

_To be completed during the sprint._

---

# Known Issues

_To be updated if issues are discovered._

---

# Sprint Review

_To be completed after Sprint 03 finishes._

Questions to answer:

- Did AI remain invisible?
- Did users understand that AI reflections are suggestions?
- Did background processing improve the experience?
- Was AI fast enough without becoming intrusive?
- Is the layered memory architecture supporting high-quality reflections?
- Is Active User Memory remaining relevant without growing uncontrollably?
- Is the architecture ready for future Insights and Long-Term Companion features?

---

# Next Sprint

Sprint 04 — Reflection & Insights

With AI now generating meaningful observations for individual journals, the next sprint expands Reflect's perspective across multiple entries.

The focus shifts from understanding a single journal to helping users recognize patterns, emotional movement, and personal growth over time.