# 01 - Engineering Principles

**Version:** 1.0.0  
**Status:** Active  
**Last Updated:** 28 June 2026  
**Audience:** Developers, AI Coding Agents

---

# Purpose

This document defines the engineering standards followed throughout the Reflect project.

Its purpose is to keep the codebase maintainable, scalable, predictable, and easy for both human developers and AI coding agents to understand.

These principles should guide every implementation decision.

---

# Engineering Philosophy

Reflect is built to last.

Code should prioritize readability, maintainability, and correctness over cleverness or premature optimization.

Future contributors should be able to understand any feature with minimal effort.

---

# Core Principles

## 1. Readability over cleverness

Write code that is easy to understand.

Avoid unnecessary abstractions.

Avoid "magic."

Prefer explicit code over clever one-liners.

Future maintainers should immediately understand the intent.

---

## 2. Single Responsibility Principle

Every file should have one clear responsibility.

Examples:

- Components render UI.
- Hooks manage client-side state.
- Services communicate with external systems.
- Types define data contracts.

Responsibilities should never overlap.

---

## 3. Feature-first organization

Related code should live together.

Instead of organizing by file type, organize around features whenever practical.

Example:

```
journal/
    components/
    hooks/
    services/
    types/
```

The goal is to reduce navigation complexity as the project grows.

---

## 4. Reuse before creating

Before introducing new code:

- Search for existing components.
- Search for existing hooks.
- Search for existing services.
- Search for existing utility functions.

Avoid duplication.

---

## 5. Explicit types

Use TypeScript intentionally.

Avoid:

- any
- unnecessary type assertions
- implicit assumptions

Types should describe reality rather than silence the compiler.

---

## 6. Keep components focused

React components should primarily render UI.

Business logic belongs inside:

- hooks
- services
- utility functions

Large components should be broken into smaller reusable pieces.

---

## 7. Build incrementally

Large features should be built in small, independently verifiable steps.

Every completed step should:

- compile
- lint
- run successfully

Avoid partially implemented systems.

---

# File Organization

The project follows a predictable folder structure.

```
src/

app/

components/

contexts/

hooks/

services/

types/

lib/

providers/

styles/
```

Each folder should have a clearly defined purpose.

Avoid creating new top-level folders unless absolutely necessary.

---

# Naming Conventions

Use descriptive names.

Prefer:

```
JournalFormModal
```

over

```
Modal
```

Prefer:

```
createJournal()
```

over

```
create()
```

Names should communicate intent without additional explanation.

---

# State Management

Prefer local component state whenever possible.

Introduce shared state only when multiple independent parts of the application genuinely require it.

Avoid unnecessary global state.

---

# Error Handling

Errors should be:

- informative
- recoverable whenever possible
- presented respectfully

Never expose raw stack traces to users.

Console logging is acceptable during development but should not become part of the user experience.

---

# Performance

Optimize only after correctness.

Prefer:

- clean code
- maintainability
- simplicity

Premature optimization should be avoided.

---

# Dependencies

Before introducing a new dependency, ask:

1. Does the project already solve this problem?
2. Can this be implemented with existing tools?
3. Is the dependency actively maintained?
4. Does it significantly improve the developer or user experience?

Dependencies should solve meaningful problems.

---

# Documentation

Complex decisions deserve documentation.

Whenever introducing:

- architecture changes
- design patterns
- AI workflows
- database changes

Update the handbook.

Documentation should evolve alongside the codebase.

---

# Definition of Done

A task is considered complete only when:

- The implementation works correctly.
- TypeScript passes.
- ESLint passes.
- The project builds successfully.
- Manual testing has been completed.
- Relevant handbook documentation has been updated.
- No placeholder or unfinished code remains.

---

# Non-Negotiable Rules

Every contribution must:

- Compile successfully.
- Pass TypeScript.
- Pass ESLint.
- Pass `npm run build`.
- Preserve existing functionality.
- Avoid duplicate implementations.
- Respect the Reflect Handbook.
- Stop and report blockers instead of guessing.

---

# Guiding Statement

> Good engineering should become invisible.

> The user should experience thoughtful reflection—not the complexity required to build it.