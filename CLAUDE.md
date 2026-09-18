# CLAUDE.md

## Project overview

React Native mobile app built with Expo and Expo Router for the Quickfoodshop ordering experience: customer browsing (food, groceries, restaurants, grocery stores), cart, delivery address, account management, and role-based auth for `customer` / `vendor` / `rider`.

Core stack:
- Expo SDK 54, React Native 0.81, React 19.1 (New Architecture and React Compiler enabled, `typedRoutes` on)
- Expo Router (file-based routing), `expo-dev-client`
- React Context + `useReducer` for app state (no Redux/Zustand/React Query)
- AsyncStorage + Expo SecureStore for persistence
- `fetch` and Axios for API calls (see "API layer")
- React Native Paper (UI), `react-hook-form` + `zod` (forms/validation)
- `react-native-maps`, `expo-location`, `react-native-google-places-autocomplete` (delivery address/map)
- `@react-native-community/netinfo` (offline handling), `expo-local-authentication` (biometrics), `expo-notifications`

Everything is JavaScript/JSX. TypeScript is configured (`strict`) but there are no `.ts`/`.tsx` source files.

## Quick start

```bash
npm install
npx expo start          # dev server
npm run ios             # expo run:ios  (native build, not Expo Go)
npm run android         # expo run:android
npm run web             # expo start --web
npm run lint            # expo lint (eslint-config-expo, flat config)
npm test                # jest (jest-expo + React Native Testing Library)
npm run test:watch
npm run test:coverage
```

`npm run ios/android` are `expo run:*`, so they compile a native dev-client build. `/ios` and `/android` are gitignored (generated). Tests are described under "Testing". Secrets/config come from a gitignored `.env.local` (copy `.env.example`); currently only `EXPO_PUBLIC_GOOGLE_API_KEY`, read via `constants/config.js`. `npm run web` works, but maps are replaced by a placeholder (`components/MapScreen.web.jsx`) because `react-native-maps` is native-only.

`npm run reset-project` points at `scripts/reset-project.js`, which does not exist (Expo template leftover). `README.md` is the stock template too.

## Configuration

- `app.json`: name `Quickfoodshop`, scheme `quickfoodshopmobile`, bundle/package id `com.lollykrown.quickfoodshop`, portrait, EAS project configured, web output `static`.
- `package.json` `main` is `expo-router/entry`.
- `metro.config.js`: default Expo config with `resolver.useWatchman = false`. The repo sits in `~/Documents`, where macOS blocks the Watchman daemon (`Operation not permitted`) and `npx expo start` crashes in watch mode. Don't remove it unless Watchman has been granted Full Disk Access or the repo has moved. (`CI=1` hides the crash because it disables watch mode.)
- `tsconfig.json`: alias `@/*` maps to the project root (e.g. `@/contexts/authContext`).
- `jest.config.js` + `jest/`: test runner config, global native-module mocks and the `expo-router` stand-in (see "Testing").
- `eslint.config.js`: `eslint-config-expo/flat`, ignores `dist/*`, and declares Jest globals for `__tests__/` and `jest/`. Current state: 0 errors, 63 warnings (mostly unused imports/vars and `exhaustive-deps` in files not listed under "Known issues"). `npx expo-doctor` passes 18/18.
- `.vscode/settings.json` runs fixAll / organizeImports / sortMembers on save.

## Repository structure

