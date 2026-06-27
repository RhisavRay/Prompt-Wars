# Firebase Infrastructure

This directory houses the core client-side Firebase initialization code.

## Files

- `config.ts`: Loads public Firebase environment keys and runs console verification checks during local development.
- `client.ts`: Bootstraps the Firebase client application and exposes the `auth` and `db` service modules.

## Initialization Strategy

Firebase is initialized checking `getApps().length` to remain compatible with Next.js SSR (Server-Side Rendering) hot reloading without spawning duplicate connections.

> [!WARNING]
> Do not introduce business logic, Firestore data queries, or authentication handler wrappers inside this directory. Keep it strictly focused on infrastructure bootstrap.
