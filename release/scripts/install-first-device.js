#!/usr/bin/env node
/**
 * Cross-platform equivalent of:
 *
 *   adb devices | head -n 2 | tail -n 2 | cut -sf 1 | \
 *     xargs -I {} adb -s {} install release/android/myscorekeeper-$npm_package_version.apk
 *
 * Installs the release-built APK on the first connected Android device.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const { version } = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'),
);
const APK = path.join(ROOT, 'release', 'android', `myscorekeeper-${version}.apk`);

if (!fs.existsSync(APK)) {
  console.error(`APK not found: ${APK}`);
  console.error(`Run "npm run androidrelease" first.`);
  process.exit(1);
}

function findAdb() {
  const sdkHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  const dirs = [];
  if (sdkHome) dirs.push(path.join(sdkHome, 'platform-tools'));
  if (process.platform === 'win32' && process.env.LOCALAPPDATA) {
    dirs.push(path.join(process.env.LOCALAPPDATA, 'Android', 'sdk', 'platform-tools'));
  } else if (process.platform === 'darwin') {
    dirs.push(path.join(os.homedir(), 'Library', 'Android', 'sdk', 'platform-tools'));
  } else {
    dirs.push(path.join(os.homedir(), 'Android', 'sdk', 'platform-tools'));
  }
  for (const dir of dirs) {
    const exe =
      process.platform === 'win32' ? path.join(dir, 'adb.exe') : path.join(dir, 'adb');
    if (fs.existsSync(exe)) return /\s/.test(exe) ? `"${exe}"` : exe;
  }
  return 'adb';
}

const adbCmd = findAdb();

let devicesOut;
try {
  devicesOut = execSync(`${adbCmd} devices`, { encoding: 'utf8', shell: true });
} catch {
  console.error(
    `Could not run "${adbCmd}".\n` +
      'Make sure Android platform-tools (adb) is installed',
  );
  process.exit(1);
}

// adb output lines look like: "emulator-5554  device"
const serial = devicesOut
  .split(/\r?\n/)
  .map((l) => l.trim())
  .find((l) => {
    const parts = l.split(/\s+/);
    return parts[0] && parts[1] === 'device';
  })
  ?.split(/\s+/)[0];

if (!serial) {
  console.error('No connected Android device found.');
  console.error('Attach a device (USB debugging enabled) and try again.');
  process.exit(1);
}

console.log(`Installing on device: ${serial}`);
// quote the path so it also works with spaces
execSync(`${adbCmd} -s ${serial} install "${APK}"`, {
  shell: true,
  stdio: 'inherit',
});
