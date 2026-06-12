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

### Step 6: Admin Routing & Shell Architecture

- Set up a lazy-loaded `/admin` route that acts as a secure container for the admin panel features.
- Protect this container route with the `adminGuard` established in Task 1.
- Create sub-routes for `Products`, `Orders`, and `Analytics`, configuring each as a distinct lazy-loaded module or routing definition under `/admin`.
- Write this step to `README.md`.

### Step 7: Product Management Store & List View (2A)

- Build a dedicated, signal-based store or stateful service for products to ensure data does not scatter across components.
- Implement a paginated product list rendered as a data table with sortable columns for: `name`, `category`, `price`, and `stock`.
- Build a search input combined with a category dropdown filter. Chain these inputs using RxJS (`debounceTime` + `distinctUntilChanged` + `switchMap`) to compose a single query parameters object—preventing full layout re-renders on every single keystroke.
- Write this step to `README.md`.

### Step 8: Product CRUD Actions & Optimistic UI (2A)

- Build an Add/Edit reactive product form modal or slide-over layout.
- Implement an Optimistic UI strategy for the "Delete Product" feature: when delete is clicked, immediately remove the row from the local view, hit the mock API endpoint, and seamlessly roll back the state while throwing a dynamic error toast if the backend call fails.
- Write this step to `README.md`.

### Step 9: Reactive WebSocket Stock Stream (2A)

- Simulate a live server WebSocket connection using an interval stream coupled to an RxJS `Subject`.
- This background stream must randomly update stock counts for currently visible items in the table.
- Ensure the structural stock badges update fluidly using reactive bindings _without_ re-triggering a complete collection re-fetch.
- Write this step to `README.md`.

### Step 10: Orders Table & Dynamic Filters (2B)

- Set up a shared, stateful store for managing orders (shared globally with the upcoming Task 3).
- Display orders in a paginated, sortable table tracking: `order ID`, `customer name`, `product(s)`, `total value`, `status`, and `date`.
- Implement functional multi-filters for order status (`All`, `Pending`, `Confirmed`, `Cancelled`) and a custom date-range range picker.
- Write this step to `README.md`.

### Step 11: Order Detail Side-Panel & Inline Status Updates (2B)

- Implement a slide-out drawer or overlay side-panel to view specific order profiles upon clicking any row in the table (must not trigger a new route).
- Render a comprehensive line-item component breakdown within this panel.
- Embed an inline select dropdown menu to change order statuses. Modifying this status must instantly sync the parent table via the shared state layer without inducing a clumsy whole-page reload.
- Write this step to `README.md`.

### Step 12: Product Catalogue Grid & Filters (3A)

- Fetch paginated products from the shared `ProductService`. Display them as a responsive card grid using modern `@defer` blocks with a meaningful placeholder skeleton.
- Implement multi-select chips for category filtering, a price range slider, and an in-stock toggle switch.
- Compose all filters into a single query parameters object and mirror them to the URL to enable deep-linking.
- Implement an error retry mechanism and graceful empty states.
- Connect the `ProductCardComponent` to the **exact same** reactive WebSocket stock stream created in Step 9.
- Log approach to `README.md`.

### Step 13: Product Detail Route Resolver (3B)

- Implement a route resolver to preload product data before completing navigation to `/shop/products/:id`. No loading skeleton on the detail page itself.
- Build a comprehensive detail UI showing metadata, a quantity selector bounded strictly by available stock, and an "Add to Cart" button.
- If out of stock, disable the "Add to Cart" button and replace it with a structural "Notify me" layout/placeholder.
- Add a related products section displaying up to 4 items from the same category.
- Log approach to `README.md`.

### Step 14: Persistent Signal-Based Cart Service (3C)

- Create a global, signal-based `CartService`. Persist cart state inside `localStorage` to survive page rehydrations.
- Expose a computed signal for the live item count to bind directly to the navigation header cart icon.
- Log approach to `README.md`.

### Step 15: Checkout Architecture & Dynamic Form Renderer (3C)

- Build a 3-step lazy-loaded checkout flow located at `/shop/checkout/step/:n`.
- Implement a linear route guard that blocks deep-linking to step 2 or 3 unless previous step conditions are validated.
- **Step 1 (Cart Review)**: Render cart line-items with quantity modifications and removals. Compute subtotal, configurable tax rates, and grand total using a **pure pipe**. Redirect to `/shop` if empty.
- **Step 2 (Delivery Details)**: Render form controls dynamically from `/assets/checkout-form.json` containing types, validations, and optional conditional `visibleWhen` predicates. **Reuse the exact same structural dynamic form renderer built in Task 2** as an abstract component accepting `[formGroup]` and `[config]` as inputs with zero situational knowledge.
- Log approach to `README.md`.

### Step 16: Custom ControlValueAccessor & Order Submission (3C)

- **Step 3 (Payment)**: Build a custom input component implementing `ControlValueAccessor` for the card number field. Embed real-time validation executing the **Luhn Algorithm**. Integrate it seamlessly into the parent reactive form group.
- Implement a billing address toggle ("same as delivery") that leverages the generic configuration framework to show/hide relevant sub-fields dynamically.
- **Submission**: On submit, POST the payload to the mock endpoint. Reflect an optimistic success animation/state instantly, clearing the cart and routing to `/shop/order-confirmation/:id`. Implement a rollback handler if the endpoint rejects.
- Log approach to `README.md`.

### Step 17: Performance Monitoring & Quality Metrics

- Instantiate a `PerformanceObserver` within the catalogue component initialization lifecycle to systematically track and log **Largest Contentful Paint (LCP)** and **Cumulative Layout Shift (CLS)** values directly to the console.
- Generate a `PERFORMANCE.md` file explicitly detailing 5 performance optimization architectural steps taken (e.g., OnPush, Pure Pipes, `@defer`, RxJS debounce optimizations, Web Workers/Optimistic UI) with analytical data points.
- Log approach to `README.md`.
