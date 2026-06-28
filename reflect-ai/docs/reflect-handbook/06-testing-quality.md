# 06 - Testing & Quality

**Version:** 1.0.0  
**Status:** Active  
**Last Updated:** 28 June 2026  
**Audience:** Developers, AI Coding Agents

---

# Purpose

This document defines the quality standards required before any contribution to Reflect is considered complete.

Passing a build is not enough.

Every feature must also provide a polished, intuitive, and reliable user experience.

Quality is everyone's responsibility.

---

# Philosophy

A feature is complete only when:

- It works correctly.
- It is pleasant to use.
- It follows Reflect's design philosophy.
- It introduces no regressions.

Reflect values quality over speed.

Shipping fewer, polished features is preferred over shipping many unfinished ones.

---

# Levels of Testing

Every implementation should be verified at four levels:

1. Static Analysis
2. Functional Testing
3. UX Testing
4. Regression Testing

---

# Static Analysis

Every implementation must successfully pass:

```bash
npm run lint
```

There should be:

- No ESLint errors.
- No ESLint warnings.

Warnings should be treated as issues to fix whenever practical.

---

## Build Verification

Every implementation must successfully pass:

```bash
npm run build
```

Requirements:

- TypeScript passes.
- Production build succeeds.
- No build warnings caused by the implementation.

Reflect should remain deployable after every completed task.

---

# Functional Testing

Verify the feature behaves exactly as intended.

Examples:

- Buttons perform the correct action.
- Forms submit correctly.
- Validation works.
- Firestore updates correctly.
- Authentication remains functional.
- Error handling works.

Happy paths and expected failure paths should both be tested.

---

# UX Testing

Every feature should be tested from the perspective of a real user.

Ask:

- Does this interaction feel natural?
- Does anything feel confusing?
- Are unnecessary clicks required?
- Is the interface calm?
- Does the feature align with Reflect's philosophy?

If something feels awkward, investigate it before shipping.

---

# Manual Testing Checklist

Whenever possible, manually verify:

- Create
- Read
- Update
- Delete

Refresh the page.

Verify persistence.

Open DevTools.

Check for console errors.

Resize the browser.

Test:

- Desktop
- Tablet
- Mobile

Navigate using only the keyboard.

Verify:

- Focus states
- Escape key
- Enter key
- Tab order

---

# Accessibility Checklist

Every new feature should support:

- Keyboard navigation
- Screen readers
- Visible focus indicators
- Appropriate cursor behaviour
- Colour contrast
- Responsive layouts

Accessibility is a core quality requirement.

---

# Visual Quality Checklist

Verify:

- Spacing is consistent.
- Typography matches the design language.
- Animations feel smooth.
- Loading states appear intentional.
- Empty states feel welcoming.
- Error messages feel calm.
- Success feedback is subtle.

---

# AI Feature Testing

Whenever AI functionality is introduced, verify:

- AI runs asynchronously.
- Journaling is never blocked.
- User data remains private.
- AI language remains observational.
- AI never claims certainty.
- AI reflections remain clearly separate from user-written content.

---

# Regression Testing

Before completing a task, verify that existing functionality still works.

Examples:

- Authentication
- Protected routes
- Journal CRUD
- Navigation
- Responsive layout
- Theme consistency

New features should not break existing ones.

---

# Common Quality Issues

Watch for:

- Stale form state
- Missing loading states
- Console errors
- Broken responsiveness
- Cursor inconsistencies
- Inaccessible controls
- Duplicate components
- Dead code
- Unused imports
- Broken animations

These issues reduce trust even if the application technically works.

---

# Definition of Done

A feature is considered complete only when:

✓ The implementation works.

✓ Manual testing passes.

✓ TypeScript passes.

✓ ESLint passes.

✓ Production build succeeds.

✓ Existing functionality remains intact.

✓ UX feels polished.

✓ No known issues remain.

---

# Quality Mindset

Reflect is not judged by the number of features it has.

Reflect is judged by how each feature feels to use.

Every interaction should communicate care, attention to detail, and respect for the user.

---

# Guiding Statement

> Users remember experiences, not implementations.

Every feature should leave the user feeling that Reflect was built with care.