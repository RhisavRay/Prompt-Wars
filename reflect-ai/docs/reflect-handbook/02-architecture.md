# 02 - Architecture

**Version:** 1.0.0  
**Status:** Active  
**Last Updated:** 28 June 2026  
**Audience:** Developers, AI Coding Agents

---

# Purpose

This document describes the technical architecture of Reflect.

It explains how the application is organized, how data flows through the system, and how different parts of the application communicate.

Unlike the Engineering Principles document, this file documents the current implementation rather than general engineering philosophy.

---

# Technology Stack

## Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Framer Motion

---

## Backend

- Firebase Authentication
- Cloud Firestore

---

## AI

- Google Gemini (planned)

AI processing is asynchronous and should never block the journaling experience.

---

# High-Level Architecture

```
                    User
                      │
                      ▼
              React Components
                      │
                      ▼
             Hooks / Contexts
                      │
                      ▼
          Firebase Service Layer
             │                │
             ▼                ▼
    Firebase Auth      Cloud Firestore
```

Business logic should never communicate directly with Firebase from UI components.

Components should communicate through services and hooks.

---

# Project Structure

```
src/

app/
components/
contexts/
hooks/
lib/
providers/
services/
styles/
types/
```

---

# Folder Responsibilities

## app/

Contains route definitions using the Next.js App Router.

Responsibilities:

- Pages
- Layouts
- Route groups
- Metadata

---

## components/

Reusable UI components.

Responsibilities:

- Rendering
- User interaction
- Presentation

Should not contain business logic.

---

## contexts/

React Context providers.

Responsibilities:

- Global application state
- Authentication state
- Shared client-side state

---

## hooks/

Reusable application logic.

Responsibilities:

- Data fetching
- Local business logic
- State composition

---

## services/

Communication with external systems.

Examples:

- Firebase
- Firestore
- AI providers

No UI logic belongs here.

---

## types/

Shared TypeScript interfaces.

Responsibilities:

- Data models
- Contracts
- Shared enums
- Utility types

---

## lib/

Small reusable utilities.

Should remain framework-independent whenever practical.

---

## providers/

Application-level providers.

Examples:

- Theme
- Authentication

---

# Authentication Flow

```
User

↓

Firebase Authentication

↓

Auth Context

↓

Protected Route

↓

Authenticated Pages
```

Authentication state should be managed centrally.

Components should never independently determine authentication.

---

# Firestore Structure

Current structure:

```
users/

    {userId}

        profile fields

        journals/

            {journalId}
```

Each authenticated user owns their own journal collection.

Users should never be able to access another user's data.

---

# Journal Lifecycle

```
Create

↓

Firestore

↓

Dashboard Refresh

↓

Edit

↓

Firestore Update

↓

Delete

↓

Firestore Delete
```

All CRUD operations should pass through the journal service layer.

---

# AI Pipeline (Planned)

```
User submits journal

↓

Journal saved immediately

↓

Background AI processing

↓

Emotion analysis

↓

Theme extraction

↓

Reflection generation

↓

Firestore update

↓

Insights available to user
```

The user should never wait for AI processing before continuing.

---

# State Management Strategy

Use the smallest appropriate scope.

Priority:

1. Local component state
2. Custom hooks
3. React Context
4. External state libraries (only if necessary)

Avoid introducing global state without clear justification.

---

# Routing

Current routes:

```
/

Landing page

/login

Authentication

/app

Protected dashboard
```

Future features should follow the App Router conventions.

---

# Error Handling Strategy

Errors should be categorized as:

- Authentication
- Firestore
- Validation
- Network
- AI

Each category should have clear user-facing messaging.

---

# Security

Authentication is handled through Firebase Authentication.

Firestore Security Rules enforce authorization.

Sensitive credentials must never be committed to the repository.

Environment variables are required for secrets.

---

# Scalability Principles

Reflect should remain modular as features grow.

Future additions should fit naturally into the existing architecture.

Examples:

- Search
- Analytics
- AI Insights
- Calendar
- Export
- Notifications

These should extend the architecture rather than replace it.

---

# Architectural Decision Records

Major architectural decisions should be documented here when they significantly change the application's structure.

This document should always describe the current architecture.

---

# Guiding Statement

> Architecture should make future development easier, not more complicated.

A contributor should understand how Reflect is organized within a few minutes of reading this document.