# Contributing to pike-ai-kb

Thank you for your interest in contributing! This document covers the essentials.

## Quick Start

1. Fork the repository
2. Create a feature branch (see [Branch Naming](#branch-naming))
3. Make your changes
4. Update [CHANGELOG.md](./CHANGELOG.md) under `## [Unreleased]`
5. Open a pull request

## Branch Naming

Use descriptive, conventional branch names:

- `feat/add-json-module-docs`
- `fix/correct-string-range-syntax`
- `docs/update-sql-reference`
- `chore/update-dependencies`

## Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(sql): add documentation for Sql.Sql template queries
fix(types): correct multiset type annotation example
docs(readme): clarify installation options
chore(deps): bump dev dependencies
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`

## Changelog

This project follows [Keep a Changelog](https://keepachangelog.com/). Add entries under `## [Unreleased]` using the appropriate section:

- **Added** — new features, modules, or documentation
- **Changed** — changes to existing behavior
- **Deprecated** — features slated for removal
- **Removed** — features removed in this release
- **Fixed** — bug fixes
- **Security** — vulnerability fixes

## Pull Requests

- Keep PRs focused — one concern per PR
- Ensure CI passes before requesting review
- Include tests for new behavior
- Reference related issues when applicable

## Code Style

- TypeScript: 2-space indentation
- YAML: 2-space indentation
- Markdown: 4-space indentation (where applicable)
- LF line endings, UTF-8 encoding

## License

By contributing, you agree that your contributions will be licensed under the MIT license.
