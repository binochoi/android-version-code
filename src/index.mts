// semver 문자열을 Android versionCode 정수로 바꾼다.

// 자릿수 배분은 major(3) / minor(4) / patch(3).
// Play Store versionCode 상한이 2,100,000,000 이라 셋 다 넉넉히 줄 수 없어 minor 에 한 자리를 더 줬고,
// 그 대가로 major 는 210 까지만 쓸 수 있다. (자릿수를 넓히는 방향은 값이 커지므로 나중에도 안전,
// 줄이는 방향은 versionCode 단조증가가 깨져 불가능하다.)
const MAJOR_DIGITS = 3;
const MINOR_DIGITS = 4;
const PATCH_DIGITS = 3;
const MINOR_SCALE = 10 ** PATCH_DIGITS;
const MAJOR_SCALE = 10 ** (MINOR_DIGITS + PATCH_DIGITS);

/** 0 패딩한 versionCode 문자열의 자릿수. */
export const VERSION_CODE_WIDTH = MAJOR_DIGITS + MINOR_DIGITS + PATCH_DIGITS;

/** Play Store 가 받아주는 versionCode 최대값. */
export const MAX_VERSION_CODE = 2_100_000_000;

// prerelease/build 메타데이터(-beta.1, +sha) 는 versionCode 로 표현할 수 없어 버린다.
const SEMVER_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:[-+].+)?$/;

export function verToCode(version: string): number {
  const match = SEMVER_PATTERN.exec(version.trim());

  const isNotSemver = match === null;
  if (isNotSemver) {
    throw new Error(`major.minor.patch 형식이 아닙니다: "${version}"`);
  }

  const [, majorText, minorText, patchText] = match;
  const major = Number(majorText);
  const minor = Number(minorText);
  const patch = Number(patchText);

  const isMinorOverflow = minor >= 10 ** MINOR_DIGITS;
  if (isMinorOverflow) {
    throw new Error(`minor 는 ${10 ** MINOR_DIGITS - 1} 까지만 가능합니다: ${version}`);
  }

  const isPatchOverflow = patch >= 10 ** PATCH_DIGITS;
  if (isPatchOverflow) {
    throw new Error(`patch 는 ${10 ** PATCH_DIGITS - 1} 까지만 가능합니다: ${version}`);
  }

  const code = major * MAJOR_SCALE + minor * MINOR_SCALE + patch;

  // Android 는 versionCode 를 1 이상 2,100,000,000 이하의 정수로 요구한다.
  const isOverStoreLimit = code > MAX_VERSION_CODE;
  if (isOverStoreLimit) {
    throw new Error(`versionCode ${code} 가 Play Store 상한 ${MAX_VERSION_CODE} 을 넘습니다: ${version}`);
  }

  const isNotPositive = code < 1;
  if (isNotPositive) {
    throw new Error(`versionCode 는 1 이상이어야 합니다: ${version}`);
  }

  return code;
}

/**
 * 자릿수를 눈으로 확인할 때 쓰는 0 패딩 표기.
 * Gradle 에 넣으면 앞의 0 때문에 8진수로 파싱되므로 빌드 값으로는 쓰지 않는다.
 */
export function padVersionCode(code: number): string {
  return String(code).padStart(VERSION_CODE_WIDTH, "0");
}
