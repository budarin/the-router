# @budarin/use-route

**Минимум кода. Максимум SPA-навигации.**

Инфраструктурный хук для React 18+ и Typescript на современном **Navigation API и URLPattern**, без провайдеров, без контекста, без бизнес-логики.

**Назначение**
- **Слой для чистой архитектуры и динамических маршрутов** — роутинг отвечает только за URL и историю, а дерево экранов, загрузка данных, guards и редиректы живут в приложении.
- **Роутинг для современного React** - корректная работа в конкурентном рендеринге в React 18+ !
- **База для компонентов навигации** — поверх `useRoute()` можно строить любые `<Link>`, `<Route>`‑подобные компоненты и `layout‑ы` под конкретный дизайн/UX, не привязываясь к чужому роутеру.


[![CI](https://github.com/budarin/use-route/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/budarin/use-route/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@budarin/use-route?color=cb0000)](https://www.npmjs.com/package/@budarin/use-route)
[![npm](https://img.shields.io/npm/dt/@budarin/use-route)](https://www.npmjs.com/package/@budarin/use-route)
[![bundle](https://img.shields.io/bundlephobia/minzip/@budarin/use-route)](https://bundlephobia.com/result?p=@budarin/use-route)
[![GitHub](https://img.shields.io/github/license/budarin/use-route)](https://github.com/budarin/use-route)

**[▶  &nbsp;Demo StackBlitz](https://stackblitz.com/github/budarin/use-route/tree/master/demo)**&nbsp;&nbsp;
**[▶  &nbsp;Demo CodeSandbox](https://codesandbox.io/p/sandbox/github/budarin/use-route/tree/master/demo)**


## ✨ Особенности

- ✅ **Оптимизирован для больших приложений** - рассчитан на использование большого количества хуков на странице с минимальным потреблением памяти и лучшей производительностью
- ✅ **Динамическое дерево** — маршрутизация в рантайме по pathname/params, без статичного route tree
- ✅ **Динамическая история** — позволяет управлять записями в истории при навигации
- ✅ **Navigation API** — `navigation.navigate()`, `back()`, `forward()`, `traverseTo()`
- ✅ **URLPattern** - для нативного парсинга параметров шаблона роута
- ✅ **PathMatcher** - для кастомного парсинга при получении и проверке параметров роута
- ✅ **useSyncExternalStore** — concurrent render safety, SSR-ready
- ✅ **canGoBack(n), canGoForward(n)** — точная проверка при переходах
- ✅ **O(1) поиск** при получении `historyIndex` роута
- ✅ **state** — чтение state текущей записи истории, установка при навигации, обновление состояния
- ✅ **LRU кэш URL** - кэш роутов с настраиваемым лимитом
- ✅ **0 провайдеров** — просто `useRoute()`!
- ✅ **~4 kB** gzipped

## ⚠️ Когда не использовать

- **Нужна поддержка старых браузеров** — хук требует Navigation API и URLPattern (см. таблицу версий). Для старых браузеров возьмите React Router, TanStack Router или роутер с полифиллами.
- **Нужны loaders или загрузка данных в роутере** — здесь загрузка данных не входит в зону ответственности; её делают use cases и сервисы. Если вы хотите loaders/данные «из коробки» в маршруте — подойдут React Router (loaders) или TanStack Router, но это не является правилами хорошего кода.
- **Нужно декларативное дерево маршрутов** — хук не предоставляет `<Route>` / `<Routes>`; что рендерить, вы решаете в коде по `pathname`/`params`. Если важна именно декларативная вложенная структура маршрутов — используйте один из перечисленных роутеров.
- **Нужны встроенные guards, redirects, lazy-роуты** — этого в пакете нет; реализуется в приложении поверх хука.

В остальных случаях (современные браузеры, современный React, чистая архитектура, динамические маршруты) пакет подходит.

## 🚀 Быстрый старт

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
    } = useRoute('/users/:id'); // опционально: паттерн для парсинга params

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

**Формы вызова:**

- **`useRoute()`** — без pattern и опций.
- **`useRoute(pattern)`** — только pattern (строка или PathMatcher).
- **`useRoute(pattern, options)`** — pattern и опции (например `section`).
- **`useRoute({ section: '/dashboard' })`** — только опции, без pattern (раздел под глобальным base; pathname и navigate относительно раздела).

**Параметры:**

- **`pattern`** (опционально): строка-шаблон пути (нативный **URLPattern**) или функция **PathMatcher**

    **Строка (URLPattern).** Поддерживается:

    - **Именованные параметры** — `:name` (имя как в JS: буквы, цифры, `_`). Значение сегмента попадает в `params[name]`.
    - **Опциональные группы** — `{ ... }?`: часть пути можно сделать необязательной. Один паттерн покрывает пути разной глубины; в `params` только те ключи, для которых есть сегмент в URL.
    - **Wildcard** — `*`: совпадает с «хвостом» пути; в `params` не попадает (числовые ключи из `groups` отфильтрованы).
    - **Regexp в параметре** — `:name(регулярка)` для ограничения формата сегмента (например только цифры). В `params` по-прежнему строка.

    ```typescript
    useRoute('/users/:id');
    useRoute('/elements/:elementId/*/:subElementId'); // wildcard

    // Опциональные группы
    useRoute('/users/:id{/posts/:postId}?');

    // Ограничение формата параметра (regexp)
    useRoute('/blog/:year(\\d+)/:month(\\d+)');

    // Функция-матчер (иерархия, кастомный разбор)
    const matchPost = (pathname: string) => ({ matched: pathname.startsWith('/posts/'), params: {} });
    useRoute(matchPost);
    ```

    Полный синтаксис URLPattern: [URL Pattern API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API), [WHATWG URL Pattern](https://urlpattern.spec.whatwg.org/).

    **PathMatcher** — функция, которую можно передать вместо строки, когда одного URLPattern недостаточно (иерархия сегментов, кастомная валидация, разбор через `split` или RegExp). Хук вызывает её с текущим `pathname` и подставляет возвращённые `matched` и `params` в состояние.

    - **Параметр:** `pathname: string` — текущий pathname (без origin и query).
    - **Возвращаемый тип:** `{ matched: boolean; params: RouteParams }`.
    `matched` — совпал ли путь с вашей логикой; `params` — объект «имя параметра → значение сегмента» (тип `RouteParams` = `Record<RouteParamName, RouteParamValue>`).
    - **Где использовать:** иерархические маршруты (например, `postId` только при наличии `userId`), пути с жёстким порядком сегментов, кастомные правила, которые не выразить одним URLPattern.

- **`options`** (опционально)

    - **`section`**: путь раздела под глобальным base (например `/dashboard`). `navigate(to)` по умолчанию добавляет к путям полный префикс (base + section). Комбинируется с глобальным `base` из `configureRoute`, не заменяет его. В компонентах раздела вызывайте `useRoute({ section: '/dashboard' })` и работайте с путями относительно раздела.
    - **`ignoreCase`**: при `true` матч pathname без учёта регистра (URLPattern). Только когда `pattern` — строка; для PathMatcher не используется.

**Возвращает:**

```typescript
{
    // Текущее состояние
    location: string;
    pathname: string;
    searchParams: URLSearchParams; // только чтение, не мутировать
    params: Record<string, string>;
    historyIndex: number;
    state?: unknown; // state текущей записи истории (getState() / history.state)
    matched?: boolean; // true/false при переданном pattern, иначе undefined

    // Навигация
    navigate: (to: string | URL, options?) => Promise<void>; // Navigation API; same-document при перехвате navigate + intercept()
    back: () => void;
    forward: () => void;
    go: (delta: number) => void;
    replace: (to: string | URL, options?: NavigateOptions) => Promise<void>;
    updateState: (state: unknown) => void; // обновить state текущей записи без навигации
    canGoBack: (steps?: number) => boolean;
    canGoForward: (steps?: number) => boolean;
}
```

**Опции методов `navigate` и `replace`** (один интерфейс **NavigateOptions**):

```typescript
{
    history?: 'push' | 'replace' | 'auto'; // по умолчанию из configureRoute или 'auto'
    state?: unknown;   // опциональные данные перехода (только подсказки для UX); подробнее — раздел про state ниже
    base?: string | null | false;   // полная подстановка префикса: любое falsy ('' | '/' | null | false | undefined при наличии ключа) — без префикса; иначе — полный путь (напр. '/auth')
    section?: string | null | false;  // переопределение секции: любое falsy ('' | null | false | undefined при наличии ключа) — корень приложения (только global base); '/path' — другая секция
}
```

- *`state`* — произвольные данные, которые вы передаёте вместе с переходом в `navigate(to, { state })` или `replace(to, { state })`. Используйте только для опциональных подсказок (скролл, откуда пришли, префилл формы): страница должна корректно работать и при заходе по прямой ссылке без state. Подробно: см. ниже «Параметр state: когда добавлять в историю».

    **`replace(to, options?)`** — то же, что `navigate(to, { ...options, history: 'replace' })`. Опции те же, что у **navigate** (state, base, section); поле **history** игнорируется (всегда замена записи).

    **`updateState(state)`** — обновляет state **текущей** записи истории без навигации. Подписчики хука получают новый state; URL не меняется, новая запись в истории не создаётся. Удобно для черновика формы, позиции скролла и т.п.

    **Параметр state: когда добавлять в историю и какое состояние можно передавать**

    Многие разработчики ни разу не используют state при переходах — это нормально. State нужен только в узких сценариях. Ниже — когда его стоит добавлять, какое состояние можно передавать и какое нельзя, чтобы не было недопониманий.

    **Что такое state и откуда он берётся.** State — это произвольные данные, которые вы передаёте в `navigate(to, { state })` или `replace(to, { state })`. Они сохраняются в записи истории (Navigation API) и доступны в хуке через поле **`state`** в возвращаемом объекте. **Важно:** state появляется только при программном переходе (ваш вызов navigate/replace). Если пользователь попал на тот же URL извне — ввёл адрес в строке, перешёл по букмарку, по ссылке с другого сайта, обновил страницу — для этой записи истории state нет. Поэтому поведение страницы не должно от state критически зависеть.

    **Когда нужно добавлять state в историю.** Добавляйте state только когда вы хотите передать «подсказку» для целевой страницы, которая улучшает UX при программном переходе, но не обязательна для корректной работы:

    - **Подсказка для скролла** — уходя со страницы списка, сохраняете в state позицию скролла; по «Назад» можно вернуть пользователя на то же место. Если зашли по прямой ссылке — state нет, показываете список с начала.
    - **Подсказка «откуда пришли»** — переход с поиска на карточку: в state передаёте `{ from: 'search', highlight: 'keyword' }`; на карточке можно подсветить слово. При заходе по прямой ссылке подсветки нет — страница остаётся корректной.
    - **Опциональный префилл формы** — переход «Редактировать» из списка: в state передаёте черновик; на странице редактирования при наличии state подставляете его, при отсутствии — грузите данные по id из URL/сервера.
    - **Черновик формы на текущей странице** — при вводе в форму можно периодически сохранять черновик в state текущей записи через `updateState(draft)`; по «Назад» пользователь вернётся на эту страницу с тем же state, и вы подставите черновик. Без state показываете пустую форму или грузите данные по URL.
    - **Источник перехода (аналитика, UI)** — в state передаёте `{ source: 'dashboard' }`; целевая страница может отправить это в аналитику или чуть изменить UI. При заходе по ссылке без state считаете источник «прямой» или «unknown».

    **Какое state можно передавать.** Только то, что является **опциональным улучшением**: подсказки для скролла, флаги «откуда пришли», опциональный префилл, метаданные для аналитики. Правило: целевая страница должна корректно работать и без state (при прямом заходе по URL).

    **Какое state нельзя передавать.** Не используйте state для того, без чего страница работает некорректно или неполно:

    - **Обязательные данные страницы** — например, результаты поиска только из state. При переходе по ссылке `/search?q=foo` state нет — экран пустой. Результаты должны браться из query или сервера.
    - **То, что должно быть в URL (шаринг, букмарк)** — state не попадает в URL. Если поведение страницы должно воспроизводиться по одной ссылке — используйте pathname и query, не state.
    - **Авторизация, права, критичные данные** — не опирайтесь на state: пользователь может открыть URL напрямую. Проверки — по сессии/серверу.
    - **Основной контент страницы** — что показывать, определяется URL и данными с бэкенда. State — только для подсказок, не источник правды.

    **Итог.** State в истории — опциональный инструмент для «передать что-то вместе с переходом», когда это улучшение, а не требование. Если сомневаетесь — можно не использовать; в большинстве приложений достаточно pathname, query и запросов к API.

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

Глобальная настройка один раз при старте приложения**. Повторная инициализация не предусмотрена: вызывайте `configureRoute` только при старте; смена конфига в рантайме не поддерживается (внутренние кэши и состояние не сбрасываются).

```typescript
configureRoute({
    urlCacheLimit: 50, // лимит LRU-кэша URL (по умолчанию 50)
    defaultHistory: 'replace', // history по умолчанию для всех navigate()
    base: '/app', // базовый путь: pathname без base, navigate(to) добавляет base к относительным путям
    logger: myLogger, // логгер (дефолт: console)
    initialLocation: request.url, // для SSR: начальный URL при рендере на сервере (нет window)
});
```

- *`defaultHistory`* (по-умолчанию - `'auto'`) - глобально задает поведение записи истории при навигации при помощи методов `navigate` и `replace`

- *`base`* (по-умолчанию - `'/'`) — нужен только когда **приложение располагается не в корне домена**, а по подпути. Пример: сайт `https://example.com/` — корень; ваше приложение отдаётся по `https://example.com/app/`, то есть все его маршруты физически лежат под путём `/app`. В этом случае задайте `base: '/app'`: `navigate('/dashboard')` переходит на `/app/dashboard`. Если приложение в корне домена (`https://example.com/`), глобальный `base` задавать не нужно — префикс не используется.

- *`logger`* (по-умолчанию - `console`) — объект с методами `debug`, `info`, `warn`, `error`. Если не указан — используется `console`.

- *`initialLocation`* (по-умолчанию - `'/'`)  — при SSR (нет `window`) хук не знает URL запроса. Задайте `initialLocation: request.url` (или полный URL страницы) один раз перед рендером запроса — тогда `pathname` и `searchParams` будут соответствовать запросу. На клиенте не используется. **По умолчанию задавать не нужно:** если на SSR `initialLocation` не задан, используется `'/'` (pathname и searchParams для корня).


### `clearRouteCaches()`
Метод для очистки кэшей (тесты, смена окружения)

## 🛠 Примеры

### 1. Базовая навигация (pathname, navigate)

```tsx
import { useRoute } from '@budarin/use-route';

function BasicNavigationExample() {
    const { pathname, navigate } = useRoute();

    return (
        <div>
            <p>Текущий путь: {pathname}</p>
            <button type="button" onClick={() => navigate('/posts')}>
                К постам
            </button>
            <button type="button" onClick={() => navigate('/')}>
                На главную
            </button>
        </div>
    );
}
```

### 2. Параметры пути (useRoute('/users/:id'), params)

```tsx
import { useRoute } from '@budarin/use-route';

function ParamsExample() {
    const { params, pathname, navigate } = useRoute('/users/:id');

    return (
        <div>
            <p>Pathname: {pathname}</p>
            <p>User ID из params: {params.id ?? '—'}</p>
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
            <p>Путь: {pathname}</p>
            <p>Страница: {currentPage}</p>
            <button
                type="button"
                onClick={() => navigate(`/posts?page=${currentPage - 1}`)}
                disabled={currentPage <= 1}
            >
                Пред. страница
            </button>
            <button type="button" onClick={() => navigate(`/posts?page=${currentPage + 1}`)}>
                След. страница
            </button>
        </div>
    );
}
```

### 4. История (back, forward, go, canGoBack, canGoForward)

```tsx
import { useRoute } from '@budarin/use-route';

function HistoryExample() {
    const { go, back, forward, canGoBack, canGoForward } = useRoute();

    return (
        <div>
            <button type="button" onClick={() => back()} disabled={!canGoBack()}>
                ← Назад
            </button>
            <button type="button" onClick={() => go(-2)} disabled={!canGoBack(2)}>
                ← 2 шага
            </button>
            <button type="button" onClick={() => go(1)} disabled={!canGoForward()}>
                Вперёд →
            </button>
            <button type="button" onClick={() => forward()} disabled={!canGoForward()}>
                Forward
            </button>
        </div>
    );
}
```

### 5. Push и replace (и метод replace())

```tsx
import { useRoute } from '@budarin/use-route';

function PushReplaceExample() {
    const { navigate, replace, pathname } = useRoute();

    return (
        <div>
            <p>Текущий путь: {pathname}</p>
            <button type="button" onClick={() => navigate('/step-push', { history: 'push' })}>
                Перейти (push) — в истории появится запись
            </button>
            <button type="button" onClick={() => navigate('/step-replace', { history: 'replace' })}>
                Перейти (replace через navigate)
            </button>
            <button type="button" onClick={() => replace('/step-replace-method')}>
                Перейти через replace() — то же, что history: 'replace'
            </button>
        </div>
    );
}
```

### 6. State (чтение, установка при навигации, обновление на месте)

State текущей записи истории доступен в хуке как **`state`**. Установить state при переходе — через опцию **`state`** в `navigate` или `replace`. Обновить state **текущей** страницы без перехода — **`updateState(state)`**. Используйте только для опциональных подсказок (скролл, откуда пришли, префилл формы); страница должна корректно работать и при заходе по прямой ссылке без state.

```tsx
import { useRoute } from '@budarin/use-route';

function StateExample() {
    const { state, navigate, updateState, pathname } = useRoute();

    return (
        <div>
            <p>Текущий путь: {pathname}</p>
            <p>State записи: {state != null ? JSON.stringify(state) : '—'}</p>
            <button
                type="button"
                onClick={() => navigate('/detail', { state: { from: 'list', scrollY: 100 } })}
            >
                Перейти с state
            </button>
            <button type="button" onClick={() => updateState({ draft: true, step: 2 })}>
                Обновить state текущей записи (без навигации)
            </button>
        </div>
    );
}
```

### 7. matched (совпадение pathname с pattern)

```tsx
import { useRoute } from '@budarin/use-route';

function MatchedExample() {
    const { pathname, matched, params } = useRoute('/users/:id');

    return (
        <div>
            <p>Pathname: {pathname}</p>
            <p>Pattern /users/:id совпал: {matched === true ? 'да' : 'нет'}</p>
            {matched === true ? (
                <p>User ID: {params.id}</p>
            ) : (
                <p>Это не страница пользователя (path не совпал с /users/:id).</p>
            )}
        </div>
    );
}
```

### 8. Функция-матчер (PathMatcher)

Удобно, когда один URLPattern или простой regex не справляется: иерархия (например, `postId` только вместе с `userId`), кастомная валидация, разный порядок сегментов. Ниже — матчер для `/users/:userId` и `/users/:userId/posts/:postId`: два параметра, причём `postId` допустим только после литерала `posts` и только при наличии `userId`.

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
            <p>Путь: {pathname}</p>
            <p>User ID: {params.userId}</p>
            {params.postId && <p>Post ID: {params.postId}</p>}
        </div>
    );
}
```

### 9. Глобальный base (приложение по подпути, не в корне домена)

Когда приложение располагается **не в корне домена**, а по подпути (например `https://example.com/app/` — все маршруты под `/app`), задайте в конфиге `base: '/app'`. Тогда `navigate(to)` добавляет base к относительным путям. Для одноразового перехода «вне» этого пути (например на `/login`) используйте опцию `base` в `navigate` или `replace`: `navigate('/login', { base: '' })`.

```tsx
import { useRoute, configureRoute } from '@budarin/use-route';

configureRoute({ base: '/app' });

function AppUnderBase() {
    const { pathname, navigate } = useRoute();

    return (
        <div>
            <p>Текущий путь: {pathname}</p>

            <button type="button" onClick={() => navigate('/dashboard')}>
                В дашборд → /app/dashboard
            </button>

            <button type="button" onClick={() => navigate('/login', { base: '' })}>
                На логин (/login)
            </button>

            <button type="button" onClick={() => navigate('/auth/profile', { base: '/auth' })}>
                В другой раздел (/auth/profile)
            </button>
        </div>
    );
}
```

### 10. Section в хуке (options.section)

Когда у приложения несколько разделов по своим подпутям (`/dashboard`, `/admin`, `/auth`), в компонентах раздела задайте **section**: вызовите `useRoute({ section: '/dashboard' })`. Тогда `navigate(to)` по умолчанию добавляет полный префикс (base + section). <br />
Переход в корень приложения (без секции): `navigate('/', { section: '' })`. <br />
Переход «вне» приложения: `navigate('/login', { base: '' })`.

```tsx
import { useRoute } from '@budarin/use-route';

const DASHBOARD_BASE = '/dashboard';

function DashboardSection() {
    // Section для раздела: pathname и navigate относительно /dashboard (под глобальным base, если задан)
    const { pathname, navigate } = useRoute({ section: DASHBOARD_BASE });

    return (
        <div>
            {/* При URL /dashboard/reports pathname === '/reports' */}
            <p>Раздел Dashboard. Путь: {pathname}</p>

            <button type="button" onClick={() => navigate('/reports')}>
                Отчёты → /dashboard/reports
            </button>

            <button type="button" onClick={() => navigate('/settings')}>
                Настройки → /dashboard/settings
            </button>

            {/* Переход в корень приложения (без секции) или на главную */}
            <button type="button" onClick={() => navigate('/', { section: '' })}>
                На главную
            </button>
        </div>
    );
}
```

### 11. initialLocation (SSR)

При рендере на сервере нет `window`, поэтому хук не знает URL запроса. Задайте `initialLocation` в конфиге один раз перед рендером запроса (например `request.url`) — тогда `pathname` и `searchParams` будут соответствовать запросу. На клиенте `initialLocation` не используется.

```tsx
// Серверный обработчик (псевдокод: Express, Fastify, Next и т.д.)
import { configureRoute } from '@budarin/use-route';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from './App';

function handleRequest(req, res) {
    // Один раз перед рендером этого запроса
    configureRoute({ initialLocation: req.url });

    const html = renderToStaticMarkup(<App />);
    res.send(html);
}

// В App компоненты используют useRoute() — на сервере получают pathname/searchParams из initialLocation
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

### 12. Компонент Link (пример реализации)

Минимальный пример компонента-ссылки поверх хука. Можно взять за основу и развивать под себя: активное состояние, префетч, аналитика, стили.

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

// Использование:
// <Link to="/posts">Посты</Link>
// <Link to="/users/123" replace>Профиль (replace)</Link>
```

## 🧪 Тестирование

Для unit‑тестов в jsdom‑окружении есть вспомогательный helper `setupTestNavigation` из entrypoint‑а `@budarin/use-route/testing`. Он настраивает `window.location` и `window.navigation` под указанный URL и возвращает функцию для отката.

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

it('читает pathname и params из Navigation API', () => {
    const { result } = renderHook(() => useRoute('/users/:id'));
    expect(result.current.pathname).toBe('/users/123');
    expect(result.current.params).toEqual({ id: '123' });
});
```

## ⚙️ Установка

```bash
npm i @budarin/use-route

pnpm add @budarin/use-route

yarn add @budarin/use-route
```

TypeScript: типы включены.

**`tsconfig.json` (рекомендуется):**

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

Пакет рассчитан на **React 18+**: внутри используется `useSyncExternalStore` и поведение concurrent rendering, которые официально поддерживаются начиная с React 18.

## 🌐 Браузеры и Node.js

Пакет **работает только** со средами, где есть **Navigation API** и **URLPattern**. Ограничивающие требования — версии ниже; без них хук не запустится.

| API            | Chrome/Edge | Firefox | Safari | Node.js |
| -------------- | ----------- | ------- | ------ | ------- |
| Navigation API | 102+        | 109+    | 16.4+  | —       |
| URLPattern     | 110+        | 115+    | 16.4+  | 23.8+   |


## 🎛 Под капотом

- **Navigation API:** подписка на события `navigate`, `currententrychange`; для same-origin навигации — перехват `navigate` и вызов `event.intercept()`
- `useSyncExternalStore` на navigation события
- Map для O(1) поиска `historyIndex`
- URLPattern для `:params`
- Кэш LRU parsed URL (настраиваемый лимит)
- Кэш compiled patterns
- SSR-safe (checks `typeof window`)

## 🤝 Лицензия

MIT © budarin
