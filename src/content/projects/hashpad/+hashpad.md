---
published: true
name: HashPad
description: A minimal, serverless text editor that stores content in the URL hash. No backend, no database - just share the link.
thumbnail: hashpad_preview.png
images: [hashpad_example.png, hashpad_options.png, hashpad_password.png, hashpad_qr.png]
github: https://github.com/techquestsdev/hashpad
website: https://hashpad.techquests.dev
date: 2026-02-17
---

Howdy!

"I need to share this snippet, but I don't want to create an account." "Is this pastebin going to expire?" "Wait, did I just send my password to a database?"

I built **HashPad** to solve the "quick share" problem without the overhead (or the privacy concerns) of a traditional backend. It's a text editor where the content _is_ the URL.

## What It Does

**Serverless Storage**: Your text is compressed using the deflate algorithm, encoded with base64url, and shoved directly into the URL hash. The text never touches a server - it's just passing through.

**Privacy First**: Decryption happens entirely in your browser. If you use a password, it's AES-256-GCM encrypted locally. No one (not even me) can read your notes without that password.

**Rich Editing**: A clean, focused writing environment with Markdown syntax highlighting. It's like a digital notepad that lives in your address bar.

**Easy Sharing**: Need to move a note to your phone? Generate a QR code instantly or just copy-paste the URL.

## How to Use

Using HashPad is as simple as typing:

1. **Start Writing**: Open [hashpad.techquests.dev](https://hashpad.techquests.dev) and just start typing. Your content is automatically compressed into the URL.
2. **Add Encryption (Optional)**: Click the "Lock" icon to set a password. This encrypts your content with AES-256-GCM before it's added to the URL.
3. **Share the Link**: Copy the URL from your browser's address bar. Anyone with the link (and the password, if set) can read the note.

Check the [GitHub repository](https://github.com/techquestsdev/hashpad) for local development and deployment instructions (Docker, Kubernetes/Helm).

## The Technology

HashPad is a "heavy" vanilla JS app that leans hard on native browser APIs to stay lightweight and fast:

- **CompressionStream**: The secret sauce for keeping URLs manageable by deflating the text payload.
- **Web Crypto API**: Handles the heavy lifting for AES-256-GCM encryption.
- **Base64URL Encoding**: Because hashes can be picky about characters.
- **PWA Support**: It works offline because, well, there's no online to speak of.

## Why I Built This

I wanted the ultimate "low-infrastructure" tool. Most pastebins are bloated with ads or require a database that will eventually get hacked or shut down.

With HashPad, as long as you have that link, you have the data. It's permanent, private, and requires zero maintenance on my part. Win-win.

**What I wanted:**

- No backend, no database, no "cloud"
- Zero-knowledge encryption (client-side only)
- Markdown support because plain text is boring
- Permanent links that never expire unless you lose them

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES2020+)
- **Styling**: CSS (with a dark mode that actually looks good)
- **Deployment**: Caddy 2 (serving static files and PWA manifests)
- **APIs**: CompressionStream, Web Crypto API, SubtleCrypto

## Status

Solid, stable, and serverless. Check it out at [hashpad.techquests.dev](https://hashpad.techquests.dev/#bY89T8MwEIb3-xWv6i1SUvE5MDBAkYoEDNA9cZNrbdW10_iCAEX57SgpVK3Ay_l57kN3CuYMc9aV9WuQUjDnv0hqwItjVDCXJ6xgrk6Fgrk-mGHgPDT2K3jRDq-tY0rTdNAP29roaCMlycLYCBuxDK6C8IckCeX5H5vndCi1op0t98WU_2Nz6vs3aeyGxTShXZu-H7e5c6Hc7NogHOn2mFBq74NgyfAchassy4aG-1AxPXpnPaMoQ8UFjV0Y_pis2JccJ1QUBT1_Ysm6Fbtq3ZgerVJY6KXjSB1e9JbRYcaxbGwtNnh01CFN0xT78PNGPdOi0WExrNNYHwB04xFP1m8iGZE63kynRkdT6yoTLs2u5Sgxq_h9SvQN).
