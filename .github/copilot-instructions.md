# Copilot Instructions for AI Coding Agents

## Project Overview
This is a Node.js/Express web application for teaching English vocabulary, integrating EJS templating, Socket.IO, MySQL, and i18n for localization. The app serves interactive activities for students and teachers, using a large vocabulary dataset and SVG-based visual assets.

## Architecture & Key Components
- **Express server** (`share.js`): Main entry, sets up routes, view engine, static assets, localization, and error handling.
- **Routes** (`routes/`): Modular route handlers for main app logic, teachers, media, labs, letters, things, and Socket.IO integration.
- **Views** (`views/`): EJS templates for activities, tools, students, teachers, and menus. Activities are grouped by type and audience.
- **Public assets** (`public/`): Contains images (SVG, PNG, etc.), audio, vocabulary data, and client-side JS for activities.
- **Vocabulary** (`public/vocabulary.js`): Large array of word objects with metadata (id, book, theme, meaning, image, audio).
- **SVG Processing Scripts** (`build_object_ejs.js`, `build_supply_ejs.js`, `process_svgs.js`): Used to generate EJS templates and JS definitions from SVG files for activities and supplies.
- **Localization** (`locales/en.json`, `locales/ja.json`): i18n JSON files for English/Japanese translations.

## Developer Workflows
- **Run/Debug**: Start server with `nodemon share.js` (see `package.json` script). App listens on port from `.env` (`PORT`).
- **Build SVG Assets**: Run `build_object_ejs.js`, `build_supply_ejs.js`, or `process_svgs.js` to generate EJS/JS from SVGs. Output goes to `views/activities/objects/room/`, `views/activities/things/supplies/`, or `public/javascripts/supplies_svg.js`.
- **Database**: MySQL credentials from `.env`. Main pool in `routes/main.js`. Links table used for activity decks.
- **Localization**: Add translations to `locales/en.json` and `locales/ja.json`. i18n auto-reloads.

## Project-Specific Patterns & Conventions
- **SVG Filenames**: Use underscores for spaces, parentheses for disambiguation (see `README.md` in `public/image/svg/`).
- **Activity Routing**: Activities are rendered via `/activities/:activity` and `/activities/:activity/:id` endpoints, with deck data from DB or vocabulary.js.
- **Decks**: Decks are arrays of word IDs or objects, passed via POST or stored in DB (`links` table).
- **EJS Wrappers**: SVGs are wrapped in `<div class="object" data-shape="...">` or `<div class="supply" data-shape="...">` for activities.
- **Error Handling**: 404 and general errors render EJS templates (`404.ejs`, `error.ejs`).
- **Localization Usage**: Use `req.__(...)` for translating themes and UI strings.

## Integration Points
- **Socket.IO**: Real-time features via `routes/io.js` and server setup in `share.js`.
- **MySQL**: Used for storing activity links and retrieving decks.
- **External APIs**: Google Translate and other translation packages in dependencies.

## Examples
- To add a new activity, create an EJS template in `views/activities/`, add a route in `routes/main.js`, and update deck handling as needed.
- To add new vocabulary, update `public/vocabulary.js` and ensure images/audio are present in `public/image/` and `public/audio/`.
- To process new SVGs, run the relevant build script and commit the generated files.

## Custom Agent Integration
To maximize productivity and consistency, set up a custom agent with the following responsibilities:

- **SVG Asset Automation**: Run `build_object_ejs.js`, `build_supply_ejs.js`, and `process_svgs.js` when new SVGs are added. Validate output locations and wrappers.
- **Vocabulary Sync**: When updating `public/vocabulary.js`, ensure corresponding images and audio exist. Flag missing assets and check metadata completeness.
- **Activity & Template Guidance**: Suggest correct locations for new activities (EJS templates in `views/activities/`), enforce `<div class="object" ...>` or `<div class="supply" ...>` wrappers, and update routing in `routes/main.js`.
- **Localization Support**: Scan for untranslated keys in code and templates, prompt updates to `locales/en.json` and `locales/ja.json`, and verify i18n usage (`req.__(...)`).
- **Deck & Routing Validation**: Check POST/GET flows for activities, validate deck structure, and ensure DB links are correctly created and referenced.
- **Framework Migration Assistance**: Flag non-standard patterns, suggest refactor targets, and automate repetitive migration steps.

### Example Agent Tasks
- On SVG addition: Run build scripts, check for correct EJS/JS output, and commit changes.
- On vocabulary update: Scan for missing images/audio, prompt for asset uploads, and verify metadata.
- On new activity/template: Suggest file locations, update routing, and enforce wrapper conventions.
- On localization change: Scan for untranslated keys and prompt for JSON updates.
- On refactor/migration: List files using legacy patterns and suggest modern replacements.

Document agent behaviors and triggers here as they evolve. Feedback and new automation ideas are welcome.

## References
- Main server: `share.js`
- Routing: `routes/main.js`, `routes/teachers.js`, etc.
- Views: `views/activities/`, `views/tools/`, `views/students/`, `views/teachers/`
- Assets: `public/image/`, `public/audio/`, `public/vocabulary.js`
- SVG conventions: `public/image/svg/README.md`

---
_Review and update this file as project structure or conventions evolve. Feedback welcome for unclear or missing sections._
