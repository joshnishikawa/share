# GitHub Copilot Custom Agent Configuration

This directory contains configuration for a custom GitHub Copilot agent designed specifically for this English vocabulary teaching application.

## Files

- **copilot-instructions.md**: Comprehensive instructions for AI coding agents working on this project
- **copilot-agent.yml**: Agent configuration defining capabilities, triggers, and conventions

## Using the Custom Agent

When collaborators work on this project with GitHub Copilot, the agent will automatically:

1. **SVG Asset Automation**: Detect new SVG files and suggest running the appropriate build scripts
2. **Vocabulary Validation**: Check for missing images/audio when vocabulary is updated
3. **Activity Guidance**: Suggest correct patterns when creating new activities or templates
4. **Localization Support**: Scan for missing translations and prompt for i18n updates
5. **Code Conventions**: Enforce project-specific patterns and naming conventions

## Agent Capabilities

### SVG Processing
- Automatically run build scripts when SVGs are added
- Validate output locations and wrapper conventions
- Check SVG filename conventions (underscores for spaces, parentheses for disambiguation)

### Vocabulary Management
- Ensure images and audio files exist for all vocabulary entries
- Validate metadata completeness
- Flag missing or incomplete entries

### Activity Development
- Guide template creation in correct locations
- Enforce wrapper conventions (`<div class="object">` or `<div class="supply">`)
- Update routing automatically

### Localization
- Scan for untranslated keys
- Prompt for updates to locale files
- Verify i18n usage patterns

## Setup for New Collaborators

1. Ensure GitHub Copilot is enabled in your IDE
2. Clone the repository
3. The custom agent configuration will be automatically detected
4. Start coding with enhanced context-aware assistance!

## Providing Feedback

If you encounter issues or have suggestions for improving the custom agent, please:
- Open an issue in this repository
- Update the agent configuration files
- Share your improvements via pull request

## References

- Main docs: [copilot-instructions.md](copilot-instructions.md)
- SVG conventions: [../public/image/svg/README.md](../public/image/svg/README.md)
- Project structure: See main README.md
