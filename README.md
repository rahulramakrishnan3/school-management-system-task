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

### Step 6: Admin Routing & Shell Architecture

**Status:** Complete

Create a lazy-loaded admin routing definition protected at the container boundary
by `adminGuard`. A dedicated standalone admin shell will host lazy Products,
Orders, and Analytics child pages and provide feature-level navigation.

Implemented in `src/app/pages/admin/admin.routes.ts` and the standalone admin
feature pages.

### Step 7: Product Management Store & List View (2A)

**Status:** Complete

Create a root-provided signal store as the single owner of product data and query
state. The admin product page will compose debounced search and category form
controls through `distinctUntilChanged` and `switchMap`, then render a sortable,
paginated signal-backed table.

Implemented in `src/app/pages/admin/products/`.

### Step 8: Product CRUD Actions & Optimistic UI (2A)

**Status:** Complete

Add a reactive add/edit slide-over form. Deletes will remove products
optimistically, simulate a mock API request, and restore the removed record with
a signal-backed error toast if that request fails.

Implemented with the product slide-over form and `ProductStore`.

### Step 9: Reactive WebSocket Stock Stream (2A)

**Status:** Complete

Create an interval-driven `Subject` stock stream inside the product store. It
will patch stock values only for product IDs currently visible in the paginated
table, allowing stock badge bindings to update without re-running a collection
fetch.

Implemented by the scoped stock event stream in `ProductStore`.

### Step 10: Orders Table & Dynamic Filters (2B)

**Status:** Complete

Create a globally shared signal store for orders and an admin orders page with a
sortable, paginated table. Signal-backed status and date-range controls will
filter the shared order collection.

Implemented in `src/app/pages/admin/orders/`.

### Step 11: Order Detail Side-Panel & Inline Status Updates (2B)

**Status:** Complete

Add an in-page order detail drawer containing line-item details and an inline
status selector. Status changes will update the shared order store immediately,
which will keep the parent table synchronized without navigation or reload.

Implemented by the orders detail drawer and globally provided `OrderStore`.

### Step 12: Product Catalogue Grid & Filters (3A)

**Status:** In Progress

Create a lazy-loaded `/shop` catalogue backed by the existing root-provided
`ProductStore`, preserving one product and live-stock source across admin and
storefront views. Signal-backed category chips, price, stock, and page filters
will be mirrored into URL query parameters. Product cards will render through
`@defer` with skeleton placeholders and expose retry and empty states.

### Step 13: Product Detail Route Resolver (3B)

**Status:** In Progress

Add a functional resolver that loads a product from the shared store before the
detail route activates. The detail page will provide stock-bounded quantity,
cart actions, out-of-stock notification UI, and related-category products.

### Step 14: Persistent Signal-Based Cart Service (3C)

**Status:** In Progress

Create a root-provided signal cart service that hydrates and persists line items
through `localStorage`. Computed item count and totals will drive the storefront
header and checkout without duplicated cart state.

### Step 15: Checkout Architecture & Dynamic Form Renderer (3C)

**Status:** In Progress

Create lazy checkout child routes guarded by a linear functional guard. Cart
review will use a pure totals pipe; delivery details will be generated from an
asset-backed field configuration through a reusable, context-free dynamic form
renderer accepting only a form group and configuration.

### Step 16: Custom ControlValueAccessor & Order Submission (3C)

**Status:** In Progress

Create a standalone card-number ControlValueAccessor with live Luhn validation,
plus configuration-driven billing fields. Submission will optimistically clear
the cart and navigate to confirmation, restoring the cart and exposing an error
if the simulated endpoint rejects.

### Step 17: Performance Monitoring & Quality Metrics

**Status:** In Progress

Observe LCP and CLS from catalogue initialization with cleanup through
`DestroyRef`. Document five measurable architectural performance choices in
`PERFORMANCE.md`.

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
