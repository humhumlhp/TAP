# TAP / The Archive of Phong – Setup & Run Guide

This guide explains how to set up and run the project on a new machine for development (Android, iOS, and Web) and how I run it locally.

## Prerequisites

Install the following tools:

- Node.js 18+ (recommended LTS)
- npm 9+ (bundled with Node) or Yarn
- Git
- Java 17 (for Android builds)
- Android Studio (SDK + emulator) if you want to run on Android
- Xcode (macOS only) if you want to run on iOS

Global CLIs:
- Expo CLI (optional; we mainly use npx):
  ```bash
  npm install -g expo-cli
  ```

## Repository Structure

- Root folder: `TAP/`
  - `the-archive-of-phong/` – Expo app source
  - Top-level `package.json` – helper deps for tooling

## Environment Variables

Create a `.env` file in `the-archive-of-phong/` with your Supabase credentials (ask a maintainer for values):

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are read at runtime (Expo automatically exposes `EXPO_PUBLIC_*` vars).

## Install Dependencies

From the app directory:

```bash
cd the-archive-of-phong
npm install
```

If you plan to use Android/iOS native builds for the first time, also install prebuild native projects:

```bash
npx expo prebuild
```

## Running the App

Common scripts (from `the-archive-of-phong`):

- Start Metro + choose platform interactively:
  ```bash
  npm run start
  ```
- Web (React Native Web):
  ```bash
  npm run web
  ```
- Android (device or emulator):
  ```bash
  npm run android
  ```
- iOS (simulator, macOS only):
  ```bash
  npm run ios
  ```

When starting, Expo will show a QR and options. For mobile, use a development build or Expo Go. For web, open the printed localhost URL.

## Navigation & Auth Flow

- File-based routing via `expo-router` under `the-archive-of-phong/app/`.
- Auth is handled in `app/_layout.jsx` using Supabase Auth.
  - If no session → `welcome` screen.
  - If logged in but email not verified → `emailVerification`.
  - If logged in and verified → `codeRedemption` (default post-login screen).

## Fonts & Assets

- Custom font VT323 is loaded globally in `_layout.jsx`.
- App icon and splash assets live under `assets/images/`.

## Building for Web (Static Export)

```bash
npm run vercel-build
```
Outputs static files using Expo export (see `app.json` web config). Suitable for Vercel/static hosting.

## Troubleshooting

- If Metro cache issues occur:
  ```bash
  npx expo start -c
  ```
- If native modules mismatch after upgrading deps:
  ```bash
  npx expo prebuild --clean
  npm install
  ```
- Android build requires Java 17 and Android SDK. Ensure ANDROID_HOME is set and an emulator is created via Android Studio.

## How I Run It Locally

From a clean clone:

```bash
git clone <repo-url>
cd TAP/the-archive-of-phong
npm install
npm run web    # or: npm run android / npm run ios
```

Log in or sign up via the app UI. Provide the `.env` variables for Supabase before running to enable auth and data features.

## Scripts Reference (package.json)

- `start` – `expo start`
- `web` – `expo start --web`
- `android` – `expo run:android`
- `ios` – `expo run:ios`
- `vercel-build` – `expo export`
- `reset-project` – scaffolding helper from Expo template

## Notes

- Branches: default branch is `dev2`; sometimes `web` branch exists for web-specific changes.
- The project uses React Native 0.79 and React 19 with Expo SDK 53. If you update one, keep versions aligned.
- For icons and camera features, permissions are configured in `app.json` plugins.
