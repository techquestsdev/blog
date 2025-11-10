---
published: true
name: 'TicTacToe: Chapter 1'
icon: 'ph:game-controller'
description: 'Exploring LynxJs and Cross-Platform Development'
date: 2025-06-05
---

<script>
    import CaptionImage from '$lib/components/CaptionImage.svelte';
</script>

Howdy!

Recently I've been interested in exploring the enormous world of cross platform development. I wanted to create a simple game that would allow me to learn how to build, test and deploy to multiple platforms = my main targets being iOS and Android.

> This series is part of my journey of getting started with cross-platform development. It's not meant to be a comprehensive guide nor a tutorial, but rather a documentation of my headaches and learnings along the way.

## Picking a project

I'm an idiot, not in just the literal sense, but in the sense of - always full of ideas. This is a small joke that me and some friends make due to the the similarity of the work _ideia_ (same written way in portuguese) and _idiota_ (idiot in portuguese).

I wanted something that was simple to start with but where I could expand beyond the naive functionality. After a bit of research and watching some video ideas of simple project, I crossed some suggestion around this exact game: TicTacToe. While the game at its core is simple, it has a lot of room for expansion. I could introduce a base local play, a single player against AI and a multiplayer mode. On top of that it also occurred to me expanding the game beyond the 3x3 grid, introducing a multi-dimensional grid! Quickly I couldn't stop thinking about the idea so I decided to go for it.

## LynxJs

