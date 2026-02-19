# @budarin/use-route

[Русская версия](https://github.com/budarin/use-route/blob/master/README.ru.md)

**Minimum code. Maximum SPA navigation.**

An infrastructure hook for React 18+ and TypeScript built on modern **Navigation API and URLPattern**, with no providers, no context, and no business logic.

**Purpose**

- **Layer for clean architecture and dynamic routes** – routing is responsible only for URL and history; the screen tree, data loading, guards and redirects live in your application.
- **Routing for modern React** – works correctly with concurrent rendering in React 18+.
- **Foundation for navigation components** – you can build any `<Link>`, `<Route>`‑like components and layout systems for your specific design/UX on top of `useRoute()`, without coupling to a third‑party router.

[![CI](https://github.com/budarin/use-route/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/budarin/use-route/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@budarin/use-route?color=cb0000)](https://www.npmjs.com/package/@budarin/use-route)
[![npm](https://img.shields.io/npm/dt/@budarin/use-route)](https://www.npmjs.com/package/@budarin/use-route)
[![bundle](https://img.shields.io/bundlephobia/minzip/@budarin/use-route)](https://bundlephobia.com/result?p=@budarin/use-route)
[![GitHub](https://img.shields.io/github/license/budarin/use-route)](https://github.com/budarin/use-route)

**[▶  &nbsp;Demo StackBlitz](https://stackblitz.com/github/budarin/use-route/tree/master/demo)**&nbsp;&nbsp;
**[▶  &nbsp;Demo CodeSandbox](https://codesandbox.io/p/sandbox/github/budarin/use-route/tree/master/demo)**

## ✨ Features

- ✅ **Optimized for large applications** – designed to use many hooks on a page with minimal memory footprint and high performance.
- ✅ **Dynamic tree** – runtime routing based on `pathname`/`params`, no static route tree.
- ✅ **Dynamic history** – allows you to manage history entries during navigation.
- ✅ **Navigation API** – `navigation.navigate()`, `back()`, `forward()`, `traverseTo()`.
- ✅ **URLPattern** – native parsing of route template params.
- ✅ **PathMatcher** – custom parsing when reading and validating route params.
- ✅ **useSyncExternalStore** – concurrent render safety, SSR‑ready.
- ✅ **canGoBack(n), canGoForward(n)** – accurate checks before transitions.
- ✅ **O(1) lookup** when resolving a route’s `historyIndex`.
- ✅ **state** – read state of the current history entry, set it on navigation, update in place.
- ✅ **LRU cache for URLs** – cache of parsed routes with configurable limit.
- ✅ **0 providers** – just `useRoute()`!
- ✅ **~4 kB** gzipped.

## ⚠️ When not to use

- **You need support for old browsers** – the hook requires Navigation API and URLPattern (see the table below). For older browsers use React Router, TanStack Router or a router with polyfills.
- **You want loaders or data fetching in the router** – here data loading is out of scope; it is handled by your use‑cases and services. If you want loaders / data “out of the box” in routes, React Router (loaders) or TanStack Router may be better, but that is not a requirement for good architecture.
- **You need a declarative route tree** – the hook does not provide `<Route>` / `<Routes>`; you decide what to render in code based on `pathname` / `params`. If a declarative nested route tree is important, use one of the full routers mentioned above.
- **You need built‑in guards, redirects, lazy‑routes** – the package does not include them; they are implemented in your app on top of the hook.

In other cases (modern browsers, modern React, clean architecture, dynamic routes) this package is a good fit.

## 🚀 Quick start

```bash
npm i @budarin/use-route
```

```typescript
import { useRoute } from '@budarin/use-route';

function App() {
    const {
        pathname,
        params,
        searchParams,
        navigate,
        go,
        canGoBack
    } = useRoute('/users/:id'); // optional: pattern for parsing params

    return (
        <div>
            <h1>Current: {pathname}</h1>
            <p>User ID: {params.id}</p>

            <button onClick={() => navigate('/users/123')}>
                To Profile
            </button>

            <button onClick={() => go(-1)} disabled={!canGoBack()}>
                ← Back
            </button>
        </div>
    );
}
```

## 📖 API

### `useRoute(pattern?: string | PathMatcher, options?: UseRouteOptions)`<br />`useRoute(options: UseRouteOptions)`

**Call forms:**

- **`useRoute()`** – without pattern and options.
- **`useRoute(pattern)`** – only pattern (string or `PathMatcher`).
- **`useRoute(pattern, options)`** – pattern and options (for example `section`).
- **`useRoute({ section: '/dashboard' })`** – only options, no pattern (section under the global base; `pathname` and `navigate` relative to the section).

**Parameters:**

- **`pattern`** (optional): path pattern string (native **URLPattern**) or **PathMatcher** function.

  **String (URLPattern).** Supports:

  - **Named params** – `:name` (name as in JS: letters, digits, `_`). Segment value is available as `params[name]`.
  - **Optional groups** – `{ ... }?`: a part of the path can be optional. One pattern can cover paths of different depth; `params` contains only keys for segments that exist in the URL.
  - **Wildcard** – `*`: matches the “tail” of the path; not included in `params` (numeric keys from `groups` are filtered out).
  - **Regexp in a param** – `:name(regexp)` to restrict segment format (e.g. digits only). `params` still contains a string.

  ```typescript
  useRoute('/users/:id');
  useRoute('/elements/:elementId/*/:subElementId'); // wildcard

  // Optional groups
  useRoute('/users/:id{/posts/:postId}?');

  // Restrict param format (regexp)
  useRoute('/blog/:year(\\d+)/:month(\\d+)');

  // Function matcher (hierarchies, custom parsing)
  const matchPost = (pathname: string) => ({ matched: pathname.startsWith('/posts/'), params: {} });
  useRoute(matchPost);
  ```

  Full URLPattern syntax: [URL Pattern API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API), [WHATWG URL Pattern](https://urlpattern.spec.whatwg.org/).

  **PathMatcher** – a function you can pass instead of a string when a single URLPattern is not enough (segment hierarchies, custom validation, parsing via `split` or RegExp). The hook calls it with the current `pathname` and injects the returned `matched` and `params` into its state.

  - **Parameter:** `pathname: string` – current pathname (without origin and query).
  - **Return type:** `{ matched: boolean; params: RouteParams }`.
    `matched` – whether the path matches your logic; `params` – map of “param name → segment value” (type `RouteParams` = `Record<RouteParamName, RouteParamValue>`).
  - **Where to use:** hierarchical routes (e.g. `postId` only when `userId` is present), strict segment ordering, complex rules that are hard to express with a single URLPattern.

- **`options`** (optional)

  - **`section`**: section path under the global base (e.g. `/dashboard`). `navigate(to)` will prepend the full prefix (base + section) to relative paths by default. It combines with global `base` from `configureRoute`, it does not replace it. In section components, call `useRoute({ section: '/dashboard' })` and work with paths relative to the section.
  - **`ignoreCase`**: when `true`, pathname matching is case-insensitive (URLPattern). Only when `pattern` is a string; ignored for PathMatcher.

**Returns:**

```typescript
{
    // Current state
    location: string;
    pathname: string;
    searchParams: URLSearchParams; // read‑only, do not mutate
    params: Record<string, string>;
    historyIndex: number;
    state?: unknown; // state of the current history entry (getState() / history.state)
    matched?: boolean; // true/false when pattern is provided, otherwise undefined

    // Navigation
    navigate: (to: string | URL, options?) => Promise<void>; // Navigation API; same-document when intercepting navigate + intercept()
    back: () => void;
    forward: () => void;
    go: (delta: number) => void;
    replace: (to: string | URL, options?: NavigateOptions) => Promise<void>;
    updateState: (state: unknown) => void; // update state of the current entry without navigation
    canGoBack: (steps?: number) => boolean;
    canGoForward: (steps?: number) => boolean;
}
```

**Options of `navigate` and `replace`** (shared **NavigateOptions** interface):

```typescript
{
    history?: 'push' | 'replace' | 'auto'; // default from configureRoute or 'auto'
    state?: unknown;   // optional transition data (UX hints only); see the "state parameter" section below
    base?: string | null | false;   // full prefix override: any falsy ('' | '/' | null | false | undefined when key present) — no prefix; otherwise full path (e.g. '/auth')
    section?: string | null | false;  // section override: any falsy ('' | null | false | undefined when key present) — app root (only global base); '/path' — another section
}
```

- *`state`* – arbitrary data you pass along with navigation via `navigate(to, { state })` or `replace(to, { state })`. Use it only for optional UX hints (scroll position, “where we came from”, form draft); the page must still work correctly when opened directly without state. Details below in “State parameter: when to add it to history”.

  **`replace(to, options?)`** – same as `navigate(to, { ...options, history: 'replace' })`. Options are the same as for **navigate** (`state`, `base`, `section`); the **history** field is ignored (it always replaces the current entry).

  **`updateState(state)`** – updates the state of the **current** history entry without navigation. Subscribers of the hook receive the new state; URL does not change, no new history entry is created. Useful for form drafts, scroll position, etc.

  **State parameter: when to add it to history and what to store**

  Many developers never use state in navigation – that is fine. State is needed only in narrow scenarios. Below: when it makes sense to add state, what you can store and what you should avoid.

  **What state is and where it comes from.** State is arbitrary data you pass to `navigate(to, { state })` or `replace(to, { state })`. It is stored in the history entry (Navigation API) and available through the **`state`** field in the hook result. **Important:** state appears only for programmatic transitions (your navigate/replace calls). If the user arrives at the same URL from outside – types the address, opens a bookmark, follows a link from another site, reloads – there is no state for that history entry. The page must not critically depend on state.

  **When to add state to history.** Add state only when you want to send a “hint” to the target page that improves UX for a programmatic transition but is not required for correctness:

  - **Scroll hint** – when leaving a list page, save the scroll position in state; on “Back” you can restore it. If entered via direct URL, there is no state and the list starts from the top.
  - **“Where we came from” hint** – transition from search to a detail page: pass `{ from: 'search', highlight: 'keyword' }` in state; the detail page can highlight the keyword. On direct link there is no highlight – the page still works correctly.
  - **Optional form prefill** – “Edit” page opened from a list: pass a draft in state; on the edit page, use it when present, otherwise fetch data by id from URL/server.
  - **Form draft on the current page** – while typing, periodically save a draft to the current entry state via `updateState(draft)`; pressing Back returns to the same page with the draft. Without state you show an empty form or load data from URL.
  - **Transition source (analytics, UI)** – pass `{ source: 'dashboard' }` in state; the target page may send this to analytics or slightly tweak the UI. When entering via link without state, treat the source as “direct” or “unknown”.

  **What state is allowed.** Only data that are **an optional enhancement**: scroll hints, “came from” flags, optional prefill, analytics metadata. Rule: the target page must work correctly without state (for direct URL entry).

  **What state is not allowed.** Do not use state for things that make the page incorrect or incomplete without it:

  - **Required page data** – e.g. search results only from state. When following `/search?q=foo` there is no state – the screen is empty. Results must come from query or server.
  - **Anything that must be in the URL (sharing, bookmarks)** – state is not part of the URL. If behavior must be reproducible via a single link, use pathname and query, not state.
  - **Auth, permissions, critical data** – do not rely on state: users can open the URL directly. Checks belong to the session/server.
  - **Main page content** – what to render is defined by URL and backend data. State is only for hints, not a source of truth.

  **Summary.** State in history is an optional tool for “passing something along with navigation” when it is an enhancement, not a requirement. If in doubt, you can skip it; in most apps `pathname`, query and API calls are enough.

### `configureRoute(config)`

```typescript
configureRoute({
    urlCacheLimit?: number,
    defaultHistory?: 'auto' | 'push' | 'replace',
    logger?: Logger,
    base?: string,
    initialLocation?: string
});
```

Global configuration called once at app startup. Re‑initialization is not supported: call `configureRoute` only at startup; changing config at runtime is not supported (internal caches and state are not reset).

```typescript
configureRoute({
    urlCacheLimit: 50, // LRU cache limit for URLs (default 50)
    defaultHistory: 'replace', // default history mode for all navigate()
    base: '/app', // base path: pathname is without base, navigate(to) adds base to relative paths
    logger: myLogger, // logger (default: console)
    initialLocation: request.url, // for SSR: initial URL when rendering on the server (no window)
});
```

- *`defaultHistory`* (default `'auto'`) – globally defines how history entries are written when using `navigate` and `replace`.

- *`base`* (default `'/'`) – needed only when the **app is hosted under a sub‑path**, not at the domain root. Example: site `https://example.com/` is root; your app is served from `https://example.com/app/`, so all routes live under `/app`. In that case set `base: '/app'`: `navigate('/dashboard')` goes to `/app/dashboard`. If the app is at the root (`https://example.com/`), you do not need a global base – no prefix is used.

- *`logger`* (default `console`) – object with `debug`, `info`, `warn`, `error` methods. If not set, `console` is used.

- *`initialLocation`* (default `'/'`) – on SSR (no `window`) the hook does not know the request URL. Provide `initialLocation: request.url` (or full page URL) once before rendering the request so that `pathname` and `searchParams` match it. It is not used on the client. **You usually do not need to set it by default:** if not provided on SSR, `'/'` is used (pathname and searchParams for the root).

### `clearRouteCaches()`

Utility to clear internal caches (tests, environment switching).

## 🛠 Examples

### 1. Basic navigation (pathname, navigate)

```tsx
import { useRoute } from '@budarin/use-route';

function BasicNavigationExample() {
    const { pathname, navigate } = useRoute();

    return (
        <div>
            <p>Current path: {pathname}</p>
            <button type="button" onClick={() => navigate('/posts')}>
                To posts
            </button>
            <button type="button" onClick={() => navigate('/')}>
                Home
            </button>
        </div>
    );
}
```

### 2. Path params (`useRoute('/users/:id')`, params)

```tsx
import { useRoute } from '@budarin/use-route';

function ParamsExample() {
    const { params, pathname, navigate } = useRoute('/users/:id');

    return (
        <div>
            <p>Pathname: {pathname}</p>
            <p>User ID from params: {params.id ?? '—'}</p>
            <button type="button" onClick={() => navigate('/users/123')}>
                User 123
            </button>
            <button type="button" onClick={() => navigate('/users/456')}>
                User 456
            </button>
        </div>
    );
}
```

### 3. Search params (query)

```tsx
import { useRoute } from '@budarin/use-route';

function SearchParamsExample() {
    const { searchParams, navigate, pathname } = useRoute('/posts');
    const pageParam = searchParams.get('page') ?? '1';
    const currentPage = Number.parseInt(pageParam, 10) || 1;

    return (
        <div>
            <p>Path: {pathname}</p>
            <p>Page: {currentPage}</p>
            <button
                type="button"
                onClick={() => navigate(`/posts?page=${currentPage - 1}`)}
                disabled={currentPage <= 1}
            >
                Prev page
            </button>
            <button type="button" onClick={() => navigate(`/posts?page=${currentPage + 1}`)}>
                Next page
            </button>
        </div>
    );
}
```

### 4. History (back, forward, go, canGoBack, canGoForward)

```tsx
import { useRoute } from '@budarin/use-route';

function HistoryExample() {
    const { go, back, forward, canGoBack, canGoForward } = useRoute();

    return (
        <div>
            <button type="button" onClick={() => back()} disabled={!canGoBack()}>
                ← Back
            </button>
            <button type="button" onClick={() => go(-2)} disabled={!canGoBack(2)}>
                ← 2 steps
            </button>
            <button type="button" onClick={() => go(1)} disabled={!canGoForward()}>
                Forward →
            </button>
            <button type="button" onClick={() => forward()} disabled={!canGoForward()}>
                Forward
            </button>
        </div>
    );
}
```

### 5. Push vs replace (and `replace()` method)

```tsx
import { useRoute } from '@budarin/use-route';

function PushReplaceExample() {
    const { navigate, replace, pathname } = useRoute();

    return (
        <div>
            <p>Current path: {pathname}</p>
            <button type="button" onClick={() => navigate('/step-push', { history: 'push' })}>
                Go (push) — adds an entry to history
            </button>
            <button type="button" onClick={() => navigate('/step-replace', { history: 'replace' })}>
                Go (replace via navigate)
            </button>
            <button type="button" onClick={() => replace('/step-replace-method')}>
                Go via replace() — same as history: 'replace'
            </button>
        </div>
    );
}
```

### 6. State (reading, setting on navigation, in‑place updates)

State of the current history entry is available from the hook as **`state`**. Set it during navigation via the **`state`** option in `navigate` or `replace`. Update state of the **current** page without navigation via **`updateState(state)`**. Use it only for optional hints (scroll, where we came from, form drafts); the page must still work correctly when opened via a direct link without state.

```tsx
import { useRoute } from '@budarin/use-route';

function StateExample() {
    const { state, navigate, updateState, pathname } = useRoute();

    return (
        <div>
            <p>Current path: {pathname}</p>
            <p>Entry state: {state != null ? JSON.stringify(state) : '—'}</p>
            <button
                type="button"
                onClick={() => navigate('/detail', { state: { from: 'list', scrollY: 100 } })}
            >
                Navigate with state
            </button>
            <button type="button" onClick={() => updateState({ draft: true, step: 2 })}>
                Update state of current entry (no navigation)
            </button>
        </div>
    );
}
```

### 7. `matched` (pattern match for pathname)

```tsx
import { useRoute } from '@budarin/use-route';

function MatchedExample() {
    const { pathname, matched, params } = useRoute('/users/:id');

    return (
        <div>
            <p>Pathname: {pathname}</p>
            <p>Pattern /users/:id matched: {matched === true ? 'yes' : 'no'}</p>
            {matched === true ? (
                <p>User ID: {params.id}</p>
            ) : (
                <p>This is not a user page (path does not match /users/:id).</p>
            )}
        </div>
    );
}
```

### 8. Function matcher (`PathMatcher`)

Useful when a single URLPattern or a simple regex is not enough: hierarchies (e.g. `postId` only together with `userId`), custom validation, different segment orders. Below is a matcher for `/users/:userId` and `/users/:userId/posts/:postId`: two params where `postId` is allowed only after literal `posts` and only when `userId` is present.

```tsx
import { useRoute, type PathMatcher } from '@budarin/use-route';

const matchUserPosts: PathMatcher = (pathname) => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] !== 'users' || !segments[1]) return { matched: false, params: {} };

    const params: Record<string, string> = { userId: segments[1] };
    if (segments[2] === 'posts' && segments[3]) {
        params.postId = segments[3];
    }

    return { matched: true, params };
};

function UserPostsExample() {
    const { pathname, matched, params } = useRoute(matchUserPosts);

    if (!matched) return null;

    return (
        <div>
            <p>Path: {pathname}</p>
            <p>User ID: {params.userId}</p>
            {params.postId && <p>Post ID: {params.postId}</p>}
        </div>
    );
}
```

### 9. Global `base` (app under a sub‑path)

When the app is hosted **not at the domain root** but under a sub‑path (e.g. `https://example.com/app/` – all routes under `/app`), set `base: '/app'` in the config. Then `navigate(to)` automatically adds the base prefix to relative paths. For a one‑off transition “outside” this path (e.g. to `/login`), use the `base` option in `navigate` or `replace`: `navigate('/login', { base: '' })`.

```tsx
import { useRoute, configureRoute } from '@budarin/use-route';

configureRoute({ base: '/app' });

function AppUnderBase() {
    const { pathname, navigate } = useRoute();

    return (
        <div>
            <p>Current path: {pathname}</p>

            <button type="button" onClick={() => navigate('/dashboard')}>
                Dashboard → /app/dashboard
            </button>

            <button type="button" onClick={() => navigate('/login', { base: '' })}>
                Login (/login)
            </button>

            <button type="button" onClick={() => navigate('/auth/profile', { base: '/auth' })}>
                Another section (/auth/profile)
            </button>
        </div>
    );
}
```

### 10. Section in the hook (`options.section`)

When the app has several sections under their own sub‑paths (`/dashboard`, `/admin`, `/auth`), set **section** in section components: call `useRoute({ section: '/dashboard' })`. Then `navigate(to)` adds the full prefix (base + section) by default. <br />
Transition to the app root (without a section): `navigate('/', { section: '' })`. <br />
Transition “outside” the app: `navigate('/login', { base: '' })`.

```tsx
import { useRoute } from '@budarin/use-route';

const DASHBOARD_BASE = '/dashboard';

function DashboardSection() {
    // Section: pathname and navigate are relative to /dashboard (under the global base, if set)
    const { pathname, navigate } = useRoute({ section: DASHBOARD_BASE });

    return (
        <div>
            {/* For URL /dashboard/reports pathname === '/reports' */}
            <p>Dashboard section. Path: {pathname}</p>

            <button type="button" onClick={() => navigate('/reports')}>
                Reports → /dashboard/reports
            </button>

            <button type="button" onClick={() => navigate('/settings')}>
                Settings → /dashboard/settings
            </button>

            {/* Transition to the app root (no section) or main page */}
            <button type="button" onClick={() => navigate('/', { section: '' })}>
                Home
            </button>
        </div>
    );
}
```

### 11. `initialLocation` (SSR)

When rendering on the server there is no `window`, so the hook does not know the request URL. Set `initialLocation` in the config once before rendering the request (for example `request.url`) so that `pathname` and `searchParams` match the request. On the client `initialLocation` is not used.

```tsx
// Server handler (pseudocode: Express, Fastify, Next, etc.)
import { configureRoute } from '@budarin/use-route';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from './App';

function handleRequest(req, res) {
    // Once before rendering this request
    configureRoute({ initialLocation: req.url });

    const html = renderToStaticMarkup(<App />);
    res.send(html);
}

// In App, components use useRoute() — on the server they read pathname/searchParams from initialLocation
function App() {
    const { pathname, searchParams } = useRoute();
    return (
        <div>
            <p>Pathname: {pathname}</p>
            <p>Query: {searchParams.toString()}</p>
        </div>
    );
}
```

### 12. `Link` component (example implementation)

Minimal example of a link component on top of the hook. You can use it as a base and extend it: active state, prefetch, analytics, styles, etc.

```tsx
import { useRoute } from '@budarin/use-route';
import { useCallback, type ComponentPropsWithoutRef } from 'react';

interface LinkProps extends ComponentPropsWithoutRef<'a'> {
    to: string;
    replace?: boolean;
}

function Link({ to, replace = false, onClick, ...props }: LinkProps) {
    const { navigate } = useRoute();

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>) => {
            onClick?.(e);

            if (!e.defaultPrevented) {
                e.preventDefault();
                navigate(to, { history: replace ? 'replace' : 'push' });
            }
        },
        [navigate, to, replace, onClick]
    );

    return <a {...props} href={to} onClick={handleClick} />;
}

// Usage:
// <Link to="/posts">Posts</Link>
// <Link to="/users/123" replace>Profile (replace)</Link>
```

## 🧪 Testing

For unit tests in a jsdom environment there is a helper `setupTestNavigation` from the `@budarin/use-route/testing` entrypoint. It configures `window.location` and `window.navigation` for the given URL and returns a restore function.

```ts
import { beforeEach, afterEach, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRoute } from '@budarin/use-route';
import { setupTestNavigation } from '@budarin/use-route/testing';

let restoreNavigation: () => void;

beforeEach(() => {
    restoreNavigation = setupTestNavigation({ initialUrl: 'http://localhost/users/123' });
});

afterEach(() => {
    restoreNavigation();
});

it('reads pathname and params from Navigation API', () => {
    const { result } = renderHook(() => useRoute('/users/:id'));
    expect(result.current.pathname).toBe('/users/123');
    expect(result.current.params).toEqual({ id: '123' });
});
```

## ⚙️ Installation

```bash
npm i @budarin/use-route

pnpm add @budarin/use-route

yarn add @budarin/use-route
```

TypeScript types are included.

**`tsconfig.json` (recommended):**

```json
{
    "compilerOptions": {
        "lib": ["ES2021", "DOM", "DOM.Iterable"],
        "moduleResolution": "bundler",
        "jsx": "react-jsx"
    }
}
```

## ⚛️ React

The package is designed for **React 18+**: it uses `useSyncExternalStore` and concurrent rendering behavior that are officially supported starting from React 18.

## 🌐 Browsers and Node.js

The package **only works** in environments that provide **Navigation API** and **URLPattern**. The table below lists minimum versions; without them the hook will not run.

| API            | Chrome/Edge | Firefox | Safari | Node.js |
| -------------- | ----------- | ------- | ------ | ------- |
| Navigation API | 102+        | 109+    | 16.4+  | —       |
| URLPattern     | 110+        | 115+    | 16.4+  | 23.8+   |

## 🎛 Under the hood

- **Navigation API:** subscription to `navigate` and `currententrychange` events; for same‑origin navigation it intercepts `navigate` and calls `event.intercept()`.
- `useSyncExternalStore` on navigation events.
- `Map` for O(1) lookup of `historyIndex`.
- URLPattern for `:params`.
- LRU cache of parsed URLs (configurable limit).
- Cache of compiled patterns.
- SSR‑safe (checks `typeof window`).

## 🤝 License

MIT © budarin
