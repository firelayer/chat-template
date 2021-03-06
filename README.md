<a href="https://firelayer.io/">
  <img src="https://user-images.githubusercontent.com/3942799/78354854-884c2780-75a4-11ea-9882-a716e2095e98.png" alt="Firelayer" width="400" />
</a>

> https://firelayer-chat.web.app

### Firelayer Documentation

[Documentation Website](https://firelayer.io/docs)

## Installation Guide
You can use an existing Firebase project or create a new project on the [Firebase Console](https://console.firebase.google.com).

Follow the guide on preparing a Firebase project for Firelayer
**[Setting up Firebase - Guide](https://firelayer.io/docs/setting-up-firebase)**

#### Starting in a new project
```sh
firelayer init new-project -t chat
```

#### Adding to a current firelayer project
```sh
firelayer add:template chat
```

### Quick Start
> After Install

To start run **`yarn dev`** or **`npm run dev`** and the three applications should be ready on:
- chat - http://localhost:8083
> ports may change if already in use by other services

## Content

#### [`apps/chat` Chat](/apps/chat/README.md)
- Slack like Chat for Realtime Database
- Vue & Vuetify Components

## Development

Chat template is organized as a monorepo using [Lerna](https://lerna.js.org/) and yarn workspaces. Useful scripts include:

#### `yarn bootstrap`
> Installs package dependencies and links packages together - using lerna and yarn workspaces

#### `yarn build`
> Cleans the previous builds and starts building on all sub packages - using lerna run build

#### `yarn dev`
> Starts the dev mode on all sub packages - using lerna run dev

## License

Firelayer is open-sourced software licensed under the [MIT license](https://github.com/firelayer/firelayer/blob/master/LICENSE).
