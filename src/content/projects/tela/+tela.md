---
published: false
name: tela
description: An infinite canvas whiteboard and drawing notebook − local-first, built with Rust, WASM, and Tauri.
thumbnail: tela_preview.png
images: [tela_preview.png]
# github: https://github.com/techquestsdev/tela
website: https://tela.techquests.dev
date: 2026-03-20
---

Howdy!

I've used plenty of whiteboard tools - Excalidraw, Miro, FigJam, tldraw. They're good. But they all share the same assumption: your canvas lives on someone else's server. Even Excalidraw, which pioneered the local-first ethos, still loads a 2MB JavaScript bundle and requires a browser tab.

I wanted something closer to [Lorien](https://github.com/mbrlabs/Lorien) - a drawing notebook that opens instantly, feels like paper, and stores everything locally. But I also wanted it to run in a browser _and_ as a native app from the same codebase. And I wanted to build the rendering engine myself.

So I built **Tela** - Portuguese for "canvas".

## What It Does

Tela is an infinite canvas where you draw, sketch, and arrange shapes. It runs as a web app (WASM) or a native desktop app (Tauri v2). Your boards are stored locally - localStorage on web, filesystem on desktop. No accounts, no servers, no sync (yet).

**Pressure-Sensitive Drawing** - Freehand strokes capture pen pressure via the PointerEvent API and render as variable-width paths. Each stroke point stores `(x, y, pressure)`. The renderer builds a filled polygon from two offset paths - left and right edges displaced by `base_width * pressure` - producing natural-looking strokes that taper and swell with pressure. Even a mouse gets decent results: button-down defaults to 0.5 pressure, producing uniform strokes.

**Stroke Smoothing** - Raw pointer input is noisy. Tela applies Chaikin's corner-cutting algorithm (configurable passes) to smooth points, then Ramer-Douglas-Peucker decimation to reduce point count while preserving shape. A typical stroke of 200 raw points becomes 40-60 smoothed points - smaller save files, smoother curves, no visible quality loss.

**Canvas 2D Rendering** - Everything renders through the HTML Canvas 2D API via `web-sys`. Shapes, lines, text, freehand strokes - all drawn in world coordinates with a camera transform (pan + zoom) applied each frame. Text editing uses an HTML overlay positioned above the canvas, so you get native text selection and input while keeping the rendering pipeline simple.

**Spatial Indexing** - An R-tree (via `rstar`) indexes all element bounding boxes. Viewport culling queries the tree each frame to skip off-screen elements entirely. On a board with 1,000 elements where only 50 are visible, the renderer touches 50 elements instead of 1,000.

**Level-of-Detail** - When zoomed out far enough, the renderer simplifies: freehand strokes skip intermediate points, text below readable size becomes colored rectangles, strokes thinner than 1 screen pixel are culled. This keeps the frame budget constant regardless of zoom level.

## How Rendering Works

Every frame follows the same pipeline:

```txt
requestAnimationFrame
  │
  ▼
1. Read reactive signals (zoom, pan, elements, selection)
  │
  ▼
2. Resize canvas to container (handle DPI scaling)
  │
  ▼
3. Clear canvas, draw background
  │
  ▼
4. Apply camera transform: ctx.translate(pan_x, pan_y) + ctx.scale(zoom, zoom)
  │
  ▼
5. Draw grid (dots or lines, scaled to zoom level)
  │
  ▼
6. Query R-tree for elements intersecting the viewport
  │
  ▼
7. For each visible element (z-order):
   ├─ Shape → ctx.fillRect / ctx.arc / ctx.moveTo polygon
   ├─ Line  → ctx.moveTo + ctx.lineTo (+ arrowheads)
   ├─ Text  → ctx.fillText (or LoD rectangle)
   └─ Freehand → variable-width filled polygon
  │
  ▼
8. Draw selection handles, rotation handles, resize handles
  │
  ▼
9. Draw marquee selection rectangle (if active)
```

The variable-width stroke rendering deserves a closer look. For each consecutive pair of points, the renderer computes a perpendicular normal vector, then offsets the left and right edges by `pressure * stroke_width / 2`. This produces a series of trapezoids that are joined into a single filled path:

```txt
        A (p=0.3)                 B (p=0.7)
          ╱ ╲                       ╱     ╲
   left ─╱   ╲─ right        left ─╱       ╲─ right
        ╱     ╲                   ╱         ╲
  ─ ─ ─•─ ─ ─ •══════════════════•─ ─ ─ ─ ─ •─ ─ ─
        ╲     ╱    stroke path    ╲         ╱
         ╲   ╱                     ╲       ╱
          ╲ ╱                       ╲     ╱
       ±0.3·w/2                    ±0.7·w/2

  The normal ⊥ to the stroke direction offsets both
  edges symmetrically. Thinner at A, thicker at B.
```

The renderer walks the point array once, building left-edge and right-edge arrays, then draws a single closed path: left edge forward, right edge reversed. One `fill()` call per stroke.

## The File Format

Tela supports two formats:

**JSONC** (`.tela.jsonc`) - Human-readable, diffable, easy to inspect. Every element is a JSON object with type, position, style, and geometry. Comments are stripped on load. Good for version control and debugging.

**MessagePack** (`.tela`) - Binary, compact. Uses `rmp-serde` for zero-overhead serialization of the same data structures. A board with 500 strokes of 50 points each is ~60KB in MessagePack vs ~200KB in JSON. Good for large boards and fast load times.

```txt
BoardFile {
  version: "0.1.0",
  elements: [
    Shape { id, position, width, height, kind, style, transform },
    Line  { id, start, end, kind, start_arrow, end_arrow, style },
    Freehand { id, points: [(x, y, pressure), ...], style },
    Text  { id, position, content, font_size, style, transform },
    ...
  ]
}
```

Format detection is automatic on load - MessagePack files start with a specific byte sequence, everything else is tried as JSON.

## The Architecture

```txt
┌────────────────────────────────────────────────────────┐
│                  app/ (Leptos 0.7 CSR)                 │
│                                                        │
│  ┌──────────────┐  ┌────────────┐  ┌────────────────┐  │
│  │ CanvasView   │  │ Toolbar    │  │ FloatingProps  │  │
│  │ (canvas 2D)  │  │ (tools,    │  │ (color, style, │  │
│  │              │  │  file ops) │  │  layers)       │  │
│  └──────┬───────┘  └─────┬──────┘  └───────┬────────┘  │
│         │                │                 │           │
│  ┌──────┴────────────────┴─────────────────┴────────┐  │
│  │         Reactive State (Leptos signals)          │  │
│  │         BoardStore · UiStore · TabStor           │  │
│  └──────────────────────┬───────────────────────────┘  │
└─────────────────────────┼──────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │     tela-core         │
              │                       │
              │  elements/  ─ data model (Shape, Line, Freehand, Text)
              │  canvas/    ─ SpatialIndex (R-tree), Camera, Viewport
              │  tools/     ─ DrawTool (smoothing, decimation)
              │  format/    ─ BoardFile (JSONC + MessagePack)
              └───────────────────────┘

              ┌───────────────────────┐
              │    src-tauri/         │
              │  Tauri v2 desktop     │
              │  shell − native       │
              │  menus, file dialogs, │
              │  IPC commands         │
              └───────────────────────┘
```

**tela-core** is platform-agnostic - no web-sys, no Tauri, no UI framework dependencies. It defines the element types, the spatial index, the drawing tools, and the file format. It compiles to both native (for tests) and WASM (for the app).

**app/** is the Leptos 0.7 frontend. Three reactive stores hold all state: `BoardStore` (elements, selection, undo/redo, clipboard), `UiStore` (tool, zoom, pan, dark mode, grid), and `TabStore` (multi-board tabs with persistence). Components read signals and re-render automatically. The canvas rendering happens in a `requestAnimationFrame` loop that reads signals with `get_untracked()` to avoid triggering reactive updates.

**src-tauri/** is the desktop shell. It registers native menus, handles file dialog IPC, and forwards menu events to the frontend via Tauri's event system. The same WASM frontend runs inside Tauri's WKWebView (macOS) / WebView2 (Windows) / WebKitGTK (Linux).

## Cross-Platform Without Compromise

The tricky part of "one codebase, two platforms" is the filesystem. Browsers can't write files. Desktop apps shouldn't use anchor-download hacks. Tela handles this with runtime detection:

```txt
is_tauri()?
  │
  ├─ Yes → window.__TAURI__.dialog.save() → IPC invoke → fs::write()
  │        Native file picker, real filesystem, proper Save As
  │
  └─ No  → Create Blob → URL.createObjectURL() → anchor.click()
           Browser download dialog, downloads folder
```

The same pattern applies to loading files: Tauri uses a native open dialog + IPC `load_board` command, web uses an `<input type="file">` element. PNG export on Tauri decodes the canvas `toDataURL()` base64 and saves raw bytes via IPC. On web, it downloads the data URL directly.

Menu events flow differently too. On desktop, native menus emit events through Tauri's event system to the frontend. On web, the same actions are triggered from a toolbar dropdown. Both paths converge on the same reactive signals.

## Reactive UI Without Feedback Loops

One subtle challenge: the properties panel shows the selected element's colors and lets you change them. Naive implementation creates a feedback loop - changing the color updates the element, which triggers the Memo that reads the element, which re-renders the panel, which resets the color picker.

The solution is a revision counter pattern:

```txt
1. User opens color picker
2. on:click sets new color + increments revision counter
3. Memo reads selection + revision → produces panel state
4. Panel re-renders with new color (revision changed, so Memo fires)
5. Element reads with get_untracked() → no Memo trigger
```

Reading elements with `get_untracked()` inside the panel's Memo breaks the reactive cycle. The revision counter ensures the Memo still fires when the user actively changes something, but not when elements change from other sources (like dragging).

## Why I Built This

I wanted three things:

**A drawing tool that's truly local.** Not "local with optional cloud" - actually local. localStorage, filesystem, no network requests. Open the app, draw, close it. Your data is yours.

**A Rust-to-WASM project end-to-end.** I've written plenty of Rust backends and WASM experiments, but never a full interactive application where Rust handles everything: the data model, the rendering math, the file format, the UI framework, the desktop shell. No JavaScript runtime, no TypeScript, no React. Just Rust compiled to WASM with Leptos for reactive DOM and Canvas 2D for rendering.

**To understand canvas rendering.** How do you draw pressure-sensitive strokes? How do you make an infinite canvas feel smooth with 1,000 elements? How do spatial indices actually help rendering? Building the renderer from scratch answered these questions in a way that using Fabric.js or Konva never could.

## What I Learned

**Variable-Width Stroke Rendering** - The naive approach (draw circles at each point with radius proportional to pressure) produces visible artifacts at low densities. The filled-polygon approach (offset paths joined into trapezoids) produces smooth results but requires careful handling of sharp corners and self-intersecting paths. Chaikin smoothing before rendering eliminates most corner cases.

**Reactive Frameworks in WASM** - Leptos 0.7's fine-grained reactivity works beautifully for UI state (toolbar, panels, dialogs) but requires care around the render loop. The `requestAnimationFrame` callback must read signals with `get_untracked()` to avoid making the entire canvas reactive. The render loop polls signals; signals don't drive the render loop.

**Cross-Platform File I/O** - The gap between "browser" and "desktop" is mostly about file access. Tauri bridges it well, but the async dance (Rust → WASM → JS Promise → Tauri IPC → Rust filesystem → Promise resolution → WASM callback) has many failure points. Each platform path needs its own error handling.

**Spatial Indexing Payoff** - R-tree viewport culling is one of those optimizations where the implementation is simple (~30 lines with `rstar`) but the impact is dramatic. Going from O(n) to O(log n + k) per frame makes the difference between 60fps and single-digit fps on large boards.

**Undo/Redo Is State Management** - Implementing undo as snapshot-based (save full element list before each action) is simple and correct but memory-hungry. For a drawing app where each stroke is a separate action, 50 undo levels of a 500-element board means storing 25,000 element copies. For now, the simplicity is worth the memory cost. Command-based undo would be the next step.

**Multi-Tab Persistence** - Tabs seem trivial until you consider: saving the active tab's state on switch, restoring camera positions per tab, persisting all tabs to localStorage atomically, migrating from single-board to multi-board storage format, handling the "close last tab" edge case. Each one is simple; getting them all right together took careful thought.

## Tech Stack

- **Language**: Rust (2024 edition)
- **UI Framework**: Leptos 0.7 (CSR mode, fine-grained reactivity)
- **Rendering**: Canvas 2D via web-sys
- **Desktop**: Tauri v2 (WKWebView on macOS, WebView2 on Windows)
- **Spatial Index**: rstar R-tree
- **Serialization**: serde + serde_json (JSONC), rmp-serde (MessagePack)
- **Stroke Processing**: Chaikin smoothing + Ramer-Douglas-Peucker decimation
- **Styling**: Tailwind CSS
- **Build**: Trunk (WASM), cargo-tauri (desktop), Docker (web hosting)

## Getting Started

```sh
# Prerequisites
rustup target add wasm32-unknown-unknown
cargo install trunk
npm install

# Run the web app
cd app && trunk serve --open --port 8080

# Or run the desktop app
cargo install tauri-cli --version "^2"
cargo tauri dev
```

Draw something. Save it. Close the tab. Open it again. Your board is still there.

Full source and build instructions are in the [GitHub repository](https://github.com/techquestsdev/tela).

Happy drawing!
