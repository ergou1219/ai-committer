# Change Log

All notable changes to the "ai-committer" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

## [0.0.1] - 2026-01-28

### Added

- Generate commit messages from staged changes and write them into the VS Code Source Control input box.
- OpenAI-compatible provider support via Vercel AI SDK v5 (`ai` + `@ai-sdk/openai-compatible`).
- Commit style selection: `conventional` / `simple` / `auto` (auto infers style from git history; uncertain falls back to `simple`).
- Strict Conventional rules: if `!` is used, require `BREAKING CHANGE: ...` in the body; reject invalid output.
- Git (SCM) view title button for one-click generation.
- Global API key storage via VS Code SecretStorage.
- Packaging support: `pnpm run vsix` to produce a `.vsix`.
- GitHub Actions workflow to build `.vsix` on push/PR and attach it to Releases on `v*` tags.
- WTFPL v2 license and repository metadata.
