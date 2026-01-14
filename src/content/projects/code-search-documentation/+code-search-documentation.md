---
published: true
name: Code Search Documentation
description: Comprehensive documentation site for Code Search.
thumbnail: cs_docs_preview.png
images: [cs_docs_landing.png]
# github: https://github.com/techquestsdev/code-search
website: https://code-search.techquests.dev
date: 2026-01-08
---

Howdy!

Good tools need great docs. The **Code Search Documentation Site** is a comprehensive, searchable knowledge base covering everything from installation to advanced architecture for the [Code Search](/projects/code-search) platform.

## What's Inside

The documentation covers the entire platform lifecycle:

**Getting Started**: Quick start guides for Docker Compose (5 minutes), Helm/Kubernetes (production), and building from source. Includes a guided tutorial that walks through your first search and bulk replace operation.

**Web UI Guide**: Search syntax reference, filter operators, repository management, and bulk replace workflows. Annotated screenshots show exactly where to click.

**CLI Reference**: Every command documented with flags, examples, and common use cases. See the [Code Search CLI](/projects/code-search-cli) project for an overview.

**API Documentation**: OpenAPI-generated reference for all REST endpoints. Includes authentication, pagination, error handling, and webhook integration.

**Architecture Deep Dive**: Component diagrams, data flow explanations, indexing pipeline internals, and scaling strategies. Covers how Zoekt builds trigram indexes and how the scheduler coordinates workers.

**Configuration Reference**: Every environment variable, YAML option, and deployment configuration explained with examples and sensible defaults.

**Code Host Integration**: Step-by-step guides for GitHub (App and PAT), GitLab (Group and Project tokens), Bitbucket (App passwords), and Gitea. Includes troubleshooting for common permission issues.

**Troubleshooting**: Common issues, error messages, and their solutions. Covers indexing failures, search performance, and connectivity problems.

**Development**: Contributing guidelines, local setup with hot reload, building from source, and testing strategies (unit, integration, e2e).

## Why Astro + Starlight?

I chose **Astro** with the **Starlight** theme for maximum performance and developer experience:

- **Instant Load**: Static site generation means zero JavaScript required for content pages. Lighthouse scores consistently hit 100.
- **Built-in Search**: Pagefind provides client-side full-text search with fuzzy matching - no backend required, works offline.
- **MDX Support**: Write in Markdown with embedded React components for interactive examples (live API explorers, config generators).
- **Auto-Generated TOC**: Starlight handles navigation, sidebars, breadcrumbs, and tables of contents automatically from the file structure.
- **i18n Ready**: Built-in internationalization support for future translations.
- **Dark Mode**: Automatic theme switching that respects system preferences.

The result: a fast, accessible documentation site that's easy to maintain and a pleasure to read.

## Documentation as a First-Class Citizen

I treated documentation with the same care as the platform itself:

- **Version Control**: All docs live in the same repo as the code. Documentation changes go through the same PR review process.
- **CI/CD**: Automated deployments ensure docs stay current. Broken links and missing images fail the build.
- **Search**: Full-text search makes finding specific topics instant. Search results show context snippets.
- **Accessibility**: Semantic HTML, proper heading hierarchy, ARIA labels, keyboard navigation, and screen reader testing.
- **Versioning**: Documentation versions are tagged alongside code releases.

Good documentation reduces support burden and helps users succeed independently. It's not an afterthought - it's a core part of the product.

## Writing Philosophy

Every page follows a consistent structure:

1. **What** - A one-sentence explanation of the topic
2. **Why** - When and why you'd use this feature
3. **How** - Step-by-step instructions with code examples
4. **Troubleshooting** - Common issues and solutions
5. **Next Steps** - Links to related topics

Code examples are tested in CI. If the API changes, the docs break the build.

## Tech Stack

- **Framework**: Astro 4.x with Starlight theme
- **Content**: MDX with custom components for code blocks, callouts, and tabs
- **Search**: Pagefind (client-side, zero-config)
- **Hosting**: Static files on any CDN (Cloudflare Pages, Vercel, Netlify)
- **CI**: GitHub Actions for build, link checking, and deployment

Part of the [Code Search](/projects/code-search) platform.