```text
app/
  _layout.jsx              # root layout: providers, splash handling, Stack + protected dashboard
  index.jsx                # onboarding (first launch) or login/signup options
  modal.jsx                # the actual login form (formSheet modal)
  +not-found.jsx
  (auth)/                  # _layout (redirects logged-in users to /home), otp.jsx,
    [role]/                #   login.jsx (redirects to /modal), signup.jsx, forgotPassword.jsx
  (tabs)/                  # bottom tabs: home, search, myCart (index + delivery), support
  dashboard/               # authenticated: index, account (+edit-profile, changePassword),
                           #   activeRiders, favorites, invoice, notifications, orders
                           #   (+[id], confirmation, findRider, riderModal), settings,
                           #   tracking (+[id], trackingModal), transactions
  stores/                  # index, [category]/index, [category]/[id]

components/                # shared UI: ItemCard/StoreCard, SearchBar, FormInput, AddressInput,
                           #   MapScreen, CurrentLocation, Onboarding/OnbdOptions/OnbdLastScreen,
                           #   LogoutScreen, RipplePressable, ShimmerImg, EmptyState, Accordion, etc.
contexts/
  authContext.js           # AuthProvider / useAuth
  cartContext.js           # CartProvider / useCart
  DrawerProvider.js        # custom side drawer + useDrawer (open/close/toggle)
hooks/
  usefetch.js              # useFetch(fn, autoFetch) -> { data, loading, error, isOnline, refetch, reset }
  useToast.js              # useToast() -> { show(msg, 'error'|other), Toast } (render <Toast />)
  use-color-scheme(.web).js
lib/
  auth.js                  # canonical auth: login/logout/refresh + the axios client `fetchWithCred`
  secureStore.js           # SecureStore wrapper (no-op on web)
  zod.js                   # signup/login/editProfile/pwdReset/pwdChng schemas
  getLatLng.js             # geocode(address) via expo-location (currently unused)
  pushNotifications.js, notificationHandlers.js   # written but not wired into the app yet
services/
  api.js                   # public fetch helpers (stores/items/forgot+reset password/OTP)
  dashboardApi.js          # authenticated helpers using fetchWithCred: getProfile, updateProfile, changePwd
utils/
  misc.js                  # priceFormat (GBP) + menuOptions(pathname, router, role, isLoggedIn) for the drawer
  networkQueue.js          # offline request queue used by the axios interceptor
constants/colors.js        # Colors (primary #006634, etc.), light/dark tokens, Fonts
constants/config.js        # GOOGLE_API_KEY from EXPO_PUBLIC_GOOGLE_API_KEY (.env.local)
assets/images/             # logos, onboarding art, splash (assets/fonts/ is empty)

__tests__/                 # all tests; mirrors the source tree (app/, components/, contexts/, hooks/, lib/, services/, utils/, constants/)
jest/                      # setup.js (native mocks), setupAfterEnv.js (per-test reset), mocks/ (expo-router, vector-icons)
```

## Runtime architecture

### 1) App boot and providers
`app/_layout.jsx` nests, outermost first:
`AuthProvider` > `DrawerProvider` > `CartProvider` > `SafeAreaProvider` > `PaperProvider` > `Stack`.

Note `DrawerProvider` sits outside `CartProvider`, and `CartProvider` calls `useAuth()` (so it must stay inside `AuthProvider`). The splash screen is held with `SplashScreen.preventAutoHideAsync()` until `AuthProvider.loading` is false. Drawer items come from `menuOptions(...)`.

`AuthProvider` renders `children` only while `!loading`, and `logout()` sets `loading = true`, so the whole tree unmounts during logout.

### 2) Auth
Files: `contexts/authContext.js` (state) and `lib/auth.js` (network + storage). Change both together.

- `useAuth()` exposes: `user`, `userToken`, `isLoggedIn` (= `Boolean(userToken)`), `loading`, `avatar`, `isExisting`, `login(email, password, role)`, `update(payload)`, `logout()`, `biometricLogin()`, `refresh()`.
- Role selects the endpoint: customer `/auth/login`, vendor `/vendor/auth/login`, rider `/auth/rider/login`. The role is merged into the stored user object (`user.role`), and screens read `user.role` for role-specific UI. The same role -> URL ternary is repeated for forgot/reset/change password.
- Tokens: `accessToken` and `userData` are stored via `lib/secureStore.js` (keychain, no-op on web, where the app relies on cookies via `withCredentials`).
- `lib/auth.js` creates the axios instance `fetchWithCred` (baseURL, `withCredentials`, offline queue, Bearer token injection, 401 -> `refreshToken()` -> retry, else logout). `config.skipAuth` bypasses it (used by logout). `services/dashboardApi.js` imports it from here.
- Route protection: `<Stack.Protected guard={isLoggedIn}>` wraps only the `dashboard` screen in the root layout; `app/(auth)/_layout.jsx` redirects logged-in users to `/home`. Tabs, stores and cart are open to guests. `components/Guard.jsx` is unused.
- Login UI flow: `app/index.jsx` -> `OnbdOptions` (choose role) -> `/[role]/login`, which immediately `router.replace`s to `/modal?role=&prev=`; `modal.jsx` holds the real form (`react-hook-form` + `loginSchema`). Signup (`/[role]/signup`) validates then just pushes `/otp`; it makes no backend call.
- AsyncStorage flags: `alreadyLaunched` (first-launch onboarding), `existing` (returning user, chooses login vs signup), plus `address` and `cartItems_*` from the cart.

### 3) API layer
Backend base URL: `https://app.quickfoodshop.co.uk/v1`. It is defined separately in `lib/auth.js` (twice), `services/api.js` (twice: `API_BASE` and `CONFIG.BASE_URL`); keep them in sync until consolidated.

