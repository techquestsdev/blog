---
published: true
name: Howto
description: AI-powered command-line assistant that suggests shell commands.
thumbnail: ht_preview.png
images: [ht_preview.png]
github: https://github.com/techquestsdev/howto
date: 2026-02-03
---

Howdy!

Ever find yourself constantly switching between your terminal and ChatGPT, asking _how do I compress this directory?_ or _what's the command to find large files?_

I got tired of the copy-paste dance. So I built **howto** - a CLI that brings AI command suggestions directly into your terminal workflow.

## Why I Built This

The main motivation was twofold: I wanted **GitHub Copilot support** (most similar tools lock you into OpenAI), and I wanted **my own take** on this problem with a clean, extensible codebase.

Similar tools exist, but I wanted:

- Provider flexibility (not locked into one vendor)
- Terminal injection (not just printing commands)
- Minimal configuration (auto-detect everything possible)
- A Go codebase I could extend and maintain

## The Problem

We all know the feeling. You're deep in a terminal session, need a specific command, and suddenly you're:

1. Opening a browser
2. Typing a question into ChatGPT/Claude
3. Waiting for a response
4. Copying the command
5. Pasting it back into your terminal
6. Hoping it's correct for your OS

It breaks flow. It's slow. It's 2026 and we can do better.

## Enter Howto

```bash
howto "find all .go files modified in the last 7 days"
# The command appears in your terminal: find . -name "*.go" -mtime -7
# Review it, hit Enter to execute
```

That's it. Natural language in, shell command out, inserted directly into your terminal's input buffer. You review before executing - no blind execution of AI-generated commands.

## What Makes It Different

**Multi-Provider Support** - Use OpenAI, Anthropic (Claude), Google Gemini, DeepSeek, or GitHub Copilot. Howto auto-detects which API keys you have configured and picks the best available.

**Terminal-Native** - Commands aren't just printed. On macOS and Linux, they're injected into your terminal's input buffer using `ioctl`. You see the command, you can edit it, you decide when to execute.

**Model Override** - Want to use `gpt-5` instead of the default? Pass `-m gpt-5`. Your provider, your model, your choice.

**OS-Aware** - The AI knows your operating system. Ask for "list files" and you'll get `ls -la` on Unix or `dir` on Windows.

## Real Examples

```bash
# Compression
howto "compress directory foo to tar.gz"
# → tar -czvf foo.tar.gz foo

# Docker
howto "list all running containers with their ports"
# → docker ps --format "table {{.Names}}\t{{.Ports}}"

# Disk usage
howto "show disk usage sorted by size"
# → du -sh * | sort -hr

# Git
howto "undo last commit but keep changes"
# → git reset --soft HEAD~1
```

## My Personal Setup

I use a zsh function that wraps whatever I've typed with howto. Type a natural language query, hit `Ctrl+X G`, and it runs through howto:

```bash
##### -----------------------------
##### Howto under cursor
##### -----------------------------
alias ht='howto -m "gpt-5-mini" -p "GitHub Copilot"'
howto-under-cursor() {
  BUFFER="ht $BUFFER"
  CURSOR=${#BUFFER}
  zle accept-line
}
zle -N howto-under-cursor
bindkey '^Xg' howto-under-cursor
```

Now I type `find large log files older than 30 days`, hit `Ctrl+X G`, and get the actual command. Zero friction.

## Tech Stack

- **Go 1.24+** - Fast startup, single binary distribution
- **Cobra** - CLI framework
- **Multiple AI SDKs** - OpenAI, Anthropic, Google GenAI
- **GitHub Actions** - CI with testing, linting, cross-platform releases via GoReleaser
- **Homebrew** - Easy distribution via custom tap

## Getting Started

### Install

```bash
# Homebrew (macOS/Linux)
brew install techquestsdev/tap/howto

# Go install
go install github.com/techquestsdev/howto@latest
```

### Configure

Set at least one API key:

```bash
export OPENAI_API_KEY=sk-...
# or
export ANTHROPIC_API_KEY=sk-ant-...
# or
export GEMINI_API_KEY=...
```

### Use

```bash
# Basic usage
howto "your question here"

# Dry run (just print, don't inject)
howto -d "list docker containers"

# Specific provider
howto -p Anthropic "show memory usage"

# Specific model
howto -m gpt-5-mini "count lines of code"

# See available providers
howto providers
```

## GitHub Copilot (No API Key Needed)

If you have a Copilot subscription:

```bash
gh extension install github/gh-copilot
gh auth login
# Now howto can use Copilot as a provider
```

## Provider Priority

When multiple providers are configured, howto picks in this order:

1. OpenAI
2. Anthropic
3. Gemini
4. DeepSeek
5. GitHub Copilot

Override with `--provider` or set `HOWTO_PROVIDER` environment variable.

## Try It Out

Full source: [techquestsdev/howto](https://github.com/techquestsdev/howto)

Star it, fork it, submit PRs. It's open source, cross-platform, and solves a real daily annoyance.

Stop context-switching. Start asking your terminal directly.

Happy commanding!