While doing a bit of _doom scrolling_ on LinkedIn (trying to avoid other social media, but this one is also getting pretty polluted), I came across a post announcing the release of a new framework called [LynxJs](https://lynxjs.com/) backed by the same company behind TicToc. It was selling itself as being a cross-platform framework that would allow me to build applications for both main mobile platforms (iOS and Android) as well as to the web with a single codebase.

While this framework is not the first of its kind, what caught my attention was the fact that it sells it self as being framework agnostic, meaning that it can be used with any JavaScript framework, including React, Vue, Svelte, and even plain JavaScript. While this was a possibility I decided I wanted to try it with React, since was the framework that I wanted to learn more about.

One of the main reasons why I wanted to try this framework was: I knew that it was fairly new, which meant that I would most likely learn more from it in comparison to use an already established framework such as Expo or simply React Native. Issues that I may face would most likely be new and not documenter nor answered yet, which would force me to dig deeper into the framework as well as how each abstraction is implemented for all 3 platforms.

**Spoiler alert**: I was not disappointed. If you do not value your mental sanity, I strongly recommend trying this approach out.

## Getting started

To get started with LynxJs, I followed the official documentation to set up the project. The process was straightforward, and I was able to create a new project using the command line interface (CLI) provided by LynxJs.

Since the phone I'm currently using is an iPhone, I decided to go with the iOS emulator first, to avoid having it connected to my computer all the time. The LynxJs CLI provides a command to run the project on the iOS simulator, which I used to test the application.

For debugging, I also used their Official [Lynx DevTool](https://lynxjs.org/guide/debugging/lynx-devtool.html) which allows me to connect to the application running on the iOS simulator and inspect the components, view the state, and debug the application.

With all the pre-requisites in place, I was ready to start building the game.

## Building the Game

Following along the documentation allowed me to quickly get started with the project. While in a still early stage, there is already quite a community around this framework, which made it easy to find help and resources.

Instead of the traditional tags that we find in a typical React/ HTML application, LynxJs uses a set of custom components that are designed to work across all platforms. This is not something new, React Native does this as well, but is always something new to learn and to also get used to.

Getting the application from zero to the basic functionality of the game - Local Player and Single Player - was fairly easy. While I'm not a frontend developer, I've gained some experience working on some personal projects in the past, as well as on some recent projects. This familiarity allowed me to quickly implement the core functionality, as well as doing what I consider the most challenging part of building any application (_drum roll please_) - the `UI`!

## Designing the UI

I love OSS. I love the feeling of using a tools that is build by a passionate community. I love being able to look _under the hood_ of the application and see how it works. I love the feeling of finding and fixing bugs on code that I didn't write. I love the feeling of being able to contribute to a project that I use and love. This passion of mine leads me to attempt to rely on OSS tools when building software on my spare time.

> When I say OSS, I do not mean to say free software, I mean Open Source Software. I do not mind paying for software that I use and love, but I do mind paying for software that is not open source.

For UI design I would say that the majority of people use Figma. While my experience with it is fairly limited but I do not like to use tools where I have a constant FOMO (Fear of Missing Out) feeling. While for my needs the free version would probably bee enough, I still feel like I'm missing out on some. For that reason I decided to use [Penpot](https://penpot.app/), an open-source design and prototyping platform that is built for teams. It has a similar interface to Figma, but it is completely free and open-source. It has a paid plan, that offers enterprise features like SSO, audit... if I wanted to self host, I would probably want them, but I'm fine using the Cloud version.

The Penpot interface is very similar to Figma, which made it easy to get started. I started playing around with the design and some colors. This lead me to long Youtube session of watching videos about design, reading articles about design best practices, mobile design, and so on. I started off with a simple skeleton design of the game, and when I say simple, I really mean simple, as you cn see in the image below:

<CaptionImage
    image="first-iteration.png"
    alt="First Iteration of the Design"
    sizes="50rem"
    loading="lazy"
/>

This was my first take. Not that great, but it was a start. I wanted a single color scheme, with a simple designs that could work well across different devices with different screen sizes. I also wanted a color scheme that would be easy on the eyes, not too distracting and that could work well in both light and dark modes. After playing around with the colors, I ended up with the following design

<CaptionImage
    image="second-iteration.png"
    alt="Second Iteration of the Design"
    sizes="50rem"
    loading="lazy"
/>

After showing this design to my girlfriend and having her blessing, I started implementing this design in the application.

## Implementing the UI

LynxJs allows native styling using a CSS-like syntax. This made it easy to implement the design in the application. I split the design into different components, each representing a part of the game. After a couple of hours of work, I had the basic UI implemented. The game was starting to take shape.

I have to admit, while designing is not really my cup of tea, it's really rewarding when you envision something and you are able to implement it.

## Adding Multiplayer

With the design in place, Local Player and Single Player modes implemented, I wanted to add a multiplayer mode. This would allow me to play with my girlfriend and friends, which is always more fun than playing against the AI - which I had to dumb down a bit, otherwise it would always be either a draw or a win for the AI, which is not really fun.

For the multiplayer I wanted to implemente a simple websocket server that would allow two players to connect to a room and play against each other. The rooms should be created per game mode (normal/Extreme) and should allow players to join and leave the room. To avoid the rooms taking too much memory, I wanted to implement a timeout that would remove the room after a certain period of inactivity.

With all this criteria in mind, the decision left to do was: pick a backend language to implement the server. In the past I've used JavaScript wit [Socket.io](https://socket.io/) to implement a websocket server, but I wanted to try something new. Since I've been coding in Go lately and I had recently build a POC project to study distributed file sharing using Sockets, I decided to use it for this project as well. It also gave me an excuse to use [Gorilla WebSocket](https://github.com/gorilla/websocket), a popular package for working with websockets in Go. This would also allow me to generate a very slim binary that I could then deploy and host on my Home Lab.

Implementing this was again a fairly smooth process since I was already familiarized with all the concepts. I implemented the backend server with all the previous mentioned features. As for the frontend, I used the LynxJs websocket package to connect to the server and handle the communication between the players. Created all the necessary logic on the TicTacToe game to handle the multiplayer mode, as well as all the events to handle - joining rooms, leaving rooms, starting a game, making a move, etc.

## Testing the Application

Now that all the logic was in place, the backend was running and the front end was ready, it was time to start testing the application. I emulated two iOS devices on my computer aaand... \_SUCCESS! I was able to connect both devices to the same room and play against each other! Well, not at first, can't deny that it took some iterations to get it working, but after some debugging and fixing issues with the socket connection, I was able to play against both devices. Just thought it would sound cool to say that it worked on the first try.

## Deploying the Application

Now that the application was working, it was time to deploy it. I wanted to deploy it to both iOS and Android, so I followed the LynxJs documentation to build the application for both platforms.

This was probably the most frustrating part of the whole process. I found at the time that the documentation was not very clear on how to build the application for either platform. There was however an [demo projects](https://github.com/lynx-family/integrating-lynx-demo-projects) repo on their official LynxJs GitHub repository that I was able to use as a reference. Discover this one after searching on their GitHub issues and finding a comment that pointed to it.

I cloned the repository and adapted the project to my needs. Looking back , I felt like this was a great learning experience. The projects contains iOS and Android demo projects, which meant that, for actually building the projects for each platform I would have to roll my sleeves and do some manual work.

For iOS, since I lacked familiarity with Xcode as well as with Swift, I had to fo through the Apple official documentation. Lynx offers example of an Object C project as well as Swift project, so I decided to go with the Swift one. I cloned the repo, built my release, added the release to the Xcode project.

All the initial setup was done! Afterwards, since I wanted to go all the way until publishing the application I ended up getting an Apple Developer license, as it is required to publish the application to the App Store. Once again, following the official documentation was the way to go. Once I had the application ready, I also ended up exploring the Apple build integration with Github, witch was very straightforward to configure.

> The Apple Developer license is not free, but it is a requirement to publish applications to the App Store. It costs `$99` per year, which in comparison to Google Play Store, which is a one-time fee of `$25`, is a bit more expensive.

## Not so fast

With all in place, it was just a matter of pushing the code to the repo and let the CI take care of the rest! Right? Well, not really... After some issues while attempting to compile the application and not finding anu related issues on the LynxJs Github Issues, I stumble across an similar issues on a Swift project that mentioned that the way they fixed the problem was buy reverting the version of Xcode.

> Sometimes we completely ignore the simple solutions.

I had forgot to validate the version of Xcode I was using locally on my machine and the one I was using to build the application... After fixing it, I was able to have my first iOS build ready for testing!

I quickly created a dedicated group on TestFlight to test the application on two real devices, my iPhone and my girlfriend's iPhone. I created my first preview, added both of our accounts, sent the invitation, installed the application on both devices and... _SUCCESS!_ The application was running! So it was time to test the multiple player mode! And... ohhh... nothing... No messages on the app, no connection on the server, nothing, just a message saying `WAITING FOR OPPONENT`. But this worked on the simulator! Why not on the real device? After some debugging, I wasn't able to pinpoint the exact issue at first. I connected my phone and used the `Console` app to see the logs from the application. After some digging I noticed that there where some issues with the socket client. After some more digging, and not finding any related issues, I done into the Socket implementation on LynxJS and... well.. it was not there...?
Well, it was there, but only for the LynxDevTool which, like the name suggests, it is meant to be used for development, it's not yet ready for production use - this was confirmed by the reply I received on the [issue](https://github.com/lynx-family/lynx/issues/951#issuecomment-2858104554) I've created on on the LynxJS GitHub repository.

According to the [reply](https://github.com/lynx-family/lynx/issues/951#issuecomment-2858104554), the Socket implementation is still a work in progress and it is not yet ready for production use. I was also presented with some options - one of them copying the Socket implementation from the LynxDevTool and adapting it to my needs. While this could have been a fun exercise, I felt like I was already spending too much time than I had initially planned on this project, so I decided to put down my keyboard and port the project to a more stable framework: [Expo](https://expo.dev/).

## Conclusion

While I was not able to fully complete the project as I had initially planned, I felt rewarded by the experience I earned while working on it. I had to plan, design, implement and deploy a cross-platform application using a new framework that I had never used before. I learned a lot about LynxJs, React Native, and the challenges of cross-platform development. I earned a lot of experience on resilience, debugging and problem solving. I also learned a lot about the limitations of the framework and how to work around them. I'm also grateful fot thr support I received from the LynxJs community, who were always willing to help and provide guidance, specially by [@colinaaa](https://github.com/colinaaa) for answering my questions and providing valuable feedback on my issues.

Overall, I feel like I achieved my goal of learning how to build a cross-platform application and I hope that this article will help others who are interested in learning more about LynxJs and cross-platform development.

I still want to finish the project, so I will be working on porting it to Expo in the next chapter. Might explore and work with LynxJs again in the future, but for now I feel like I need to take a break from it and focus on other projects.

---

_This is part of the **TicTacToe** series. All the chapters can be found below:_

- [Chapter 1: Exploring LynxJs and Cross-Platform Development](tictactoe-chapter-1)
- [Chapter 2: Transition to React Native with Expo](tictactoe-chapter-2)
- [Chapter 3: Deployment to iOS and Google Play](tictactoe-chapter-3)