- `services/api.js` (public, unauthenticated `fetch`, `response.ok` check, `res.data`): `fetchPopularStores`, `fetchPopularDishes`, `fetchAllData`, `fetchAllStores`, `fetchStoreByID`, `fetchGroceriesStores`, `fetchRestaurants`, `fetchFood`, `fetchFoodByID`, `fetchFoodExtras`, `fetchGroceries`, `forgetPwd`, `resetPwd`, `getOTP` (alias of `forgetPwd`; same endpoint).
- `services/dashboardApi.js` (authenticated axios): `getProfile` (`/auth/profile`), `updateProfile` (`/auth/update-profile`), `changePwd` (role-specific `change-password`).
- Screens fetch with `useFetch(fn)` from `hooks/usefetch.js`, which wraps NetInfo (skips fetching when offline, refetches when back online). Wrap fetchers in `useCallback` (see `app/stores/[category]/index.jsx`), since `fetchFunction` is a dependency.
- `stores/[category]` picks its fetcher from the `category` param: `restaurants`, `grocery-stores`, `groceries`, `food`, `extras`; anything else (including `all`) falls back to `fetchAllStores`. Item detail routes as `/stores/<category>/<id>`. The home screen also links grocery sub-categories as `stores/<category-name-with-dashes>`.
- Offline: the axios request interceptor queues requests via `utils/networkQueue.js` while NetInfo reports disconnected and replays them on reconnect.

### 4) Cart and checkout
`contexts/cartContext.js` (reducer). `useCart()` exposes `cartItems`, `deliveryAddress`, `cartCount`, `totalPrice`, `addToCart(item)` (maps a backend item to `{id,name,price,quantity:1,...}`), `updateQuantity(id, delta)` (min 1), `removeItem`, `clearCart`, `setCartItems`, `setAddress`, `removeAddress`, `dispatch`.

- Persistence: items in AsyncStorage under `cartItems_<userId>` or `cartItems_guest`; delivery address under the single key `address`.
- Checkout path today: `/myCart` -> `/myCart/delivery` (Google Places autocomplete + `MapScreen` directions) -> `router.push('/payment')`. **There is no `/payment` route and no order-creation API call yet.**
- `app/dashboard/orders/index.jsx` and `transactions/index.jsx` render hardcoded mock arrays; `dashboard/index.jsx` has mock chart data. Only the profile comes from the backend.

### 5) Drawer and role menus
`DrawerProvider` is a custom `Modal` + `Animated` drawer (swipe/tap to close), not the Expo Router drawer. Menu entries per role live in `utils/misc.js` `menuOptions`. Vendor/rider entries link to routes that don't exist yet (`/dashboard/store`, `/dashboard/withdrawal`, `/dashboard/requests`), and the customer list has no rider-specific screens.

## Conventions and patterns

- Styling: inline styles and `StyleSheet.create`, `react-native-paper` components, colors from `constants/colors.js` (`Colors.primary` = `#006634`). No shared design system.
- Routing: `useRouter()` with string paths (`router.push('/dashboard')`); group folders like `(tabs)` are omitted from URLs (`/home`, `/myCart`, `/search`, `/support`). Params via `useLocalSearchParams()`. Path alias `@/` for imports.
- Forms: `react-hook-form` + `zodResolver` with schemas from `lib/zod.js`; `FormInput` is the shared controlled input.
- API errors: helpers throw `new Error(message)` (preferring the backend `message`); screens surface them via `Alert` or `useToast`.
- Money: use `priceFormat` from `utils/misc.js` (GBP).
- Mixed `.js`/`.jsx` files, no single language convention, and lots of commented-out and `console.log` debug code (including auth responses in `lib/auth.js`).

## Known issues and caveats (verified against the code)

Fixed on 2026-09-18 (don't reintroduce): `expo start` crashing on Watchman permissions (see `metro.config.js`); the non-square `app.json` icon; `npm run web` failing on `react-native-maps` (now `MapScreen.web.jsx`); the deleted broken `lib/axios.js` stub and dead `signup()` in `lib/auth.js`; `authContext.update()` importing `updateProfile` from the wrong module (it now lives in `services/dashboardApi.js`, is called as `updateProfile({ payload })`, and merges into the existing user so `role` isn't lost); `edit-profile.jsx` missing the `Keyboard` import and calling `update` with the wrong args; `editProfileSchema` requiring `phone` while the form field is `phoneNumber`; `resetPwd` overwriting the password with a hardcoded string; `stores/[category]` passing `{ searchQuery }` instead of `{ query }` (sent `search=undefined`); `removeAddress` not persisting; the `login()` user fallback that could never run; the hardcoded Google API key (now env-based); Expo SDK 54 patch versions.

