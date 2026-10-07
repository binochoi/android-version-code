#!/usr/bin/env node
import { parseArgs } from "node:util";
import { padVersionCode, verToCode } from "./index.mts";

const USAGE = `사용법: android-version-code <version>

version 문자열(major.minor.patch)을 Android versionCode 정수로 변환합니다.
version 은 인자로만 받습니다 — 파일을 읽지 않습니다.

옵션:
      --padded  0 을 채운 10자리로 출력 (확인용, Gradle 에는 8진수로 읽히니 쓰지 말 것)
  -h, --help    이 도움말`;

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

const { values, positionals } = parseArgs({
  options: {
    padded: { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
  allowPositionals: true,
});

if (values.help) {
  process.stdout.write(`${USAGE}\n`);
  process.exit(0);
}

const [version] = positionals;

const hasNoVersion = version === undefined;
if (hasNoVersion) {
  fail(USAGE);
}

try {
  const code = verToCode(version);
  // stdout 은 versionCode 값 전용이다 — `$(android-version-code "$(jq -r .version package.json)")` 로 바로 받아 쓸 수 있게.
  process.stdout.write(`${values.padded ? padVersionCode(code) : code}\n`);
} catch (error) {
  fail(`[android-version-code] ${error instanceof Error ? error.message : String(error)}`);
}
