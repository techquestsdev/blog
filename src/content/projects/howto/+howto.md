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

# Networking
howto "check which process is listening on port 8080"
# → lsof -i :8080
```

## Options & Providers

Howto supports multiple AI providers (OpenAI, Anthropic, Gemini, DeepSeek, and GitHub Copilot). It auto-detects your API keys and picks the best available provider.

```bash
# Dry run (print command without inserting into terminal)
howto -d "list docker containers"

# Use a specific model or provider
howto -m gpt-4-turbo -p OpenAI "count lines of code"

# See available providers
howto providers
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

## Try It Out

Full source and installation instructions are available at: [techquestsdev/howto](https://github.com/techquestsdev/howto)

Stop context-switching. Start asking your terminal directly.

Happy commanding!
