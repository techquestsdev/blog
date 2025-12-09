---
published: true
name: (Mac)Free
description: Bringing the Linux free Command to macOS
thumbnail: free_preview.png
images: [free_preview.png]
github: https://github.com/techquestsdev/mac-free
# website: https://github.com/techquestsdev/mac-free
date: 2025-12-09
---

`TL;DR`: I built a `free` command replacement for macOS because I missed it from Linux. It's open source and written in C.

## The Problem

If you've spent any time on Linux, you've probably typed `free -h` hundreds of times. It's the quickest way to check memory usage from the terminal.

Then you switch to macOS and... nothing.

```shell
$ free

zsh: command not found: free
```

Your options become:

- Open Activity Monitor (requires leaving the terminal, unthincable...)
- Run some obscure `vm_stat` command and do math
- Write a janky shell script

None of these felt right.

## The Solution

I decided to build **mac-free** - a native C utility that replicates the Linux `free` command on macOS.

```shell
$ free -h
              total        used        free      shared  buff/cache   available
Mem:         16.0Gi       8.0Gi       2.0Gi     512.0Mi       6.0Gi       8.0Gi
Swap:         2.0Gi     512.0Mi       1.5Gi
```

Looks familiar, right?

## Features

- **Multiple output formats** - bytes, KiB, MiB, GiB, or human-readable
- **Wide mode** - shows macOS-specific categories (active, inactive, wired, compressed)
- **Continuous monitoring** - watch memory usage with `-s` flag
- **Familiar options** - compatible with common `free` command flags

```shell
# Human-readable output
free -h

# Wide mode with all memory categories
free -w -h

# Monitor every 2 seconds
free -h -s 2

# Show totals for RAM + swap
free -h -t
```

## How It Works

Under the hood, mac-free uses native macOS APIs:

- `host_statistics64()` - retrieves VM statistics including page counts
- `sysctl()` - gets total physical memory and swap usage
- `vm_page_size` - system page size for converting pages to bytes

The tricky part was mapping Linux memory concepts to macOS equivalents:

| **Linux**  | **macOS Equivalent**        |
| ---------- | --------------------------- |
| used       | Active + Wired + Compressed |
| buff/cache | Inactive memory             |
| available  | Free + Inactive             |

macOS also has **compressed memory** - a feature where the system compresses inactive pages instead of swapping to disk. This shows up in wide mode.

## Why C?

Honestly? I wanted an excuse to write some C again.

It had been a while since I'd worked with manual memory management, system calls, and Makefiles. This project was small enough to be fun but practical enough to actually use.

Plus, C felt appropriate for a system utility like this.

## Installation

```shell
# Clone the repo
git clone https://github.com/techquestsdev/mac-free.git
cd mac-free

# Build and install
make
sudo make install

# or use Homebrew
brew install techquestsdev/tap/mac-free

# Use it
free -h
```

Requires Xcode Command Line Tools (`xcode-select --install`).

## Lessons Learned

1. **macOS memory management is different** - No clear separation between buffers and cache like Linux. Had to make some approximations.
2. **System APIs are well-documented** - Apple's developer docs made this easier than expected.
3. **Simple tools are satisfying** - Not everything needs to be a complex project. Sometimes a 500-line C program solves your problem perfectly.

## Final Thoughts

This project reminded me why I love building small, focused tools. No frameworks, no dependencies, no complexity - just a straightforward solution to an everyday annoyance.

If you're a Linux user on macOS missing your favorite commands, I encourage you to build your own. You might be surprised how approachable system programming can be.

The project is open source under MIT license. Contributions, issues, and stars are all welcome.

Now go check your memory usage!

```shell
free -mht
```
