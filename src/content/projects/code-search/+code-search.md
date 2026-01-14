---
published: true
name: Code Search
description: Self-hosted code search and bulk operations platform.
thumbnail: cs_preview.png
images: [cs_landing.png,cs_search_query.png,cs_search_repo.png,cs_search_result.png,cd_file_navigation.png,cs_file_shortcuts.png,cs_file_reference.png,cs_file_search.png,cs_connections.png,cs_repos.png,cs_jobs.png,cs_replace_history.png,cs_replace_preview.png]
# github: https://github.com/techquestsdev/code-search
website: https://code-search.techquests.dev
date: 2026-01-13
---

Howdy!

"Where is this function used?, "Which repos still use the deprecated API?, "Can I update this library across 50 microservices without losing my mind?"

I built **Code Search** to answer these questions and go further - not just _finding_ code, but _changing_ it at scale. It's a self-hosted platform that indexes your entire codebase and enables bulk operations with automated merge request creation.

## What It Does

**Search Instantly**: Sub-second search across all repositories using Zoekt, the same trigram-based engine Google uses internally. Regex, literal, and structural queries all supported.

**Bulk Replace**: Find patterns across hundreds of repos, make changes, and automatically create merge/pull requests - all from one command or UI workflow. Preview changes before committing, roll back if needed.

**Privacy First**: Self-hosted on your infrastructure. Your code never leaves your servers. No telemetry, no external dependencies, complete data sovereignty.

**Multi-Host Support**: Connect GitHub, GitLab, Bitbucket, and Gitea simultaneously. Mix and match code hosts in a single search.

## The Platform

Code Search is a complete ecosystem with multiple entry points:

- **Web UI (Next.js)**: Modern interface for searching code, browsing files with syntax highlighting, managing repositories, and executing bulk operations with visual diffs.
- **REST API (Go)**: Handles search, repository management, and job coordination. Fully documented with OpenAPI specs.
- **Indexer Service (Go)**: Discovers and clones repos from code hosts, then builds searchable trigram indexes. Runs continuously or on-demand.
- **CLI**: Terminal interface for power users and automation. Covered in detail in the [Code Search CLI](/projects/code-search-cli) project.

Comprehensive documentation is available at the [Code Search Documentation](/projects/code-search-documentation) site.

## Why I Built This

I started with **Hound** - a simple, fast code search tool. It worked well, but I kept hitting limitations. No bulk replace operations. No MR/PR creation. No repository management UI. Every time I needed a feature, I had to work around the tool instead of with it.

Sure, there are alternatives: **Sourcegraph** (requires Kubernetes and enterprise resources), **OpenGrok** (complex setup, Java-based), **grep.app** (SaaS, your code leaves your servers). Each has trade-offs I wasn't willing to make.

I wanted to build something for myself - a tool with exactly the features I needed, on infrastructure I control, with the flexibility to add more capabilities as my needs evolve. So I did.

**What I wanted:**

- Hound's speed and simplicity, but with bulk operations
- Self-hosted on simple Docker containers (no Kubernetes required)
- Automated find-and-replace with MR/PR creation
- A platform I can extend without fighting the architecture
- Full control: my code, my servers, my rules

## What I Learned

Building a code search platform from scratch taught me about:

**Search Performance**: Zoekt's trigram indexing is brilliant but requires careful tuning. I learned how to optimize index builds, manage memory during indexing, and parallelize operations across multiple repos.

**Distributed Systems**: Coordinating workers with Redis queues, handling concurrent index updates, and preventing race conditions when multiple indexers run simultaneously.

**API Design**: Building a REST API that serves both a Next.js frontend and a CLI required careful endpoint design - especially for streaming search results and long-running replace operations.

**Database Optimization**: PostgreSQL/MySQL sharding strategies for large repo counts, efficient metadata queries, and managing connection pools under heavy load.

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, React Query
- **Backend**: Go 1.23+, Chi router, sqlc for type-safe queries
- **Search Engine**: Zoekt (trigram-based indexing), with optional SCIP for symbol-aware search
- **Storage**: PostgreSQL or MySQL (metadata), Redis (job queues, caching)
- **Deployment**: Docker Compose for small setups, Helm charts for Kubernetes
- **Observability**: OpenTelemetry tracing, Prometheus metrics, structured logging

Designed to scale from small teams (single Docker host) to organizations with thousands of repositories (Kubernetes cluster with horizontal scaling).

## Current Status

Code Search is actively developed and production-ready. It's used internally for managing multiple microservices and has indexed over 1,000 repositories across GitHub and GitLab.

The project demonstrates modern full-stack development: Go microservices, Next.js frontend, distributed job processing, and infrastructure-as-code deployment with Helm charts.

## What's Next

The roadmap includes:

- **Saved Searches**: Bookmark frequent queries and get notifications when results change.
- **Code Intelligence**: Jump-to-definition and find-references using SCIP indexes.
- **Diff Search**: Search across commit history, not just the latest code.
- **Team Workspaces**: Shared search contexts and repository groups for teams.