Fixed on 2026-09-19 while writing the test suite (each is covered by a test): `lib/auth.js` `logout()` never called the server (`logoutAction` returned early because `logout()` had already set the guard flag); the offline request queue returned the *replayed response* as the request config, so queued requests errored even though the replay succeeded (now deferred through a custom adapter); `useFetch` only reported "No internet connection" for the contradictory `isConnected: false, isInternetReachable: true` state (now `isConnected === false`); the password-reset step never displayed `resetPwd` failures such as an expired OTP; `stores/[category]` search never refetched (effect ran once); grocery vendor links used `grocery-store` instead of the `grocery-stores` route and dereferenced `vendorId._id` unguarded; `Colors.lightGrey` was undefined; `CurrentLocation` passed a function as `style` through `RipplePressable` (ignored); `MapScreen` requested directions to `undefined,undefined` before a destination was chosen; `edit-profile` used the email keyboard for the phone field and had no placeholders; "Change Pasword" typo; `OnbdOptions` printed the raw route name ("signup") in its heading; featured-image lists used the asset itself as the React key.

Still open. Fix when touching the relevant module; don't build on them.

1. **Rotate the Google API key.** The old key is in git history. Rotate it in Google Cloud and restrict it (bundle id / package name, Places + Directions APIs only). `EXPO_PUBLIC_*` values are inlined into the app bundle, so restriction, not secrecy, is the real protection.
2. **Refresh tokens.** `login()` now saves `refreshToken`/`refresh_token` if the backend returns one, but whether it does is unverified. Without one, `refreshToken()` returns `null` and any 401 logs the user out (`biometricLogin()` inherits this).
3. **Signup is not wired to the backend.** The signup screen validates and pushes `/otp` without registering anyone; there is no register call in `lib/auth.js`. Needs the backend register endpoint.
4. **Checkout is incomplete.** `/myCart` navigates to `/payment`, which doesn't exist, and nothing creates an order. Dashboard orders/transactions/chart use hardcoded mock data. `fetchPopularStores` calls the popular-dishes endpoint (probably not the intended one).
5. **Cart quirks:** `cartCount` is the number of distinct line items, not total quantity. `ADD_ITEM` silently ignores an item already in the cart. The load effect runs once (`[]`), so the cart is not reloaded (or guest cart merged) when the user logs in or out and `storageKey` changes. The server-cart merge is stubbed (`serverCart = []`).
6. **Role menus** in `utils/misc.js` link to routes that don't exist (`/dashboard/store`, `/dashboard/withdrawal`, `/dashboard/requests`).
7. **Unused/unwired code:** `components/Guard.jsx`, `lib/getLatLng.js`, `lib/pushNotifications.js`, `lib/notificationHandlers.js` (no push setup is called anywhere), and the `Fonts` export in `constants/colors.js`.
8. **Lint warnings** (63): unused imports/vars and `react-hooks/exhaustive-deps` (e.g. `cartContext.js` effects missing `storageKey`, `MapScreen.jsx`).
9. Base URL is still duplicated in `lib/auth.js` (twice) and `services/api.js` (`CONFIG.BASE_URL`); `REMOVE_ADDRESS` naming is now consistent, but `hooks/usefetch.js` is lowercase while `useToast.js` is not.
10. `secureStore.js` intentionally does nothing on web (auth relies on cookies there), so token-based flows don't work in the web build.
11. `expo run:ios` needs Xcode; on a machine where the license hasn't been accepted it fails until `sudo xcodebuild -license accept` is run.

## Testing

Stack: `jest` 29 + `jest-expo` + `@testing-library/react-native` 13 (with `react-test-renderer` 19.1). Current state: 50 suites, 638 tests, ~98.6% statement coverage (`npm run test:coverage`; output goes to the gitignored `/coverage`).

Layout: tests live in `__tests__/`, mirroring the source tree, as `<name>.test.js`. **Never put tests under `app/`**: Expo Router turns every file there into a route. Jest runs with `watchman: false` (same macOS `~/Documents` permission problem as Metro).

