---
published: true
name: TicTacToe
description: Cross-platform development project with React Native, Expo, and Go.
thumbnail: cover.png
images: [menu-normal.png, menu-extreme.png, game-normal.png, game-extreme.png]
aspect_ratio: tall
# github: https://github.com/techquestsdev/tictactoe
# website: https://tictactoe.techquests.dev
date: 2025-06-15
---

Howdy!

**TicTacToe by TechQuests** started as a development and testing playground - a project designed to explore and document my journey across cross-platform development. It's not meant to be a production game or a comprehensive guide, but rather a hands-on documentation of learnings, challenges, and solutions when building, testing, and deploying to multiple platforms simultaneously.

The project demonstrates a **complete, multi-platform application** built with **React Native & Expo** for the frontend and **Go with WebSockets** on the backend. It showcases how to build a cohesive experience across iOS, Android, and Web from a single codebase.

## What This Project Explores

This wasn't about creating a groundbreaking game. Instead, it serves as a practical exploration of:

- **Cross-platform development** with React Native and Expo
- **Multi-platform deployment** targets (iOS, Android, Web)
- **Backend integration** with real-time multiplayer via WebSockets
- **UI/UX design** that works seamlessly across screen sizes
- **Publishing process** and deployment strategies
- **Testing approaches** for multi-platform applications

## Game Features

The game itself includes some interesting mechanics:

- **Normal Mode**: Classic 3x3 TicTacToe gameplay
- **Extreme Mode**: A board-of-boards variant that adds strategic depth
- **Multiple Play Styles**: Solo (vs AI), Local Player, or Online Multiplayer
- **No friction**: No ads, no tracking, no unnecessary complexity
- **Cross-platform UI**: Clean interface that adapts to any device

## Architecture

The project demonstrates a modern, scalable architecture:

**Frontend:**

- React Native with Expo for rapid cross-platform development
- Single codebase targeting iOS, Android, and Web
- WebSocket integration for real-time multiplayer communication

**Backend:**

- Go for performance and simplicity
- Gorilla WebSocket for real-time bidirectional communication
- Room-based game management with auto-cleanup
- Minimal binary size ideal for self-hosted deployments

**Deployment:**

- Self-hosted backend on private infrastructure
- Over-the-air updates via Expo
- App store distribution ready (though this project remains in dev)

## Why the Blog Series?

I documented the development process in a dedicated blog series titled **"TicTacToe"** where I share:

- Deep dives into cross-platform framework decisions
- UI/UX design processes and iterations
- Backend architecture and WebSocket implementation
- Deployment and testing strategies
- Lessons learned and challenges faced

**Read the full blog series here:**

- [Chapter 1: Exploring Cross-Platform Development](../blog/tictactoe-chapter-1)
- [Chapter 2: Building the Backend with Go](../blog/tictactoe-chapter-2)
- [Chapter 3: Multiplayer and Deployment](../blog/tictactoe-chapter-3)

Read the series to understand the "why" behind each architectural decision and technical choice.

## Finding This Project

While the goal was learning and documentation rather than wide distribution, the project is available:

**Available Platforms:**

- **iOS**: Published on the App Store
- **Android**: Published on Google Play _(internal testing track, invite only)_
- **Web**: Hosted version available at [tictactoe.techquests.dev](https://tictactoe.techquests.dev) _(removed for now)_
- **GitHub Repository**: [github.com/techquestsdev/tictactoe](https://github.com/techquestsdev/tictactoe)

**Find It Online:**

- Search for **"TechQuests - TicTacToe"** to find project references
- Visit the [blog series](../blog/tictactoe-chapter-1) for detailed development documentation

## Final Thoughts

This project succeeded in its primary goal: providing a comprehensive testing ground for cross-platform development. It's not a case study in game design, but rather a case study in **shipping a complete, functional application across multiple platforms with a single codebase**.

If you're exploring cross-platform development or curious about how to architect applications that work seamlessly on iOS, Android, and Web, this project and its associated blog series offer practical, real-world insights.
