---
published: true
name: houndr
description: A fast, trigram-based code search engine for Git repositories - Hound, rewritten in Rust.
thumbnail: houndr_preview.png
images: [houndr_preview.png]
github: https://github.com/techquestsdev/houndr
# website: https://github.com/techquestsdev/houndr
date: 2026-03-03
---

Howdy!

I've been building [Code Search](/projects/code-search) - a self-hosted platform that started as a Hound replacement but quickly grew into something much bigger. Bulk replace across repos, automated merge requests, multi-host support, repository management UI. Feature after feature, it evolved into an alternative to Sourcegraph.

That's great for teams that need it. But somewhere along the way, I lost what made Hound appealing in the first place: **simplicity**. Just point it at your repos and search. No databases, no job queues, no Kubernetes.

So I went back to basics and built **houndr** - a pure Hound alternative, rewritten from scratch in Rust. No additional features, no enterprise bells and whistles. Just fast indexing and fast search.

The name? **hound** + **Rust** = **houndr**.

## What It Does

houndr clones your Git repositories, builds trigram indexes, and serves a web UI and JSON API for instant code search across all of them. That's it.

**Trigram-Based Search** - Sub-millisecond substring and regex search. Every file is split into overlapping 3-byte windows (trigrams), each mapped to a bitmap of documents containing it. A query like `readFile` produces trigrams `rea`, `ead`, `adF`, `dFi`, `Fil`, `ile` - intersecting their bitmaps narrows candidates to a handful of files before any content scanning happens. Searches stay fast regardless of corpus size.

**Incremental Indexing** - On each poll cycle, houndr fetches the latest refs. If HEAD hasn't changed, the existing index is reused immediately. If it has, a manifest diff identifies which files changed - unchanged files are copied zero-copy from the previous index via mmap. A commit that touches 2 files in a 10,000-file repo only reads 2 blobs from git.

**Memory-Mapped I/O** - Indexes are memory-mapped with segment-specific `madvise` hints: `Random` for the trigram index (binary search), `Sequential` for content (streamed reads). File content is accessed as byte slices directly from the OS page cache - no heap allocation, no copies, lazy page loading.

**Streaming Results** - SSE endpoint streams results per-repo as they complete. No waiting for the slowest repo to finish.

**Private Repos** - HTTPS tokens, SSH keys, and `$ENV_VAR` references. Works with your existing credentials.

## How Search Works

```txt
Query: "readFile"
  │
  ▼
1. Extract trigrams: [rea, ead, adF, dFi, Fil, ile]
  │
  ▼
2. Look up posting lists (RoaringBitmap per trigram)
   rea → {0, 3, 7, 12, 45}
   ead → {0, 3, 12, 45, 99}
   adF → {0, 12, 45}
   ...
  │
  ▼
3. Intersect bitmaps (smallest-first, early termination)
   candidates → {0, 12, 45}
  │
  ▼
4. Parallel content scan (rayon)
   First N files: build full match blocks with context lines
   Remaining files: count only (accurate totals, bounded response)
  │
  ▼
5. Return grouped results per repo
```

Posting lists are sorted by cardinality before intersection - starting with the smallest bitmap produces fewer candidates, and each subsequent step can only shrink the result. If the intermediate result becomes empty, the loop terminates early. Trigrams appearing in 3 or fewer documents store their doc IDs directly inline in the index entry, avoiding a pointer chase to the posting section entirely.

## The Index Format

houndr uses a custom binary format (`.idx`) designed for memory-mapped random access:

```txt center
┌────────────────────────────────────────────┐
│ HEADER (64 bytes)                          │
│   magic: "HNDR", version, offsets          │
├────────────────────────────────────────────┤
│ DOC TABLE (24 bytes × doc_count)           │
│   path offset/len, content offset/len      │
├────────────────────────────────────────────┤
│ PATH STRINGS (concatenated UTF-8)          │
├────────────────────────────────────────────┤
│ TRIGRAM INDEX (16 bytes × count, sorted)   │
│   inline: up to 3 doc IDs packed directly  │
│   offset: pointer to posting data          │
├────────────────────────────────────────────┤
│ POSTING DATA (RoaringBitmaps)              │
├────────────────────────────────────────────┤
│ CONTENT DATA (raw file bytes)              │
├────────────────────────────────────────────┤
│ FOOTER (xxhash3 checksum)                  │
└────────────────────────────────────────────┘
```

File content is embedded directly in the index - one file per repo, atomic updates via rename, zero-copy reads via mmap. The tradeoff is larger index files (~1.2x source size), but for code search that's acceptable.

Index writes happen in 9 phases to a `.tmp` file, then atomically renamed. Readers never see a partial index. Integrity is verified via streaming xxhash3 - checksumming a 100MB index takes ~10ms.

