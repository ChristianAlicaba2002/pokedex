# Pokédex

A cross-platform Pokédex app built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev). Browse and search Pokémon data from the [PokéAPI](https://pokeapi.co/), with support for Android, iOS, and web.

## Features

- **Cross-platform** — Runs on Android, iOS, and web from a single codebase
- **PokéAPI integration** — Fetches Pokémon data via a typed API service layer
- **React Query** — Caches and manages server state for Pokémon requests
- **File-based routing** — Navigation powered by [Expo Router](https://docs.expo.dev/router/introduction/)
- **Light & dark mode** — Automatic theme support based on system preferences
- **Native tab navigation** — Home and Explore tabs using Expo's native tabs

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | Expo SDK 57, React Native 0.86 |
| Language | TypeScript |
| Routing | Expo Router |
| Data fetching | TanStack React Query, Axios |
| API | [PokéAPI v2](https://pokeapi.co/docs/v2) |
| UI | React Native, Expo Image, Reanimated |

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm
- For mobile development: [Expo Go](https://expo.dev/go) on a physical device, or Android Studio / Xcode for emulators

## Getting Started

### 1. Clone the repository

Using SSH
```bash
git clone git@github.com:ChristianAlicaba2002/pokedex.git
cd pokedex
```

Using HTTPS
```bash
git clone https://github.com/ChristianAlicaba2002/pokedex.git
cd pokedex
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root (or copy from the example below):

```env
EXPO_PUBLIC_API_BASE_URL=
```

### 4. Start the development server

```bash
npx expo start
```

From the Expo CLI menu you can:

- Press **a** to open on Android
- Press **i** to open on iOS simulator
- Press **w** to open in the browser
- Scan the QR code with Expo Go on your phone

## API Layer

The app communicates with PokéAPI through a small service layer:

- **`src/services/api/axios.ts`** — Axios instance configured with `EXPO_PUBLIC_API_BASE_URL`
- **`src/services/api/pokemon-api.ts`** — Functions to fetch Pokémon by name or ID
- **`src/hooks/pokemon-hook.ts`** — React Query hooks:
  - `useGetPokemon(name)` — Search Pokémon by name
  - `useGetPokemonById(id)` — Fetch a single Pokémon by ID

Pokémon data is typed in `src/@types/type.ts` (`TPokemonData`), covering stats, types, abilities, and sprites.

## Development Notes

- Source code lives under **`src/`**, with routes in **`src/app/`**
- Path aliases are configured in `tsconfig.json` — use `@/` to import from `src/`
- The React Compiler is enabled via `app.json` experiments
- Platform-specific files use the `.web.tsx` suffix (e.g. `app-tabs.web.tsx`)
