# 05 - Development Workflow

**Version:** 1.0.0  
**Status:** Active  
**Last Updated:** 28 June 2026  
**Audience:** Developers, AI Coding Agents

---

# Purpose

This document defines the standard development workflow followed throughout the Reflect project.

Its purpose is to ensure that every contribution—whether written by a human developer or an AI coding agent—is consistent, maintainable, and production-ready.

Every implementation should follow these rules unless explicitly instructed otherwise.

---

# Development Philosophy

Reflect is built through small, complete, and verifiable iterations.

Shipping a fully working small feature is always preferred over partially implementing a large one.

Every completed feature should leave the repository in a deployable state.

---

# Standard Development Process

Every task should follow this sequence:

1. Understand the task.
2. Read the relevant handbook documents.
3. Review the existing implementation.
4. Extend existing code whenever possible.
5. Implement the requested feature.
6. Verify correctness.
7. Run lint.
8. Run build.
9. Perform manual verification where appropriate.
10. Summarize changes.

---

# Read Before Coding

Before writing code:

- Understand the requested feature.
- Search for existing implementations.
- Reuse existing services.
- Reuse existing components.
- Reuse existing hooks.
- Reuse existing types.

Avoid creating duplicate implementations.

---

# Incremental Development

Features should be implemented incrementally.

Large features should be divided into independently working milestones.

Each milestone should:

- compile
- lint
- build
- remain deployable

Avoid leaving unfinished systems behind.

---

# Existing Code Takes Priority

Prefer modifying existing code over creating parallel implementations.

If an existing solution already satisfies most of the requirement, extend it rather than replacing it.

Do not rewrite working code without a clear benefit.

---

# Blockers

If a genuine blocker is encountered:

Stop.

Explain:

- what the blocker is
- why it prevents implementation
- what information is required

Do not invent placeholder implementations.

Do not redesign the architecture without approval.

---

# Documentation

Do not create documentation files unless explicitly requested.

Specifically avoid creating:

- implementation.md
- implementation-plan.md
- architecture-proposal.md
- todo.md
- migration-plan.md

The Reflect Handbook is the project's documentation.

Update handbook documents only when they become inaccurate.

---

# Scope Control

Implement only what has been requested.

Avoid:

- speculative features
- premature abstractions
- unrelated refactoring
- unnecessary optimizations

Stay focused.

---

# UI Development

When implementing UI:

- Preserve Reflect's design language.
- Follow the UI & UX Principles document.
- Support responsive layouts.
- Maintain accessibility.
- Ensure cursor behaviour is intuitive.
- Preserve smooth animations.
- Avoid visual clutter.

---

# Backend Development

When implementing backend features:

- Keep business logic inside services.
- Keep Firebase interactions centralized.
- Preserve existing authentication.
- Follow Firestore structure.
- Respect Security Rules.

Never move business logic into UI components.

---

# AI Development

When implementing AI functionality:

- Follow the AI Philosophy document.
- AI should remain asynchronous.
- AI should never interrupt writing.
- AI observations must remain suggestions—not facts.
- Respect user privacy.

---

# Code Quality

Every contribution should:

- be readable
- be maintainable
- use descriptive names
- avoid duplication
- follow existing conventions
- remain easy to review

---

# Validation Checklist

Before considering a task complete:

- TypeScript passes.
- ESLint passes.
- `npm run build` passes.
- Existing functionality remains intact.
- New functionality works correctly.
- No console errors remain.
- No unnecessary files were created.

---

# Response Format

When implementation is complete, provide:

## Summary

A brief explanation of what was implemented.

---

## Files Added

List all new files.

---

## Files Modified

List all modified files.

---

## Assumptions

Describe any reasonable assumptions made during implementation.

---

## Verification

Confirm:

- npm run lint ✅
- npm run build ✅

---

## Remaining Work

Only include this section if something could not be completed.

---

# Things Never To Do

Never:

- Duplicate services.
- Duplicate types.
- Duplicate hooks.
- Duplicate Firebase initialization.
- Break existing authentication.
- Ignore TypeScript errors.
- Ignore ESLint warnings.
- Leave placeholder implementations.
- Introduce dead code.
- Commit secrets.
- Create implementation plans unless explicitly requested.

---

# Guiding Statement

> Every commit should leave Reflect in a better state than it was found.

Small, complete improvements are more valuable than large unfinished systems.