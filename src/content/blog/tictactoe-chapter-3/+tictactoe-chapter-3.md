---
published: true
name: 'TicTacToe: Chapter 3'
icon: 'ph:game-controller'
description: 'Deployment to iOS and Google Play Store'
date: 2025-06-15
---

Howdy!

On the previous chapters we went from the planning all the way to design, implementation, reaching the conclusion that LynxJs was not mature enough to support the game we wanted to build, porting the game to React Native with Expo, validating that it worked and creating an initial version of the game that we could deploy to both iOS and Android platforms.

In this chapter, we will focus on the deployment process to both iOS and Google Play Store, ensuring that our game is available to a wider audience, and not just limited to be in the testing phase.

## Deployment to iOS

With the game already in TestFlight, we can now focus on the final steps to deploy it to the App Store. Getting the build from TestFlight to the App Store is a straightforward process - it's as simple as navigating to the Distribution section in the App Store Connect, selecting the build we want to submit.

Then comes the more tedious part, which is filling out all the necessary information for the App Store submission. Before we can send the application for review, we need to provide some details about the application, such as the app name, icon, description, keywords, support URL, marketing URL, and more. This is a necessary step to ensure that the app is properly listed in the App Store and that users can find it easily.

We also need to provide screenshots of the app in action, which is a great way to showcase the app's features and functionality. This is also a good opportunity to create some marketing material for the app, as we can use the screenshots to create promotional images and videos.

Since my main focus was to release the game it self, and not the marketing side of things, I decided to keep the app description and screenshots simple, focusing on the core features of the game.

With all the necessary information filled out, we can now submit the app for review. The review process can take anywhere from a few hours to a few days, depending on the volume of submissions and the complexity of the app. Once the app is approved, it will be available on the App Store for users to download and play.

## Deployment to Google Play Store

The process for deploying the game to the Google Play Store is similar to the iOS deployment process, but with some differences. It requires an app name, icon, description, and screenshots, just like the iOS deployment process. The main difference comes in the testing channels - on Apple, before submitting for review, we can have only one testing channel, which is TestFlight, while on Google Play we can have multiple testing channels, such as internal testing, closed testing, and open testing.

While this can definitely be useful to validate the app with a wider audience, can make the process a bit slow, since it requires a minimum of 12 individual testers before we can submit the app for review. This is a requirement from Google Play to ensure that the app is properly tested before it is released to the public. Another alternative is to use the open testing channel, which allows us to release the app to a wider audience without the need for individual testers. Ended up going with the closed testing channel, as I wanted to have a more controlled environment for the initial release of the app.

For the testing, I ended up asking a few friends to help me test the app, and they were able to provide some valuable feedback on the app's features and functionality. They identified some issues with the app, such as some UI inconsistencies as well as a bug with the Extreme mode square validation, which I hadn't noticed before. This provided great feedback to improve the app before releasing it to the public.

With the app tested and ready for release, I submitted it for review. The review process for the Google Play Store is usually faster than the App Store, taking anywhere from a few hours to a day. Once the app is approved, it will be available on the Google Play Store for users to download and play.

## Bonus: Deployment to Web

As a bonus, since my main goal was to explore mobile development, I also decided to deploy the game to the web. For this, I simply containerized the game using Docker and deployed it on my Home Lab. If you want to learn more about how I set up my Home Lab, you can check out the [Home Lab series](homelab-chapter-1).

## Conclusion

With the game now deployed to both iOS and Google Play Store, as well as the web, I can finally say that the project is complete! It was a great learning experience, and I was able to explore different technologies and frameworks, such as LynxJs, React Native with Expo, and Docker.

I'm really happy with the final result, and I hope you enjoyed following along with the journey. If you want to try out the game, search for **"TechQuests - TicTacToe"** on the App Store or Google Play, or visit the [project page](../projects/tictactoe) for more information.

If you have any feedback or suggestions for improvements, feel free to reach out! You can find all my contact information on the [Contact](../contact) page.

---

_This is part of the **TicTacToe** series. All the chapters can be found below:_

- [Chapter 1: Exploring LynxJs and Cross-Platform Development](tictactoe-chapter-1)
- [Chapter 2: Transition to React Native with Expo](tictactoe-chapter-2)
- [Chapter 3: Deployment to iOS and Google Play](tictactoe-chapter-3)
