# ProductManagementSystem

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.10.

The application provides role-based product management, including protected
product routes, mock identities, session persistence, and administrative tools.

## Implementation Progress

### Step 1: Mock Data & Asset Seeding

**Status:** Complete

Create a typed, immutable in-memory user store containing exactly four users: two
admins and two standard users. User roles will be constrained to a union type,
and passwords will be stored only as pre-calculated SHA-256 hashes so no
plain-text credentials exist in the application data.

Implemented in `src/app/data/mock-users.ts` and verified by focused tests covering
the exact role distribution and SHA-256 hash format.

### Step 2: Reactive Signal-Based Auth Service

**Status:** Complete

Create a root-provided authentication service as the only identity state owner.
It will expose read-only `currentUser`, `role`, and `isAuthenticated` signals,
compare credentials after hashing submitted passwords with Web Crypto, and return
login results through an observable delayed by 600ms. Successful sessions will
use a base64-encoded mock JWT stored in `sessionStorage`; startup hydration will
validate its payload before restoring state, and logout will clear state and
navigate to `/login`.

Implemented in `src/app/auth/auth.service.ts`.

### Step 3: Functional Route Guards

**Status:** Complete

Add functional `CanActivateFn` guards using `inject()` and URL-tree redirects.
The authentication guard will preserve the attempted URL in a `returnUrl` query
parameter, while the admin guard will allow only the `admin` role. Routes will
lazy-load standalone pages and send authenticated users to their role-specific
landing page.

Implemented with functional guards in `src/app/auth/auth.guard.ts` and lazy
standalone routes in `src/app/app.routes.ts`.

### Step 4: OnPush Login Page & Form UX

**Status:** Complete

Build a standalone OnPush login page around a non-nullable reactive form. Email
and password controls will provide inline error messages after interaction.
Signal-backed loading and error states will swap the form for a structural
skeleton during authentication and show an accessible descriptive alert for bad
credentials. The login subscription will be scoped with `takeUntilDestroyed`.

Implemented in `src/app/pages/login/`.

### Step 5: Role-Aware Layout Component

**Status:** Complete

Create a standalone OnPush application shell around protected child routes. The
shell will read the AuthService's read-only identity signals directly to render
the current user, role-aware navigation, and admin-only actions. Logout will
delegate entirely to AuthService, preserving it as the single source of truth.

Implemented in `src/app/layout/` with protected child routes.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
