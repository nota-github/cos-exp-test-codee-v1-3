import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const workspaceRoot = process.cwd();
const distAssetsDir = resolve(workspaceRoot, 'dist/assets');
const createAppPath = resolve(workspaceRoot, 'src/app/createApp.ts');
const dateDisplayPath = resolve(workspaceRoot, 'src/features/header/dateDisplay.ts');
const formatDatePath = resolve(workspaceRoot, 'src/lib/formatDate.ts');
const stylesPath = resolve(workspaceRoot, 'src/styles.css');

let failed = false;

function logPass(message) {
  console.log(`PASS ${message}`);
}

function logFail(message) {
  console.error(`FAIL ${message}`);
  failed = true;
}

function assertCheck(condition, passMessage, failMessage) {
  if (condition) {
    logPass(passMessage);
    return;
  }

  logFail(failMessage);
}

console.log('Running story-1.2 automation-safe validation...');
execSync('npm run typecheck', { cwd: workspaceRoot, stdio: 'inherit' });
execSync('npm run build', { cwd: workspaceRoot, stdio: 'inherit' });

const createAppSource = readFileSync(createAppPath, 'utf8');
const dateDisplaySource = readFileSync(dateDisplayPath, 'utf8');
const formatDateSource = readFileSync(formatDatePath, 'utf8');
const stylesSource = readFileSync(stylesPath, 'utf8');
const assetFiles = readdirSync(distAssetsDir);
const builtJsPath = resolve(distAssetsDir, assetFiles.find((file) => file.endsWith('.js')) ?? '');
const builtCssPath = resolve(distAssetsDir, assetFiles.find((file) => file.endsWith('.css')) ?? '');
const builtJs = readFileSync(builtJsPath, 'utf8');
const builtCss = readFileSync(builtCssPath, 'utf8');

assertCheck(
  /new Date\(\)/.test(dateDisplaySource),
  'story-1.2:SCOPE-1 source uses the current browser date for header rendering',
  'story-1.2:SCOPE-1 source is missing the current browser date call',
);

assertCheck(
  /Intl\.DateTimeFormat/.test(formatDateSource) && /navigator\.language/.test(formatDateSource),
  'story-1.2:AC-2 formatter uses browser locale and client-side date formatting only',
  'story-1.2:AC-2 formatter is missing the expected client-side locale/date logic',
);

assertCheck(
  /from '\.\.\/\.\.\/lib\/formatDate'/.test(dateDisplaySource) && /formatDate\(now\)/.test(dateDisplaySource),
  'story-1.2:AC-3 header date display imports and uses the shared formatter module',
  'story-1.2:AC-3 header date display is not wired through the shared formatter module',
);

assertCheck(
  /createHeaderDateDisplay\(\)/.test(createAppSource) &&
    /page-header__topline/.test(createAppSource) &&
    /page-header__date/.test(dateDisplaySource) &&
    !/기기 기준 오늘 날짜가 이 위치에 표시됩니다/.test(createAppSource),
  'story-1.2:AC-1 source wires the date into the top header without the old placeholder',
  'story-1.2:AC-1 source is missing the live header date wiring or still contains the placeholder copy',
);

assertCheck(
  /page-header__topline/.test(stylesSource) &&
    /page-header__date-value/.test(stylesSource) &&
    /font-size:\s*clamp\(1\.3rem,\s*2vw,\s*1\.75rem\)/.test(stylesSource),
  'story-1.2:AC-4 source styles emphasize the header date before other inputs',
  'story-1.2:AC-4 source styles are missing the expected header date hierarchy',
);

assertCheck(
  /page-header__date/.test(builtJs) &&
    /Intl\.DateTimeFormat/.test(builtJs) &&
    !/기기 기준 오늘 날짜가 이 위치에 표시됩니다/.test(builtJs),
  'story-1.2:AC-1 and story-1.2:AC-3 built bundle preserve the live header date wiring',
  'story-1.2 built bundle is missing the expected header date wiring or still contains placeholder text',
);

assertCheck(
  /\.page-header__date/.test(builtCss) &&
    /\.page-header__date-value/.test(builtCss) &&
    /\.page-header__topline/.test(builtCss),
  'story-1.2:AC-4 built CSS preserves the header date hierarchy styles',
  'story-1.2 built CSS is missing the expected header date hierarchy styles',
);

if (failed) {
  process.exitCode = 1;
  console.error('story-1.2 automation-safe validation failed.');
} else {
  console.log('story-1.2 automation-safe validation passed.');
}
