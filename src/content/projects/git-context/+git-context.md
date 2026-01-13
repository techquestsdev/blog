---
published: true
name: Git Context Test Replace
description: A simple CLI tool to help you create and validate cron expressions.
thumbnail: gc_preview.png
images: [gc_preview.png]
github: https://github.com/techquestsdev/git-context
# website: https://github.com/techquestsdev/git-context
date: 2025-11-09
---

Howdy!

Ever pushed personal commits to a work repo? Or discovered 50 commits later that you've been using the wrong email address?

I used to juggle multiple `.gitconfig` files, git aliases, and mental gymnastics trying to remember which identity I was using. It was tedious, error-prone, and frankly, exhausting.

So I built **Git Context Test Replace** - a single command to switch between all your Git identities. Work, personal, freelance, school - whatever contexts you need.

## The Problem I Solved

Managing multiple Git identities is surprisingly common. Maybe you're:

- A developer with separate work and personal projects
- A contractor juggling multiple clients
- Someone who wants different GPG keys per context
- Using different SSH configurations for different Git hosts

The traditional approach? Manual config editing, repository-specific overrides, or hoping you remember to check `git config user.email` before every commit. None of these scale when you're constantly context-switching.

## Enter Git Context Test Replace

Git Context Test Replace manages profiles in a single YAML file. Define your identities once, switch between them with one command, and never commit with the wrong email again.

```bash
$ gctx list
Profile      Email                         Status
-------      -----                         ------
work         andre@work.com                ● (active)
personal     andre@personal.com
university   andre@university.edu

$ gctx switch personal
✓ Switched to profile 'personal'
ℹ User: Andre Nogueira <andre@personal.com>
```

Each profile can include everything: user identity, GPG signing keys, URL rewrites, aliases, diff tools - any Git configuration you need. Global settings apply everywhere, profile settings override.

### What Makes It Different

**Zero Context Switching** - No opening files, no environment variables, no aliases. Just `gctx switch`.

**20+ Config Sections Supported** - Not just user/email. Configure push defaults, merge strategies, delta pager settings, fetch behavior, rebase options, maintenance schedules - everything.

**URL Rewrites Per Profile** - Use different SSH configurations per context. Work repos use company SSH keys, personal repos use your personal keys.

**Safety Built-In** - Automatic `.gitconfig` backups before every switch. Confirmation prompts for destructive operations. You can always undo.

**Smart Detection** - Matches your current Git config against profiles to show which one you're using.

## Why I Built This

Honestly? I was tired of the friction. Checking my email before every commit, manually editing configs, dealing with wrong identities on pushed commits.

I also wanted to explore:

- **Modern Go Development** - CLI applications with Cobra, clean architecture patterns
- **Configuration Management** - Dynamic section handling that makes extending the tool trivial
- **Test-Driven Development** - Hit 93.7% coverage on config, 97.3% on git operations
- **DevOps Automation** - CI/CD pipeline with testing, linting (golangci-lint), security scanning (Trivy)

The result is a tool I use every day. It's fast, reliable, and invisible when it works (which is always, promise).

## Could I used another tool?

Sure! There are other multi-profile Git tools out there. But I wanted it toe be done my way:

- Simple CLI with minimal commands
- Full Git config coverage (for my use cases)
- YAML config for easy editing with global and profile sections for ease of use and backup

## Tech Stack

- **Go 1.25+** - Performance and simplicity
- **Cobra** - Battle-tested CLI framework
- **YAML** - Human-readable configuration
- **GitHub Actions** - Automated testing, cross-platform releases via GoReleaser

Architecture follows clean separation: CLI commands, config management, git operations, and UI layers all independent and testable.

## Getting Started

### Install

```bash
# Go install
go install github.com/techquestsdev/git-context@latest

# Homebrew
brew tap techquestsdev/tap
brew install git-context

# Or download from releases
```

### Basic Usage

```bash
# The way to run it
alias gctx='git-context'

# Initialize config
gctx init

# Add profiles
gctx add work
gctx add personal

# Switch contexts
gctx switch work

# Show current
gctx current

# List all
gctx list
```

### Configuration Example

```yaml
global:
  core:
    pager: delta
    editor: nvim
  push:
    autoSetupRemote: true
  merge:
    conflictstyle: diff3
  commit:
    gpgsign: true
  gpg:
    program: /usr/local/bin/gpg
  pull:
    rebase: true

profiles:
  work:
    user:
      name: 'Andre Nogueira'
      email: 'aanogueira@techquests.dev'
      signingkey: 'A0A90F4231D8B028'
    url:
      - pattern: 'git@git.techquests.dev/'
        insteadOf: 'https://git.techquests.dev/'
      - pattern: 'ssh://git@github.com/'
        insteadOf: 'https://github.com/'
    http:
      postBuffer: 157286400

  personal:
    user:
      name: 'Andre Nogueira'
      email: 'aanogueira@protonmail.com'
      signingkey: 'B1C2D3E4F5G6H7I8'
    url:
      - pattern: 'ssh://git@github.com/'
        insteadOf: 'https://github.com/'

  university:
    user:
      name: 'Andre Nogueira'
      email: 'aanogueira@university.edu'
      signingkey: 'C1D2E3F4G5H6I7J8'
```

Configuration lives at `~/.config/git-context/config.yaml`. Edit manually or use the interactive `gctx add` command - limited to profile creation, since I wanted to keep it simple.

## Real-World Use

I switch contexts dozens of times a day. Working on a side project? `gctx switch personal`. Back to work? `gctx switch work`. Contributing to open source? `gctx switch oss`.

Each switch updates my entire Git config - identity, signing keys, URL rewrites, aliases. One command, instant context shift.

No more "oops wrong email" commits. No more checking configs. Just work.

## Try It Out

Full source available at: [techquestsdev/git-context](https://github.com/techquestsdev/git-context)

Whether you're managing multiple jobs, separating personal and professional work, or just want to stop worrying about Git identities, give it a try.

It's open source, cross-platform, and solves a real problem.

Happy committing!
