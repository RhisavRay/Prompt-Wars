# 08 - Architectural Decisions

**Version:** 1.0.0  
**Status:** Living Document  
**Last Updated:** 28 June 2026  
**Audience:** Developers, AI Coding Agents, Future Contributors

---

# Purpose

This document records the major architectural and product decisions made throughout Reflect's development.

Unlike implementation details, these decisions explain **why** specific approaches were chosen.

Every major architectural decision should be documented here before—or alongside—its implementation.

This document acts as the project's long-term engineering memory.

---

# Decision Format

Every decision should follow this structure:

---

## Decision

A short description of the decision.

---

### Context

What problem existed?

---

### Alternatives Considered

Which other solutions were evaluated?

---

### Decision

Which solution was selected?

---

### Reasoning

Why was this solution chosen?

---

### Consequences

What benefits and trade-offs result from this decision?

---

# ADR-001

## Project Documentation Through the Reflect Handbook

### Context

As Reflect grows, AI coding agents and future contributors require a consistent understanding of the project.

Prompting every implementation independently would eventually become inefficient and inconsistent.

### Alternatives Considered

- Large prompts for every task.
- Separate documentation files without structure.
- No formal documentation.

### Decision

Create a structured Reflect Handbook containing philosophy, engineering standards, architecture, AI principles, workflow, testing, and roadmap documentation.

### Reasoning

The handbook becomes the project's single source of truth while reducing prompt size and improving implementation consistency.

### Consequences

Benefits:

- Consistent development.
- Better onboarding.
- Reduced prompt complexity.
- Easier long-term maintenance.

Trade-offs:

- Documentation requires maintenance.

---

# ADR-002

## AI Runs After Journaling

### Context

Many AI journaling products interrupt users while they are writing.

This risks shifting attention away from reflection and toward interacting with AI.

### Alternatives Considered

- Live AI suggestions.
- AI-assisted writing.
- Chatbot-first interaction.
- Background analysis.

### Decision

AI performs analysis only after a journal has been saved.

### Reasoning

Writing should remain uninterrupted.

Reflection always comes before analysis.

### Consequences

Benefits:

- Better writing flow.
- Lower cognitive load.
- Reduced dependency on AI.
- More authentic journal entries.

Trade-offs:

- AI insights appear slightly later.

---

# ADR-003

## Initial Check-In Is Separate From AI Reflection

### Context

People rarely experience a single emotion.

An AI model may identify emotional themes that differ from the user's own perception.

### Alternatives Considered

- Single mood selection.
- Multiple mood selection.
- AI replaces user mood.
- Separate user and AI perspectives.

### Decision

Store two independent concepts:

- Initial Check-In
- AI Reflection

Neither replaces the other.

### Reasoning

The user's experience remains authoritative.

AI contributes an additional perspective rather than correcting the user.

### Consequences

Benefits:

- Greater trust.
- Reduced AI bias.
- Better emotional storytelling.
- Richer long-term insights.

Trade-offs:

- Slightly more complex data model.

---

# ADR-004

## AI Provides Observations Instead of Conclusions

### Context

Large language models are probabilistic systems.

They should not make definitive claims about a user's mental state.

### Alternatives Considered

- Confident AI statements.
- Psychological classifications.
- Observational language.

### Decision

AI always communicates uncertainty appropriately.

Examples:

"Your writing suggests..."

"It seems..."

"You may have..."

### Reasoning

This preserves user autonomy while encouraging reflection.

### Consequences

Benefits:

- Increased trust.
- Reduced risk.
- Better alignment with Reflect's philosophy.

Trade-offs:

- AI appears less authoritative.

---

# ADR-005

## Background Analysis Over Instant AI

### Context

Immediate AI responses increase waiting time and make the application feel AI-centric.

### Alternatives Considered

- Blocking analysis.
- Background analysis.

### Decision

Journal entries save immediately.

AI runs asynchronously.

### Reasoning

The primary interaction is journaling—not waiting.

### Consequences

Benefits:

- Faster experience.
- Better UX.
- Cleaner architecture.

Trade-offs:

- AI insights become available later.

---

# ADR-006

## Structured AI Responses

### Context

Sprint 03 introduces AI-generated reflections using Google Gemini.

A straightforward implementation would allow the model to return free-form Markdown or plain text. While simple, this approach makes it difficult to reliably store, validate, evolve, and reuse AI outputs throughout future sprints.

Later roadmap features—including Reflection Cards, Insights, Long-Term Memory, and Growth Stories—require individual pieces of AI output rather than one block of generated text.

### Alternatives Considered

- Free-form Markdown responses.
- Plain text responses.
- Structured JSON responses.

### Decision

Gemini will return a structured JSON object that follows a predefined schema.

The application will validate the response before storing it in Firestore.

User-facing content will be rendered from the structured data rather than directly displaying raw model output.

### Reasoning

Structured responses provide a stable contract between the AI model and the application.

This approach improves validation, reduces parsing errors, and allows future features to reuse individual AI-generated fields without relying on fragile text processing.

It also makes prompt iteration safer because the overall data contract remains stable even as wording evolves.

### Consequences

Benefits:

- Predictable AI responses.
- Easier validation.
- Easier Firestore storage.
- Cleaner UI rendering.
- Better long-term maintainability.
- Supports future Insight and Memory features.
- Simplifies prompt evolution.

Trade-offs:

