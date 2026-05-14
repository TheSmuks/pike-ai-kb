# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Fixed
- `pike-signature`, `pike-describe-symbol`, and `pike-list-methods` now resolve C-level predef builtins (e.g., `write`, `werror`, `arrayp`, `all_constants`) via an `all_constants()` fallback when `master()->resolv()` fails (#11)

## [1.0.0] - 2026-04-22

### Added
- Adopted ai-project-template structure (AGENTS.md, CI workflows, .omp/ configuration)
- ARCHITECTURE.md documenting system design
- CONTRIBUTING.md with project conventions
- GitHub Actions CI (build, lint, commit-lint, changelog-check, blob-size-policy)
- .devcontainer with Node.js 22 + Pike
- .omp/ agents for Pike KB review and gap analysis
