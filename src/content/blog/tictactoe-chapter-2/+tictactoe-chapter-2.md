---
published: true
name: 'TicTacToe: Chapter 2'
icon: 'ph:game-controller'
description: 'Transition to React Native with Expo'
date: 2025-06-10
---

Howdy!

In the previous chapter, we explored LynxJs and its capabilities for cross-platform development. Due to it's lack of maturity, there was still some functionality missing, more specifically the lack of Websockets support. This made it difficult to implement real-time features in our TicTacToe game, when creating an initial; version of the game.

In this chapter, I''ll be porting the game to a more mature framework - React Native with Expo. This will allow us to leverage the power of React Native and its ecosystem, while still being able to deploy the game to both iOS and Android platforms - and even the web!

## Why React Native with Expo?

React Native is a very popular framework for building cross-platform mobile applications using JavaScript and React. Like LynxJs, it allows us to write code once and run it on multiple platforms. Due to its maturity and large community, React Native provides a rich set of libraries and tools that make it easier to build complex applications.

Expo is a framework and platform that simplifies the development process with React Native. It provides a set of tools and services that make it easier to build, test, and deploy React Native applications. With Expo, we can quickly get started with our project without having to worry about the underlying native code for iOS and Android. It also provides a managed workflow that allows us to focus on writing our application code, while Expo takes care of the native configurations.

## Getting Started with Expo

To get started, the best place to begin is by following the official [Expo documentation](https://docs.expo.dev/get-started/installation/). This will guide you through the installation process and help you set up your development environment for each platform.

Here we can start to see the benefits of using Expo. It provides a very comprehensive guide for setting up the development environment, including the necessary tools and configurations for both iOS and Android.

The majority of emulation dependencies for both iOS and android should already be covered when I setup the LynxJs project in the previous chapter. However, if you are starting from scratch which made the initial setup even easier.

With all the environment set ip, getting it running is simple as running a few commands, using the expo package.

## Porting the Game to React Native

Since we already have a working TicTacToe game in LynxJs, we can start by porting the existing code to React Native. The main challenge here is to adapt the code to use React Native components and APIs instead of LynxJs.

The core game logic can remain largely unchanged, as it is written in JavaScript. However, we will need to replace LynxJs-specific components with their React Native counterparts.

The main difference I found was the element tags used for rendering the UI. Both frameworks have their own set of components, but they in essence serve the same purpose. Both are well documented and transitioning from one to the other is fairly straightforward.

One other main difference is the way we handle styles. In React Native, we use a `StyleSheet` object to define styles, which is similar to CSS but with some differences, whereas LynxJs uses a more traditional CSS approach. We can use the `StyleSheet` API to create styles that are applied to our components. This was probably the most time-consuming part of the porting process, as we had to rewrite all the styles to fit the React Native way of doing things.

## Testing the Game

Once everything has been ported, it was time to test the game. This process was made easier by Expo's development tools, which allow us to run the application on both iOS and Android devices simultaneously. We can use the Expo Go app to scan a QR code and run the application on our mobile devices, which is a great way to test the game in real-time.

Initially tested on the emulator for both iOS and Android, I was able to quickly identify and fix any issues that arose during the porting process, the main ones being related to the UI and styles. In terms of functionality, not much change was needed, as the core game logic remained the same.

I also decided to test on physical devices, which is always a good practice to ensure that the game runs smoothly on real hardware. Expo makes this process very easy, as we can simply scan the QR code with the Expo Go app and run the application on our devices. And it worked flawlessly!

## Deployment to iOS and Android

With the game fully ported and tested, we can now deploy it to both iOS and Android platforms. Expo provides a simple way to build and publish applications for both platforms using either EAS or the managed workflow.

EAS (Expo Application Services) is a set of cloud services that allow us to build, deploy, and manage our applications. It provides a simple way to build and publish applications for both iOS and Android platforms. This is free up to 30 builds per month, which is more than enough for our needs. Alternatively, we can also build the application locally using the Expo CLI, which means, we could always setup a CI/CD pipeline to automate the build and deployment process. But for now, we will use the Expo managed workflow to build and publish the application.

With the build completed for each platform, it's time to publish it! This is also where Expo shines, as it provides a simple way to publish applications to the App Store and Google Play Store. We can use the Expo CLI to publish the application, which will handle all the necessary steps for us! On the previous chapter, I had already created the necessary accounts and set up the required configurations for both platforms, so this process was fairly straightforward, as I simple reused the same project name and configurations.

> Since for Expo offers a way to build and publish the application, I removed the Apple Cloud build workflow I had set up in the previous chapter, as it was no longer needed. This also means that we can now build and publish the application from any machine, without having to worry about the Apple Cloud build workflow.

## Testing the game

Now that we have a new build, this time built using Expo, it was time to test the game again. On TestFlight, I added the new build, invited my girlfriend to test the new build aaand... **SUCCESS!** The game worked flawlessly! We were able to play the game against each other!

For Android I did a similar process:

- Created a new Project on the Google Play Console
- Uploaded the new build to the Google Play Console
- Created a closed testing track
  - Invited my own Google account to test the game
- Downloaded the game from the Google Play Store

It was then time to test playing the game against each other. And it worked! We were able to play the game against, on different devices, one on iOS and the other on Android. This was a great success, as it proved that the game was fully functional on both platforms.

## Conclusion

Porting the game from LynxJs to React Native with Expo was a smooth process, thanks to the maturity of the React Native ecosystem and the ease of use of Expo. We were able to leverage the power of React Native and its ecosystem, while still being able to deploy the game to both iOS and Android platforms.

Seeing something that I've envisioned, designed and built yourself coming to life and working as I expected is a great feeling. While it might not be the most complex project out there, it was still a great learning experience and a fun project to work on. When tackling a new technology, it's always a good idea to start with a small project to get a feel for the framework and its capabilities. This project was a great way to do that, and I learned a lot along the way.

We now have a ready to deploy TicTacToe game that can be played on both mobile platforms, and even the web! On the next chapter, I'll dive into the process needed on both iOS and Android to get the game published to the App Store and Google Play Store which, spoiler alert, was a bit more bureaucratic than I expected, but still a great learning experience.

---

_This is part of the **TicTacToe** series. All the chapters can be found below:_

- [Chapter 1: Exploring LynxJs and Cross-Platform Development](tictactoe-chapter-1)
- [Chapter 2: Transition to React Native with Expo](tictactoe-chapter-2)
- [Chapter 3: Deployment to iOS and Google Play](tictactoe-chapter-3)