- Slightly more complex prompting.
- Requires response validation before persistence.

---

# ADR-007

## Layered Memory Architecture

### Context

As Reflect evolves beyond individual journal reflections, the AI requires long-term context in order to generate thoughtful, personalized observations.

A naïve implementation would require the AI to repeatedly analyze every historical journal whenever new reflections are generated. While technically possible, this approach becomes increasingly expensive, slower, and less scalable as a user's journal history grows.

Furthermore, not every past journal remains equally relevant over time. Reflect should remember what matters while allowing less relevant context to naturally fade into the background.

### Alternatives Considered

- Reprocess every journal for every AI request.
- Store only individual journal summaries.
- Maintain one continually rewritten user summary.
- Introduce a layered memory architecture.

### Decision

Reflect will maintain multiple layers of AI memory, each serving a different purpose.

---

### Layer 1 — Journal Memory

Every journal generates its own structured AI memory object.

Journal Memory is immutable. Once generated, it represents Reflect's understanding of that journal at the time it was written. Future changes in the user's life do not alter historical Journal Memories.

It may include:

- Journal summary
- Reflection
- Themes
- Emotional observations
- Noteworthy events
- People mentioned
- Context extracted from the journal

Journal Memory serves as the permanent historical record for that individual entry.

---

### Layer 2 — Active User Memory

Reflect maintains a continuously evolving memory describing its current understanding of the user.

Unlike Journal Memory, this document changes over time.

Its purpose is not to remember everything.

Its purpose is to maintain useful context for future reflections.

Examples include:

- Current life events
- Ongoing challenges
- Active goals
- Important relationships
- Recurring themes
- Helpful routines
- Behavioural observations
- Communication style

This memory should prioritise relevance over completeness.

---

### Layer 3 — Archive Memory

Older Journal Memory objects should transition into an archival layer.

Archived memories remain available for retrieval but are excluded from normal AI processing.

When future journals reference older events, Reflect may search archived memories to recover relevant context before updating Active User Memory.

This preserves historical continuity without requiring every journal to remain part of the active working context.

---

### Memory Evolution

After every journal is:

- Created
- Updated
- Deleted

Reflect performs a memory update.

During this process the AI determines:

- What information remains important.
- What information has become outdated.
- Which life events continue to influence the user.
- Which observations should fade from Active User Memory.
- Which archived memories should be resurfaced.

Memory should evolve gradually rather than being rewritten from scratch.

---

### Behaviour Over Labels

Reflect should store observations rather than permanent personality labels.

Preferred examples:

- "Often approaches uncertainty with curiosity."
- "Frequently reflects before making important decisions."
- "Family appears to be an important source of support."

Avoid examples such as:

- "The user is optimistic."
- "The user is anxious."
- "The user is an introvert."

Observations remain open to change.

Labels imply certainty that Reflect should never claim.

---

### Learning Before Remembering

During a user's early journaling history, Reflect should prioritise building an understanding of the user's communication style, recurring concerns, and reflective patterns.

As confidence in this understanding increases, memory updates gradually shift toward maintaining context and recognising meaningful long-term changes.

The transition should be based on confidence rather than a fixed journal count.

---

### Importance-Based Memory

Not every event deserves equal attention.

Reflect should evaluate the significance of newly discovered information.

Important events should remain in Active User Memory.

Minor or outdated information should gradually fade while remaining recoverable through Archive Memory when necessary.

Memory should behave more like human recollection than permanent storage.

---

### Facts vs. Observations

Reflect distinguishes between stable facts and evolving observations.

Examples of stable facts include:

- Family members
- Occupation
- Long-term projects
- Significant life milestones

Examples of observations include:

- Current emotional patterns
- Recurring themes
- Decision-making tendencies
- Ongoing concerns

Facts should remain stable unless explicitly changed by the user.

Observations should evolve naturally as new journals are written.

### Reasoning

Layered memory allows Reflect to provide increasingly personal reflections without repeatedly processing an ever-growing journal history.

Separating Journal Memory from Active User Memory also creates a stable foundation for future capabilities including:

- Reflection continuity
- Cross-journal insights
- Long-term pattern recognition
- Memory retrieval
- Growth stories
- Personal milestones

This architecture keeps AI context relevant while remaining computationally efficient.

### Consequences

Benefits:

- Faster AI processing.
- Lower token usage.
- Better scalability.
- More personalised reflections.
- Cleaner separation between historical records and active context.
- Natural support for future Insight and Long-Term Companion features.
- Memory evolves organically rather than growing indefinitely.

Trade-offs:

- More complex memory management.
- Additional validation logic.
- Requires careful prompt design to prevent unwanted memory drift.

---

### Future Considerations

Future improvements may include:

- Memory confidence scoring.
- Confidence-weighted observations.
- Automatic archival strategies.
- User-visible memory management.
- Manual correction of AI memories.
- Memory versioning.
- Retrieval optimisation.

These enhancements build upon the layered memory architecture established by this decision without altering its fundamental principles.

---

# Future Decisions

Examples of future ADRs include:

- Why Gemini was selected.
- Why Firestore was selected.
- Search architecture.
- Memory architecture.
- Offline synchronization.
- Encryption strategy.
- Mobile architecture.

Every significant architectural decision should be documented here.

---

# Guiding Statement

> Architecture should preserve reasoning, not just implementation.

Future contributors should understand not only what Reflect does—but why those decisions were made.