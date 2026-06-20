<p align="center">
  <img src="./assets/images/icon.png" alt="Quick Store app icon" width="120" />
</p>

# Quick Store

Quick Store is a simple mobile point-of-sale and product-management app for small shops and neighborhood stores. It keeps inventory on the device, makes frequently sold items easy to find, and calculates cash payments and customer change.

## Features

- Create, edit, hide, and delete products.
- Organize related products into groups and variations.
- Search the inventory and add products directly to the cart.
- Change quantities, remove items, or clear the cart.
- Calculate totals, cash received, remaining balance, and customer change.
- Persist product data locally with SQLite.
- Use a responsive interface designed for quick counter transactions.

## Built with

- [Expo](https://expo.dev/) and React Native
- TypeScript
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- NativeWind and Tailwind CSS

## Getting started

### Requirements

- Node.js
- npm
- Expo Go, an Android emulator, or an iOS simulator

### Installation

```bash
git clone https://github.com/AllanEduard/quick-store.git
cd quick-store
npm install
npm start
```

Follow the Expo terminal instructions to open the app on your preferred device or platform.

## Available commands

| Command | Description |
| --- | --- |
| `npm start` | Start the Expo development server |
| `npm run android` | Start Expo and open Android |
| `npm run ios` | Start Expo and open iOS |
| `npm run web` | Start the web version |
| `npm run lint` | Run the Expo ESLint checks |

## Project structure

```text
src/
├── app/          Expo Router routes
├── components/   Cart, product, and home-screen UI
├── contexts/     Shared cart state
├── database/     SQLite schema and product operations
├── hooks/        Cart and inventory logic
├── screens/      Store and payment screens
├── types/        TypeScript data models
└── utils/        Shared formatting helpers
```

Product inventory is stored locally on each device. No account or remote database is required for the current version.

## License

This project is available under the [MIT License](./LICENSE).
