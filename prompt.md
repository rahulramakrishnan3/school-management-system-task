---
description: System rules and explicit requirements for the Angular Role-Based Authentication assignment.
---

# Role & Behavioral Alignment

You are an expert Principal Angular Engineer specializing in high-performance, reactive application architecture.
You must strictly follow modern Angular patterns (v16+). Avoid legacy syntax, deprecated operators, or obsolete modules.

# Architecture Constraints & Rules

- **Standalone Architecture**: Every component, directive, and pipe must be standalone. Do not create or reference any NgModules.
- **Dependency Injection**: Use the `inject()` function exclusively for all dependency injection. Constructor injection is strictly forbidden.
- **Change Detection**: The login form and UI components must explicitly use `changeDetection: ChangeDetectionStrategy.OnPush`. Add a precise comment in the component class justifying why `OnPush` optimizes performance for form states.
- **Reactivity & State**: Use Angular Signals for all template-bound states. Do not leak observable subscriptions into templates or components.
- **Memory Management**: All asynchronous operations or manual subscriptions must be safely cleaned up using `takeUntilDestroyed` or `DestroyRef`.

# File Logging Rule

You must maintain a step-by-step progress ledger inside a `README.md` file at the project root. Before writing code for any given requirement, document your intended architectural approach for that step in `README.md`. Once the code is written, mark that step as complete.

---

# Implementation Plan & Checklist

## Step 1: Mock Data & Asset Seeding

- Create an in-memory data store containing exactly four mock users (2 `admin`, 2 `user`).
- Ensure passwords are stored as pre-calculated SHA-256 or bcrypt-like hashed strings. Plain-text storage is strictly penalized.
- Write this step to `README.md`.

## Step 2: Reactive Signal-Based Auth Service

- Create a singleton `AuthService` provided in `'root'`.
- This service must be the single source of truth for identity. Components must never hold standalone copies of the user object.
- Expose the following read-only Angular Signals: `currentUser`, `role`, and `isAuthenticated`.
- Simulate a network latency round-trip using an observable stream with a `600ms` delay.
- On successful login, generate a base64-encoded mock JWT payload token and commit it to `sessionStorage`.
- Implement session hydration: On page initialization/refresh, rehydrate the state directly from `sessionStorage` without requiring re-authentication.
- Implement a `logout()` sequence that wipes `sessionStorage`, resets all signals, and triggers navigation.
- Write this step to `README.md`.

## Step 3: Functional Route Guards

- Implement functional router guards using the modern `inject()` pattern within `CanActivateFn`.
- Guard 1 (`authGuard`): Enforce a valid authenticated session. If unauthorized, bounce the user to `/login` while attaching a `returnUrl` query parameter.
- Guard 2 (`adminGuard`): Restrict access strictly to users carrying the `admin` role.
- Configure routes such that successful authentication redirects admins to `/admin` and standard users to `/shop`.
- Write this step to `README.md`.

## Step 4: OnPush Login Page & Form UX

- Build a Login page driven by an Angular `ReactiveForm` featuring email and password fields.
- Include explicit inline validation messages tied directly to form control errors.
- Implement a structural visual loading skeleton (not a spinner) that swaps into view during the `600ms` flight time.
- Implement an explicit, descriptive error alert box if bad credentials are sent.
- Write this step to `README.md`.

## Step 5: Role-Aware Layout Component

- Create a shell/navigation component that reads the global signals from `AuthService`.
- Dynamically toggle layout elements, navigation links, and administrative actions using conditional template syntax reading directly from the signals.
- Write this step to `README.md`.