Global setup (`jest/setup.js`, `jest/setupAfterEnv.js`):
- `expo-secure-store` is an in-memory keychain; seed/inspect via `require('expo-secure-store').__store` (a `Map`, cleared before every test). AsyncStorage and NetInfo use their official Jest mocks; AsyncStorage is cleared before every test.
- `expo-router` is replaced by `jest/mocks/expo-router.js`. Import helpers from it directly: `__router` (jest.fn `push/replace/back/dismiss/...`), `__setParams({...})` for `useLocalSearchParams`, `__setPathname('/x')`. `Link asChild` becomes a press that calls `router.push(href)`; `Redirect` renders `testID="redirect"`; `Slot` renders `testID="slot"`; `Stack`/`Tabs` render `testID="stack"`/`"tabs"` and each `Screen` renders `testID="screen:<name>"` with its options as JSON in `accessibilityValue.text`, tab icons as `tabicon:<name>:focused|idle`, and the badge as `badge:<name>`.
- `@expo/vector-icons` (all entry points) renders `<Text testID="icon-<name>" accessibilityLabel="<name>">`, so tests can press/find icons (`getByTestId('icon-menu')`).
- `expo-image` renders a `View` with `testID="expo-image"` (source/accessibilityLabel preserved; fire `loadEnd` to finish loading). Reanimated, safe-area-context, haptics, splash screen and status bar are mocked. `console.log` is silenced (the app logs a lot); `console.warn`/`console.error` stay visible, so a new warning usually means a real problem.

Conventions used by the existing tests:
- Mock the layer *below* what you are testing: screens mock `@/contexts/authContext`, `@/contexts/cartContext`, `@/services/api`, and the drawer (`const mockDrawer = {...}; jest.mock('@/contexts/DrawerProvider', () => ({ useDrawer: () => mockDrawer }))`). Context and service tests mock `lib/auth`, `dashboardApi`, storage, or `fetch`.
- `lib/auth.js` holds module state (`isLoggingOut`) and registers interceptors on import: its tests `jest.resetModules()` and re-require per test (`load()` helper), and give the axios instance a fake adapter.
- Screens using React Native Paper's `Snackbar`/`Appbar` are rendered inside `<PaperProvider>`.
- After `render`, flush async loads inside `act` (`await act(async () => { await new Promise((r) => setTimeout(r, 0)); })`). Use fake timers for debounces and countdowns (search 500ms, OTP resend 30s).
- Tests that pin a known gap are commented as such. When you fix the gap, update the test: `utils/misc` (`KNOWN_MISSING` menu routes), `myCart` (`Pay` -> `/payment`), `services/api` (`fetchPopularStores` endpoint), `DottedLines`/orders/dashboard mock data.
- `constants/colors.test.js` scans the source and fails if any `Colors.<token>` is undefined.

Pitfalls found the hard way:
- `jest.clearAllMocks()` does **not** reset implementations; a leftover never-resolving `mockImplementation` hangs later tests. Use `mockReset()` on the mocks you own.
- Never `mockRestore()` an already-`jest.fn` module mock such as `AsyncStorage.setItem`: it wipes the implementation for the rest of the file. Inspect `.mock.calls` instead.
- `import * as mod from '...'` includes a non-function `__esModule` key: filter with `typeof fn?.mockReset === 'function'` before iterating.
- Snapshot config objects by value: axios mutates and reuses the request config on retry, so recording the live reference gives misleading results.
- A test-runner `cd` persists in the shell between commands; use absolute paths.

## Expected development workflow

When adding or changing a feature:
1. Find the relevant route under `app/` (respect the Expo Router folder conventions and route groups).
2. Check whether a provider, hook, or API helper already exists (`useAuth`, `useCart`, `useDrawer`, `useFetch`, `useToast`, `services/*`).
3. Put network/data logic in `services/` (public -> `services/api.js`; authenticated -> `services/dashboardApi.js` via `fetchWithCred`) and keep route files thin.
4. Reuse the role -> endpoint pattern (customer/vendor/rider) for new auth-related calls rather than inventing a new one.
5. Add or update tests in `__tests__/` alongside the change (see "Testing").
6. Run `npm test` and `npm run lint`; don't add new errors or warnings to the touched files.

## Verification checklist before shipping

- `npm test` (all suites pass) and `npm run lint` (0 errors expected).
- Login/logout for at least one role on iOS or Android; confirm the drawer, `user.role` UI and `/dashboard` guard behave.
- Signed-out users cannot reach `/dashboard`; signed-in users are redirected away from `(auth)` routes.
- Cart and delivery address persist across app reloads, for guest and logged-in users.
- Store search, category lists, and store/item detail pages load real backend data (and show an error state offline).
- Forgot-password -> OTP -> reset flow still works for the changed role(s).
