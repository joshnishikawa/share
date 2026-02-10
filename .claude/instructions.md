# AI Agent Instructions for Share English Teaching App

## Project Overview
This is a Node.js/Express web application for teaching English vocabulary, integrating EJS templating, Socket.IO, MySQL, and i18n for localization. The app serves interactive activities for students and teachers, using a large vocabulary dataset and SVG-based visual assets.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express
- **Templating**: EJS
- **Database**: MySQL
- **Real-time**: Socket.IO
- **Localization**: i18n
- **Frontend**: Vanilla JavaScript, SVG

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

## Agent Capabilities & Automated Workflows

AI agents working on this project should proactively assist with these capabilities:

### 1. SVG Asset Automation
**When**: New SVG files are added to the project
**Actions**:
- Detect SVG additions in `public/image/svg/objects/` or `public/image/svg/supplies/`
- Automatically run the appropriate build script:
  - `node build_object_ejs.js` for objects
  - `node build_supply_ejs.js` for supplies
  - `node process_svgs.js` for general SVG processing
- Validate output locations:
  - EJS templates: `views/activities/objects/room/` or `views/activities/things/supplies/`
  - JS definitions: `public/javascripts/supplies_svg.js`
- Check SVG filename conventions:
  - Use underscores for spaces
  - Use parentheses for disambiguation
  - Reference: `public/image/svg/README.md`
- Verify proper wrapper conventions in generated files

### 2. Vocabulary Management
**When**: `public/vocabulary.js` is modified
**Actions**:
- Check that corresponding images exist in `public/image/` for each vocabulary entry
- Check that corresponding audio exists in `public/audio/` for each vocabulary entry
- Validate metadata completeness for all entries:
  - Required fields: `id`, `book`, `theme`, `meaning`, `image`, `audio`
- Flag missing or incomplete entries
- Prompt for asset uploads when missing

### 3. Activity & Template Guidance
**When**: New activities or templates are being created
**Actions**:
- Suggest correct template location in `views/activities/`
- Enforce proper wrapper conventions:
  - Objects: `<div class="object" data-shape="...">`
  - Supplies: `<div class="supply" data-shape="...">`
- Update routing in `routes/main.js`:
  - Ensure routes follow pattern: `/activities/:activity` and `/activities/:activity/:id`
  - Verify deck data source (DB `links` table or `vocabulary.js`)
- Guide deck structure (arrays of word IDs or objects)

### 4. Localization Support
**When**: Code, templates, or locale files are modified
**Actions**:
- Scan for untranslated keys in code and templates
- Prompt for updates to `locales/en.json` and `locales/ja.json`
- Verify proper i18n usage: `req.__(...)`
- Ensure translation completeness across both languages
- Check that new UI strings are added to both locale files

### 5. Deck & Routing Validation
**When**: Activity routes or deck handling is modified
**Actions**:
- Validate POST/GET flows for activities
- Check deck structure and data sources
- Ensure DB links in `links` table are correctly created and referenced
- Verify deck data is properly passed to templates

### 6. Framework Migration Assistance
**When**: Refactoring or modernization is needed
**Actions**:
- Flag non-standard patterns
- Suggest refactor targets
- Automate repetitive migration steps
- List files using legacy patterns and suggest modern replacements

## Automated Triggers Summary

| Trigger | Condition | Automated Response |
|---------|-----------|-------------------|
| SVG Added | New file in `public/image/svg/` | Run appropriate build script, validate output |
| Vocabulary Updated | Changes to `public/vocabulary.js` | Check for missing images/audio, validate metadata |
| Activity Created | New template in `views/activities/` | Guide location, enforce wrappers, update routing |
| Localization Changed | Modifications to locale files or i18n calls | Scan for missing translations, verify completeness |
| Route Modified | Changes to routing files | Validate deck handling and data flow |

## References
- **Main server**: `share.js`
- **Routing**: `routes/main.js`, `routes/teachers.js`, `routes/media.js`, `routes/labs.js`, `routes/letters.js`, `routes/things.js`, `routes/io.js`
- **Views**: `views/activities/`, `views/tools/`, `views/students/`, `views/teachers/`
- **Assets**: `public/image/`, `public/audio/`, `public/vocabulary.js`
- **SVG conventions**: `public/image/svg/README.md`
- **SVG processors**: `build_object_ejs.js`, `build_supply_ejs.js`, `process_svgs.js`
- **Localization**: `locales/en.json`, `locales/ja.json`

## Setup for AI Agents

When working on this project, AI agents should:

1. **Detect project structure** by reading this configuration file
2. **Apply automated workflows** based on file changes and triggers
3. **Validate changes** against project conventions before committing
4. **Suggest improvements** when non-standard patterns are detected
5. **Provide context-aware assistance** using the architecture and conventions outlined above

## Development Commands

```bash
# Start development server
nodemon share.js

# Build SVG assets
node build_object_ejs.js      # Process object SVGs
node build_supply_ejs.js      # Process supply SVGs
node process_svgs.js          # General SVG processing
npm run build-svgs            # Run all SVG builds

# Testing
npm test

# Database connection
# MySQL pool configured in routes/main.js
# Credentials from .env: PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
```

## Providing Feedback

This configuration evolves with the project. To improve it:
- Update this file directly with new patterns and conventions
- Add new automated workflows as they're identified
- Document edge cases and special handling requirements
- Share improvements via pull requests or issue reports

---
_Last updated: 2026-02-06_
_This file is maintained in `.claude/instructions.md` and serves as the primary reference for AI coding agents._
