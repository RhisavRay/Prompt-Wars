# Planning

**Version:** 1.0.0  
**Status:** Active  
**Last Updated:** 28 June 2026

---

# Purpose

This directory contains the short-term execution plan for Reflect.

Unlike the Reflect Handbook, which documents permanent philosophy and engineering standards, the planning directory focuses on what is currently being built and what is planned next.

Planning documents are expected to evolve frequently.

---

# Relationship to the Reflect Handbook

The Reflect Handbook answers:

**Why are we building Reflect?**

and

**How should Reflect be built?**

The planning directory answers:

**What are we building next?**

Every sprint should follow the principles defined inside the Reflect Handbook.

---

# Planning Structure

## Sprint Documents

Each sprint contains:

- Objective
- Planned Features
- Success Criteria
- Out of Scope
- Progress
- Lessons Learned
- Known Issues

Sprints should remain small, focused, and independently completable.

---

## Ideas

ideas.md stores unprioritized ideas.

Ideas should be captured quickly without worrying about implementation details.

Being listed here does not guarantee that a feature will ever be built.

---

## Backlog

backlog.md contains features that have already been approved for development but are not currently scheduled.

Items may move from:

Ideas

↓

Backlog

↓

Sprint

↓

Completed Product

---

# Development Philosophy

Reflect is developed through small, complete iterations.

Each sprint should leave the application in a deployable state.

Large unfinished implementations should be avoided.

---

# Sprint Completion

A sprint is considered complete when:

- Every planned feature has been implemented.
- Manual testing has been completed.
- npm run lint passes.
- npm run build passes.
- Documentation has been updated where necessary.
- Lessons learned have been recorded.

---

# Guiding Statement

> The handbook defines the destination.

> Planning defines the journey.