## The Architecture

Three standalone crates, deliberately separated:

```txt center
┌──────────────────────────────────────────────┐
│                houndr-server                 │
│       Axum · Web UI · SSE · LRU Cache        │
│                                              │
│  ┌────────────┐  ┌────────────────────────┐  │
│  │ Axum       │  │ Background Watcher     │  │
│  │ Router     │  │ (poll loop)            │  │
│  └─────┬──────┘  └──────────┬─────────────┘  │
└────────┼────────────────────┼────────────────┘
         │                    │
         ▼                    ▼
┌────────────────┐   ┌─────────────────────────┐
│  houndr-index  │   │      houndr-repo        │
│                │   │                         │
│ IndexBuilder   │◀──│ pipeline::index_repo()  │
│ IndexReader    │   │ vcs::GitRepo            │
│ QueryPlan      │   │ config::Config          │
│ Trigram engine │   │                         │
└────────────────┘   └─────────────────────────┘
```

**houndr-index** is the core engine - trigram extraction, index building (parallel via rayon fold/reduce), disk I/O, and query execution. Zero server or HTTP dependencies. It can power CLI tools or custom integrations standalone.

**houndr-repo** handles Git operations via libgit2 - bare clones, fetches, tree walks, blob reads, manifest tracking for incremental indexing.

**houndr-server** is the HTTP layer - Axum with SSE streaming, LRU result cache (pre-serialized JSON, no re-serialization on hits), security headers, rate limiting via Governor, and gzip compression. The web UI is embedded at compile time via `include_str!` - no build step, no bundler.

## Why I Built This

[Code Search](/projects/code-search) uses Zoekt under the hood and has grown into a full platform - Next.js frontend, Go backend, PostgreSQL, Redis, worker queues. It's the right tool when you need bulk operations and multi-host management.

But sometimes you just need to search code. Fast. Without deploying a database.

I wanted something that sits closer to Hound's philosophy - single binary, single config file, point at repos, search. But with the performance and safety guarantees that come from Rust: zero-copy mmap reads, fearless concurrency, no GC pauses, single binary deployment.

I also wanted to understand how trigram search _actually_ works. Not just use Zoekt or Hound as a black box, but implement the index engine myself - the bitmap intersections, the binary format, the mmap strategies. Building it from scratch taught me more about search internals than years of using existing tools.

## What I Learned

**Trigram Index Design** - Elegantly simple in concept (overlapping 3-byte windows → inverted index), surprisingly nuanced in practice. Inline small postings for rare trigrams (~30-50% of all trigrams appear in 3 or fewer files), smallest-first bitmap intersection with early termination, partial deserialization of RoaringBitmap containers that overlap with the current result - each optimization compounded.

**Memory-Mapped I/O** - Segment-specific `madvise` hints make a real difference. Random access hints for the trigram index (binary search pattern) vs sequential hints for content data (streamed reads) vs willneed for the header. The OS read-ahead strategy matches each section's actual access pattern.

**Incremental Indexing** - Comparing HEAD refs and diffing manifests sounds straightforward, but edge cases abound: force pushes, rebases, deleted branches, repos that temporarily fail auth. Failed repos keep their previous IndexReader - search continues against the last successful index rather than dropping results.

**Graceful Shutdown** - Three-layer cancellation: CancellationToken → AtomicBool flag checked in git transfer callbacks and tree walks → force-quit on second Ctrl+C. Getting cooperative cancellation right across async Tokio tasks and blocking rayon threads was the trickiest concurrency problem.

**Rust for Systems Work** - libgit2 FFI via git2-rs, multi-crate workspaces, unsafe mmap operations, `Arc<IndexReader>` shared across threads with compile-time safety. The ownership model caught real bugs during development - double-mmap, use-after-unmap, data races on the reader swap - all at compile time.

## Tech Stack

- **Language**: Rust
- **Search Engine**: Custom trigram index with RoaringBitmaps and memory-mapped I/O
- **Parallelism**: Rayon (index builds + query execution)
- **Git Integration**: libgit2 via git2-rs (bare clones, blob reads)
- **HTTP Server**: Axum with Tower middleware, SSE streaming
- **Caching**: LRU with TTL (pre-serialized JSON)
- **Hashing**: FxHash (hot-path trigram maps), xxhash3 (index integrity)
- **Configuration**: TOML
- **Deployment**: Single binary or Docker

## Getting Started

```sh
# Build
cargo build --release

# Configure
cp config.toml my-config.toml
# Add your repositories to my-config.toml

# Run
./target/release/houndr-server --config my-config.toml
```

Open [http://127.0.0.1:6080](http://127.0.0.1:6080) and start searching.

Full configuration options and deployment guides are available in the [GitHub repository](https://github.com/techquestsdev/houndr).

Happy searching!
