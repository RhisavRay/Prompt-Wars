# Sprint 01 — Complete the Core Journaling Experience

**Sprint:** 01  
**Status:** Planned  
**Priority:** High  
**Estimated Duration:** 1–2 Weeks  
**Last Updated:** 28 June 2026

---

# Objective

Complete the core journaling experience so that Reflect becomes a polished journaling application even without AI.

At the end of this sprint, users should enjoy writing inside Reflect regardless of future AI capabilities.

This sprint focuses entirely on improving the writing experience.

---

# Product Goal

Transform the current MVP into a production-quality journaling application.

The application should feel polished, intuitive, responsive, and enjoyable to use.

---

# Features

## Feature 1 — Journal Search

**Status:** Not Started

Allow users to search journal entries by:

- Title
- Content

Search should be:

- Fast
- Case-insensitive
- Responsive

---

## Feature 2 — Journal Filters

**Status:** Not Started

Allow users to filter journals using:

- Date
- Initial Check-In (future-proof)
- Recently Updated

Filtering should work seamlessly alongside search.

---

## Feature 3 — Journal Detail View

**Status:** Not Started

Selecting a journal should open a dedicated reading page.

The reading experience should prioritize:

- Comfortable typography
- Minimal distractions
- Easy editing
- Easy deletion

---

## Feature 4 — Improved Writing Experience

**Status:** Not Started

Enhancements include:

- Better spacing
- Improved typography
- Character counter (optional)
- Better textarea behaviour
- Keyboard improvements

Writing should feel effortless.

---

## Feature 5 — Empty State Improvements

**Status:** Complete ✅

The dashboard should encourage first-time users to begin journaling.

---

## Feature 6 — Loading Experience

**Status:** Complete ✅

Skeleton loaders should replace layout shifts wherever practical.

---

# Success Criteria

Sprint 01 is complete when:

- Users can search journals.
- Users can filter journals.
- Users can comfortably read previous journals.
- The writing experience feels polished.
- Existing functionality remains intact.
- Build passes.
- Lint passes.
- Manual testing passes.

---

# Out of Scope

The following are intentionally excluded from this sprint:

- AI Reflection
- Gemini Integration
- Emotional Timeline
- Long-term Insights
- Analytics
- Notifications
- Calendar
- Mobile Application

These belong to later sprints.

---

# Risks

Potential implementation challenges:

- Efficient search as journal count grows.
- Maintaining responsive layouts.
- Avoiding duplicated filtering logic.

---

# Dependencies

Requires:

- Existing Firebase Authentication
- Existing Firestore CRUD
- Journal Service Layer

No architectural changes are expected.

---

# Definition of Done

Every feature must:

- Function correctly.
- Follow the Reflect Handbook.
- Pass TypeScript.
- Pass ESLint.
- Pass `npm run build`.
- Be manually tested.
- Match Reflect's UI/UX philosophy.

---

# Progress

| Feature | Status |
|----------|--------|
| Search | ⬜ |
| Filters | ⬜ |
| Journal Detail | ⬜ |
| Writing Improvements | ⬜ |
| Empty State | ✅ |
| Loading Experience | ✅ |

---

# Lessons Learned

_To be completed during the sprint._

---

# Known Issues

_To be updated if issues are discovered._

---

# Sprint Review

_To be completed after Sprint 01 finishes._

Questions to answer:

- What went well?
- What could be improved?
- What surprised us?
- Which engineering decisions paid off?
- Which UX decisions should evolve?

---

# Next Sprint

Sprint 02 — Emotional Check-In

The next sprint introduces Reflect's emotional philosophy into the product by replacing the traditional "Mood" concept with the new "Initial Check-In" experience.