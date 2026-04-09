# Backend Audit

## 1) Security Vulnerabilities & Bugs

- [x] `routes/things.js` `dressup/:type` **Path Traversal via `res.render()`**: `req.params.type` is interpolated directly into a `res.render()` template path (`activities/things/dressup_${req.params.type}.ejs`). A crafted `:type` like `../../head` could render arbitrary EJS files. Same issue in `routes/labs.js` catch-all `/:activity` → `res.render('labs/' + activity)`. Should whitelist allowed values. **FIXED: Added whitelist arrays to both routes.**
- [x] `routes/vocab.js` `GET /:activity/:id` **Path Traversal via `res.render()`**: `req.params.activity` is interpolated into `res.render()`. The `valid()` function validates on POST, but the GET handler does **no whitelist check** — a crafted URL could traverse to arbitrary templates. **FIXED: Added same whitelist check as POST handler.**
- [x] `routes/_MAIN.js` `GET /interview` **Path Traversal via `fs.readdir()`**: `req.query.book` is interpolated into `fs.readdir()` path. A crafted `?book=../../` could list arbitrary directories. **FIXED: Added whitelist of valid book names.**
- [x] `routes/_MAIN.js` `GET /api/any-vocab` **JSON parse of query param**: `JSON.parse(req.query.deck)` on untrusted query input. Malformed input throws and the catch sends the raw error (`res.send(err)`), leaking stack traces. **FIXED: Error handler now uses `res.status(500).render('error')`.**
- [x] **`res.send(err)` leaks stack traces in production**: ~20+ catch blocks across routes (`_MAIN.js`, `teachers.js`, `things.js`, `labs.js`, `media.js`, `multiplayer/*`) send raw error objects to the client. Exposes internal paths, DB schema, and stack traces. **FIXED: All replaced with `res.status(500).render('error')`.**
- [x] `sockets/_MULTIPLAYER.js` **No input validation on socket data**: All socket event handlers (`join`, `getName`, `setColor`, `chooseActivity`, etc.) trust `data` from clients without validation. Malicious clients can send non-strings for `data.roomname`, objects for `data.id`, or inject HTML via `data.id`/`data.color` that gets broadcast to other players. **FIXED: Added `isStr()` and `sanitizePlayerData()` validators to all handlers.**
- [x] `config/passport.js` **DB pool with fallback credentials**: Pool defaults to `user: 'root'`, `password: ''` if env vars are missing. Same in `routes/_MAIN.js`, `routes/teachers.js`, `routes/vocab.js`. Misconfigured `.env` silently connects with root/no-password. Should fail-fast like `SESSION_SECRET`. **FIXED: Created shared `config/db.js` with fail-fast check. All routes use it.**
- [x] `share.js` **`saveUninitialized: true`**: Creates a session row in MySQL for every visitor (including bots/crawlers) before authentication. **KEPT AS TRUE: Passport requires an existing session before the OAuth callback. Setting to `false` breaks the return URL flow.**
- [x] `share.js` **No `Helmet` middleware**: No security headers (X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, etc.). `helmet` is a one-line addition that sets sensible defaults. **FIXED: Added helmet with CSP disabled and `referrerPolicy: 'same-origin'` (needed for OAuth returnTo).**
- [x] `share.js` **50MB JSON body limit**: `express.json({ limit: '50mb' })` is extremely generous — the largest legitimate POST is a 2MB canvas sync. Enables denial-of-service via large payloads. **FIXED: Reduced to 5MB.**

## 2) Inconsistencies & Structure

- [x] **Duplicate DB pools**: `config/passport.js`, `routes/api.js`, `routes/_MAIN.js`, `routes/teachers.js`, and `routes/vocab.js` each create their own `mysql.createPool()` with the same credentials. That's 5 separate pools (up to 50 connections) for one database. **FIXED: Created shared `config/db.js`. All files import from it.**
- [x] **`body-parser` is redundant**: `require()`'d and `.use()`'d in `routes/_MAIN.js` and `routes/labs.js`, but `express.json()` and `express.urlencoded()` are already configured in `share.js`. Express 4.16+ includes body-parser — the separate package is dead weight. **FIXED: Removed from routes and uninstalled.**
- [x] **`cookie-parser` in dependencies but never used**: Listed in `package.json` but never `require()`'d or `app.use()`'d anywhere. **FIXED: Uninstalled.**
- [x] **`esm` in dependencies but never used**: Listed in `package.json` but the app uses `require()` (CommonJS) everywhere. **FIXED: Uninstalled.**
- [x] **`translate` and `google-translate-api-jp` in dependencies but never used**: Neither is `require()`'d in any backend file. **FIXED: Uninstalled.**
- [ ] **Mixed API route locations**: Some API endpoints live in `routes/api.js` (`/api/user`, `/api/sync/*`, `/api/preferences/*`), others in `routes/_MAIN.js` (`/api/any-vocab`, `/api/nh-vocab`). Two files serving `/api/*` at different mount points.
- [x] **`NH_colors` defined twice**: Identical object in `routes/_MAIN.js` and `routes/teachers.js`. **FIXED: Extracted to `config/nh_helpers.js`.**
- [x] **`getNHVocab()` duplicated**: Same vocab filtering/grouping logic in `routes/_MAIN.js` and `routes/teachers.js`. **FIXED: Extracted to `config/nh_helpers.js`.**

## 3) Opportunities to Simplify

- [x] **Remove unused dependencies**: `body-parser`, `cookie-parser`, `esm`, `translate`, `google-translate-api-jp` — 5 packages adding install time and audit surface for zero benefit. **FIXED: All 5 uninstalled. Also ran `npm audit fix` to resolve 4 vulnerabilities (0 remaining).**
- [x] **Shared DB pool module**: Create `config/db.js` exporting a single pool. All routes and passport import from there. Reduces max connections from ~50 to ~10. **FIXED.**
- [x] **Shared vocabulary helpers**: Extract `getNHVocab()` and `NH_colors` to a utility module used by both `_MAIN.js` and `teachers.js`. **FIXED: `config/nh_helpers.js`.**
- [x] **Standardize error handling**: Replace all `res.send(err)` with `res.status(500).render('error')` or `next(err)` to use the existing global error handler. Fixes the stack trace leak at the same time. **FIXED.**
- [x] **Whitelist dynamic `res.render()` paths**: Add validation arrays before the 3 routes that interpolate user input into template paths (`dressup/:type`, `labs/:activity`, `vocab GET /:activity/:id`). **FIXED.**
