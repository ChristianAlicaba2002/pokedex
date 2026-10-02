# Pokédex

> **Midterm Project — CS41A**

A cross-platform Pokédex app built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev). Browse every Pokémon from [PokéAPI](https://pokeapi.co/), explore each region's dex, view 3D models, and pit two Pokémon against each other with a battle predictor. Runs on Android, iOS, and web from one codebase.

## Features

- **National Dex** — Infinite-scrolling grid that loads 30 Pokémon at a time, with pull-to-refresh and skeleton loaders
- **Search & type filter** — Search by name or dex number (`25`, `#025`) and filter by type across *all* Pokémon, not just the pages already loaded
- **Regional Pokédex** — Browse Kanto through Paldea (Gen I–IX) in each region's original dex order
- **Pokémon details** — Pokédex entry, genus, base stats, type matchups, abilities, moves, and the full evolution chain
- **3D models** — Auto-rotating 3D model viewer with a shiny toggle on Android and iOS (web shows the official artwork instead)
- **Compare & battle prediction** — Pick any two Pokémon to compare stats and type matchups, and get a predicted winner with a confidence rating
- **Compare history** — Past matchups are saved, with a win/loss/draw record shown per Pokémon
- **Favorites & Recently Viewed** — Heart Pokémon to keep them in Favorites; recently opened Pokémon appear on the Home screen
- **Theming** — Light, Dark, or follow the system setting
- **Saved on device** — Favorites, recently viewed, compare history, and theme preference are stored locally with AsyncStorage (Pokémon data itself is fetched live from PokéAPI)

## Screens

| Tab / Route | What it does |
| --- | --- |
| **Home** (`(tabs)/index`) | National Dex grid, search, type filter, featured Pokémon, recently viewed |
| **Pokedex** (`(tabs)/pokemon`) | Region selector and regional dex lists |
| **Favorites** (`(tabs)/favorites`) | Your hearted Pokémon |
| **History** (`(tabs)/history`) | Saved compare matchups |
| **More** (`(tabs)/settings`) | Theme, collection stats, data sources, app info |
| `dex/[id]` | Pokémon detail page |
| `compare?a=&b=` | Side-by-side comparison and battle prediction |

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | Expo SDK 57, React Native 0.86, React 19 |
| Language | TypeScript |
| Routing | Expo Router (typed routes, native tabs) |
| Styling | NativeWind (Tailwind CSS) |
| Data fetching | TanStack React Query, Axios |
| Storage | AsyncStorage |
| 3D | `<model-viewer>` in a WebView |
| Other | Expo Image, Reanimated, Linear Gradient, React Compiler |

## Prerequisites

- [Node.js](https://nodejs.org/) 22 (the version used in CI)
- [pnpm](https://pnpm.io/)
- For mobile: [Expo Go](https://expo.dev/go) on a physical device, or Android Studio / Xcode for emulators

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ChristianAlicaba2002/pokedex.git
cd pokedex
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_API_BASE_URL=https://pokeapi.co/api/v2
```

### 4. Start the development server

```bash
pnpm start
```

Add `-c` (`pnpm start -c`) to clear the Metro cache if something looks stale. From the Expo CLI you can press **a** for Android, **i** for the iOS simulator, **w** for web, or scan the QR code with Expo Go.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm start` | Start the Expo dev server |
| `pnpm android` | Start and open on Android |
| `pnpm ios` | Start and open on iOS |
| `pnpm web` | Start and open in the browser |
| `pnpm lint` | Run ESLint via `expo lint` |

## Project Structure

```
src/
├── app/                 # Expo Router routes
│   ├── (tabs)/          # Home, Pokedex, Favorites, History, More
│   ├── dex/[id].tsx     # Pokémon detail
│   ├── compare.tsx      # Compare & battle prediction
│   └── _layout.tsx      # Root layout and providers
├── components/          # UI components (cards, model viewer, picker, moves, abilities…)
├── hooks/               # React Query hooks and list/search logic
├── providers/           # Favorites, recently viewed, compare history, theme (AsyncStorage)
├── services/api/        # Axios instance and PokéAPI calls
├── utils/               # Battle prediction, type effectiveness, PokéAPI helpers
├── constants/           # Regions, themes, colors
└── @types/              # PokéAPI response types
```

## How the Battle Prediction Works

The compare screen gives a rough 1-on-1 estimate, not a full battle simulation. Both Pokémon are treated as level 50 with perfect IVs and no EVs, items, or abilities. Each one uses its best 80-power same-type attack (physical or special, whichever hits harder), with STAB and type effectiveness applied. The Pokémon that needs fewer hits to KO wins; on a tie, the faster one wins. The gap in hits decides the confidence: *Close fight*, *Likely*, or *Strong favorite*. See `src/utils/battle-prediction.ts`.

## API Layer

- **`src/services/api/axios.ts`** — Axios instance using `EXPO_PUBLIC_API_BASE_URL`
- **`src/services/api/pokemon-api.ts`** — Endpoints for Pokémon, species, pokedexes, evolution chains, types, abilities, and moves
- **`src/hooks/pokemon-hook.ts`** — React Query hooks (`useGetPokemon`, `useGetPokemonById`, `useGetPokedex`, `useGetPokemonSpecies`, `useGetEvolutionChain`, `useGetPokemonByType`, `useGetAbility`, `useGetMove`, …). Detail queries use `staleTime: Infinity` since Pokémon data rarely changes.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on pushes and pull requests to `main` and `develop`: it installs dependencies with a frozen lockfile and exports the web bundle to make sure the app builds.

## Development Notes

- Use the `@/` path alias to import from `src/`
- Platform-specific files use the `.web.tsx` / `.web.ts` suffix
- The React Compiler and typed routes are enabled in `app.json`
- This project targets Expo SDK 57 — check the [v57 docs](https://docs.expo.dev/versions/v57.0.0/) before changing native APIs

## Team

- Christian Dave Alicaba
- John Cez Casupanan
- Kent Jay Otadoy

## Data Sources

- Pokémon data: [PokéAPI](https://pokeapi.co/)
- Artwork & sprites: [PokeAPI/sprites](https://github.com/PokeAPI/sprites)
- 3D models: [Pokemon-3D-api/assets](https://github.com/Pokemon-3D-api/assets)

Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., and GAME FREAK inc. This is a fan project and is not affiliated with them.

## License

[MIT](LICENSE)
