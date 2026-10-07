# android-version-code

Convert a semver version string (`major.minor.patch`) into an **Android `versionCode`** integer for Google Play.
`android-version-code` is a tiny, zero-dependency CLI and TypeScript API that derives a monotonically increasing `versionCode` from your app's `versionName` / `package.json` version, so you never bump the build number by hand.
Use it in CI (GitHub Actions, fastlane, Gradle) for Capacitor, React Native, Expo, Cordova, or native Android release builds.

```sh
npx android-version-code 21.3.23   # 210003023
```

## Install

```sh
npm install --save-dev android-version-code
# or
pnpm add -D android-version-code
```

Or run it without installing via `npx android-version-code <version>`.

## Usage

The version is taken only from the argument — the tool never reads files.
To use the version from `package.json`, extract it yourself and pass it in:

```sh
npx android-version-code "$(jq -r .version package.json)"
```

Only the `versionCode` is written to stdout, so you can capture it directly:

```sh
VERSION_CODE=$(npx android-version-code "$(jq -r .version package.json)")
```

### Examples

- **CI release pipeline** — compute `VERSION_CODE` on every deploy and pass it to Gradle or fastlane, guaranteeing the monotonic increase Google Play requires.
- **Build scripts** — import `verToCode()` in a Node script that writes the Android version before a Capacitor / React Native build.
- **Environment variables** — write the result into a `.env` file or CI env for downstream tools to read.

## Digit layout

`major(3) / minor(4) / patch(3)`

| version | versionCode | `--padded` |
| --- | --- | --- |
| `0.0.1` | `1` | `0000000001` |
| `1.0.1` | `10000001` | `0010000001` |
| `21.3.23` | `210003023` | `0210003023` |
| `210.0.0` | `2100000000` | `2100000000` |

Google Play caps `versionCode` at `2,100,000,000`, so the digits cannot be split evenly into threes.
Minor gets one extra digit; in exchange, major can only go up to `210` — anything above is rejected with an error.
Minor is capped at `9999` and patch at `999`.

Widening a field later (e.g. minor from 3 to 4 digits) only makes values larger, so it is safe.
Narrowing is not possible because it would break the monotonic increase of `versionCode`.

Prerelease and build metadata such as `1.2.3-beta.4` or `1.2.3+sha` are dropped, producing the same value as `1.2.3`.
`versionCode` has no way to represent them, so make sure you don't upload two builds with the same code.

## Options

```
android-version-code <version>

      --padded  print as a zero-padded 10-digit string (for inspection)
  -h, --help    show help
```

Don't feed `--padded` output into Gradle — the leading `0` makes it parse as an octal number. Use the default output for builds.

## API

```ts
import { MAX_VERSION_CODE, VERSION_CODE_WIDTH, padVersionCode, verToCode } from "android-version-code";

verToCode("21.3.23"); // 210003023 (throws on invalid format or overflow)
padVersionCode(1); // "0000000001"
MAX_VERSION_CODE; // 2100000000
VERSION_CODE_WIDTH; // 10
```

## Development

`prepare` runs `obuild --stub`, so `dist` only contains one-line re-exports pointing to `src/*.mts`.
Sources run directly without bundling (Node type stripping), so installs are fast and edits to `src` take effect immediately.

The real bundle for publishing is `pnpm build:dist`. However, `pnpm publish` runs `prepare` **after** `prepack`,
so a pre-built bundle would be overwritten by the stub and a broken tarball would be published.
Publish with `pnpm release`, which bundles and then publishes with `--ignore-scripts`.

## License

MIT
