#!/usr/bin/env node
/**
 * Cross-platform Android release build.
 *
 * Equivalent to the old bash script:
 *
 *   cd android && ./gradlew clean && ./gradlew bundleRelease && ./gradlew assembleRelease
 *   && cp android/app/build/outputs/apk/release/app-release.apk \
 *        release/android/myscorekeeper-$npm_package_version.apk
 *   && cp android/app/build/outputs/bundle/release/app-release.aab \
 *        release/android/myscorekeeper-$npm_package_version.aab
 *
 * Uses node (instead of shell pipelines) so it works on Windows / macOS / Linux.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ANDROID_DIR = path.join(ROOT, 'android');
const RELEASE_DIR = path.join(ROOT, 'release');
const OUT_DIR = path.join(RELEASE_DIR, 'android');

/**
 * Load the release signing secrets from release/release-secrets.properties.
 * This file is gitignored and must NOT be committed to the repo.
 *
 * Returns an object of key/value properties, or null when the file is missing
 * (in which case the release build falls back to the releasefallback keystore).
 */
function loadSecrets() {
  const file = path.join(RELEASE_DIR, 'release-secrets.properties');
  if (!fs.existsSync(file)) {
    console.warn(
      `\n[release] No signing secrets file found at: ${file}\n` +
        '[release] The build will use the fallback (releasefallback) signing config.\n',
    );
    return null;
  }
  const props = {};
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith('!')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    // Per the .properties spec, trailing (unescaped) whitespace is dropped.
    const value = line.slice(eq + 1).trim().replace(/\s+$/, '');
    props[key] = value;
  }
  return props;
}

// Build the `-P key=value` flags passed to Gradle so that app/build.gradle's
// signingConfigs.release picks up the real release keystore and its secrets.
const gradleProps = Object.entries(loadSecrets() || {})
  .map(([k, v]) => `-P ${k}="${v}"`)
  .join(' ');
const GRADLE_SIGNING_ARGS = gradleProps ? ` ${gradleProps}` : ''; // eslint-disable-line no-unused-vars

const { version } = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'),
);

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { shell: true, stdio: 'inherit', ...opts });
}

// Platform-appropriate gradle wrapper: `gradlew.bat` on Windows (cmd),
// `./gradlew` on macOS/Linux (sh).
const gradle = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
run(`${gradle} clean`, { cwd: ANDROID_DIR });
run(`${gradle} bundleRelease${GRADLE_SIGNING_ARGS}`, { cwd: ANDROID_DIR });
run(`${gradle} assembleRelease${GRADLE_SIGNING_ARGS}`, { cwd: ANDROID_DIR });

const apkSrc = path.join(
  ANDROID_DIR,
  'app',
  'build',
  'outputs',
  'apk',
  'release',
  'app-release.apk',
);
const aabSrc = path.join(
  ANDROID_DIR,
  'app',
  'build',
  'outputs',
  'bundle',
  'release',
  'app-release.aab',
);

for (const f of [apkSrc, aabSrc]) {
  if (!fs.existsSync(f)) {
    console.error(`Build finished but expected output is missing: ${f}`);
    process.exit(1);
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.copyFileSync(apkSrc, path.join(OUT_DIR, `myscorekeeper-${version}.apk`));
fs.copyFileSync(aabSrc, path.join(OUT_DIR, `myscorekeeper-${version}.aab`));

console.log(
  `\nDone. Wrote:\n${path.join(OUT_DIR, `myscorekeeper-${version}.apk`)}\n` +
    `${path.join(OUT_DIR, `myscorekeeper-${version}.aab`)}`,
);
