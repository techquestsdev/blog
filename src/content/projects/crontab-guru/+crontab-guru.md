---
published: true
name: Crontab Guru
description: An interactive terminal-based cron expression editor built with Go.
thumbnail: cg_demo_0.png
images: [cg_demo_1.png, cg_demo_2.png, cg_demo_3.png, cg_demo_4.png, cg_demo_5.png, cg_demo_6.png]
github: https://github.com/techquestsdev/crontab-guru
# website: https://github.com/techquestsdev/crontab-guru
date: 2025-11-05
---

Howdy!

Ever found yourself staring at a cron expression like `0 9 * * MON-FRI` and thinking, "Wait, does this run at 9 AM on weekdays or at midnight on Mondays?"

Yeah, me too.

That's why I built **Crontab Guru** - think of it as [crontab.guru](https://crontab.guru/) but right in your terminal. No browser. No leaving your shell. Just a clean, fast, beautiful TUI that gives you instant feedback on your cron expressions.

## The Problem I Solved

Cron expressions are powerful but... let's be honest - they're cryptic. Those five little fields packed with numbers, asterisks, and ranges are compact, sure, but they're also error-prone. And when you get it wrong, your scheduled job either doesn't run or runs at the wrong time.

The traditional solutions? Either:

1. Open crontab.guru in your browser (context switching)
2. Use online web tools (slow, requires leaving your terminal)
3. Memorize the format (good luck under pressure)
4. Guess and check in production (oof)

None of these are ideal, especially for developers who live in their terminals.

## Enter Crontab Guru

**Crontab Guru** is a terminal UI application built with Go and [Bubble Tea](https://github.com/charmbracelet/bubbletea) that brings the power of cron expression editing directly to your terminal - no browser needed. It's fast, beautiful, and actually _helpful_.

## Key Features

- **Real-time Validation** - See errors instantly as you type, field by field
- **Human-Readable Descriptions** - Your cron expression gets explained in plain English
- **Next Run Times** - Preview exactly when your job will execute next
- **Beautiful TUI** - Colorful, responsive terminal interface that just works
- **Clipboard Integration** - Copy your expression with a single keystroke

## How to Use

1. Launch the application with `crontab-guru`.
2. Use **Tab**, **Space**, or **Enter** to navigate between fields.
3. Type your cron expression values (minute, hour, day, month, weekday).
4. See the description and next run times update in real-time.
5. Press **y** to copy the final expression to your clipboard.
6. Press **Esc** or **Ctrl+C** to quit.

## Examples

| Expression        | Description              |
| ----------------- | ------------------------ |
| `* * * * *`       | Every minute             |
| `0 * * * *`       | Every hour               |
| `0 0 * * *`       | Every day at midnight    |
| `0 9 * * MON-FRI` | At 9:00 AM on weekdays   |
| `*/15 * * * *`    | Every 15 minutes         |
| `0 9,17 * * *`    | At 9:00 AM and 5:00 PM   |
| `0 0 1 * *`       | First day of every month |
| `0 0 * * SUN`     | Every Sunday at midnight |

## Why I Built This

I wanted to explore and sharpen my skills with:

- **Go** - Building CLI applications with strong performance and simplicity
- **Bubble Tea** - Creating elegant terminal UIs following the Elm Architecture pattern
- **TDD and Testing** - High code coverage ensures reliability
- **DevOps Perspective** - Solving a real problem that ops engineers and developers face daily

Plus, I wanted to prove that terminal applications don't have to be ugly or confusing - they can be delightful.

## Tech Stack

- **Language:** [Go](https://go.dev/) 1.25.3+
- **UI Framework:** [Bubble Tea](https://github.com/charmbracelet/bubbletea) (Elm Architecture pattern)
- **Architecture:** Model-View-Update (MVU) pattern
- **Testing:** Comprehensive unit and integration tests with high coverage

## Getting Started

Check the [GitHub repository](https://github.com/techquestsdev/crontab-guru) for full installation instructions (Homebrew, Go, or binaries).

### Keyboard Shortcuts

| Shortcut         | Action                       |
| ---------------- | ---------------------------- |
| `Tab` / `Space`  | Next field                   |
| `Shift+Tab`      | Previous field               |
| `y`              | Copy expression to clipboard |
| `?`              | Toggle help text             |
| `Esc` / `Ctrl+C` | Quit                         |

## Try It Out

The full project is open source and available on GitHub:
[**techquestsdev/crontab-guru**](https://github.com/techquestsdev/crontab-guru)

Whether you're scheduling backups, cleanup jobs, or monitoring tasks, **Crontab Guru** makes it faster and less error-prone than ever.

No more "Wait, did I get that right?" moments. Just clarity, speed, and a terminal app that actually makes you smile.

Happy scheduling!
