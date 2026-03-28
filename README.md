# Truth N Dare Frontend

Expo Router frontend rebuilt for a cleaner production workflow, better code splitting, and a more modern room/game experience.

## Highlights

- Lazy-loaded route screens for login, register, guest access, lobby, room, and wheel flow
- Shared UI system in [`src/components`](/Users/kunjghevariya/Desktop/git1/TruthNDare/src/components)
- Centralized session and token refresh handling in [`src/providers/session-provider.jsx`](/Users/kunjghevariya/Desktop/git1/TruthNDare/src/providers/session-provider.jsx)
- Shared API and socket services in [`src/services`](/Users/kunjghevariya/Desktop/git1/TruthNDare/src/services)
- More human game flow with side chat, recent round memory, and richer truth/dare prompt presentation
- Static web export support for deployment on Netlify

## Tech stack

- Expo 51
- Expo Router
- React Native + React Native Web
- Axios
- Socket.IO client

## Project structure

```text
app/                    Expo Router entry files
src/components/         Reusable UI and layout primitives
src/features/           Screen-level feature modules
src/providers/          App-wide state and session handling
src/services/           API, storage, and socket clients
src/constants/          Routes and theme tokens
```

## Environment

Create a local `.env` file from [`.env.example`](/Users/kunjghevariya/Desktop/git1/TruthNDare/.env.example):

```bash
cp .env.example .env
```

Supported variables:

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_SOCKET_URL`

If you do not override them, the frontend now defaults to `http://localhost:8000` to match the backend dev server.

## Local development

```bash
npm install
npm run start
```

Useful commands:

- `npm run android`
- `npm run ios`
- `npm run web`
- `npm run lint`
- `npm run build:web`

## Deployment

### Web

Static export is configured with [`netlify.toml`](/Users/kunjghevariya/Desktop/git1/TruthNDare/netlify.toml).

```bash
npm run build:web
```

This generates the deployable output in `dist/`.

### Native builds

EAS configuration lives in [`eas.json`](/Users/kunjghevariya/Desktop/git1/TruthNDare/eas.json).

Examples:

```bash
npx eas build --platform android --profile preview
npx eas build --platform ios --profile production
```

## Verification completed

- `npm run lint`
- `npm run build:web`
