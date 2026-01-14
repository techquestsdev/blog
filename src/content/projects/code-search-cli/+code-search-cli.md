---
published: true
name: Code Search CLI
description: Terminal interface for search automation and scripting.
thumbnail: cs_cli_preview.png
images: [cs_cli_preview.png, cs_cli_replace.png, cs_cli_replace_preview.png, cs_cli_search.png, cs_cli_search_preview.png]
# github: https://github.com/techquestsdev/code-search
website: https://code-search.techquests.dev
date: 2026-01-14
---

Howdy!

The Web UI is great for exploration, but when you need automation, you want a CLI. The **Code Search CLI** is a standalone binary that connects to the [Code Search](/projects/code-search) API server and brings the full power of the platform to your terminal.

## Installation

Grab the latest binary from GitHub releases:

```bash
# macOS (Apple Silicon)
curl -L https://github.com/techquestsdev/code-search/releases/latest/download/code-search-darwin-arm64 -o code-search
chmod +x code-search && sudo mv code-search /usr/local/bin/

# Linux (amd64)
curl -L https://github.com/techquestsdev/code-search/releases/latest/download/code-search-linux-amd64 -o code-search
chmod +x code-search && sudo mv code-search /usr/local/bin/
```

Configure the API endpoint:

```bash
code-search config set api-url https://search.yourcompany.com
code-search config set api-token YOUR_TOKEN
```

## Built for Power Users

I designed the CLI for scenarios where you need to script, automate, or integrate code search into larger workflows:

**Terminal Search**: Query from your shell and get results in JSON, table, or CSV format.

```bash
code-search search "deprecated" --repo "myorg/*" --lang go --format json
```

**Bulk Operations**: Find and replace across dozens of repos with automatic MR creation.

```bash
code-search replace "v1.0.0" "v2.0.0" \
  --repo "myorg/*" \
  --file "go.mod" \
  --create-mr \
  --title "Upgrade to v2.0.0" \
  --branch "chore/upgrade-v2"
```

**CI/CD Integration**: Fail builds if forbidden patterns are found (hardcoded secrets, deprecated APIs, etc.).

```bash
# In your CI pipeline - exits non-zero if matches found
code-search search "(?i)password\\s*=\\s*['\"][^'\"]+['\"]" \
  --repo "$REPO" \
  --exit-code \
  --quiet

# Count TODOs and fail if over threshold
TODO_COUNT=$(code-search search "TODO|FIXME" --repo "$REPO" --format json | jq '.total')
if [ "$TODO_COUNT" -gt 10 ]; then
  echo "Too many TODOs: $TODO_COUNT (max: 10)"
  exit 1
fi
```

**Repository Management**: Sync repos, trigger re-indexing, and check index status.

```bash
# List all indexed repositories
code-search repos list --format table

# Trigger re-index for specific repos
code-search repos reindex "myorg/api-gateway" "myorg/auth-service"

# Check indexer status
code-search status
```

## Why This Matters

The CLI enables workflows that are tedious or impossible through a UI:

- **Scripting**: Chain search results into other tools (`xargs`, `jq`, custom scripts).
- **Automation**: Schedule nightly scans for deprecated patterns.
- **Consistency**: Enforce coding standards across all repositories.
- **Speed**: No UI loading, just direct terminal-to-API communication.

## Design Philosophy

I followed Unix principles:

- **Do one thing well**: Each command has a single, clear purpose.
- **Composable**: Output formats (JSON, CSV, table) work with standard tools.
- **Scriptable**: Exit codes reflect success/failure for reliable automation.
- **Fast**: Single binary, no dependencies, instant startup.

## Tech Stack

- **Go**: Single static binary - no runtime dependencies, cross-compiled for macOS, Linux, and Windows.
- **Cobra**: Standard command-line library for Go with automatic help generation and shell completions.
- **OpenAPI Client**: Auto-generated bindings to the REST API using oapi-codegen.
- **Viper**: Configuration management supporting env vars, config files, and flags.

Works seamlessly with `jq`, `grep`, `xargs`, and Unix pipelines. Output is designed to be machine-readable when you need it, human-readable when you don't.

## Shell Completions

Enable tab completion for faster workflows:

```bash
# Bash
code-search completion bash > /etc/bash_completion.d/code-search

# Zsh
code-search completion zsh > "${fpath[1]}/_code-search"

# Fish
code-search completion fish > ~/.config/fish/completions/code-search.fish
```

Part of the [Code Search](/projects/code-search) platform.
