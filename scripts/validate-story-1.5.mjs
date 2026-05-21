import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const workspaceRoot = process.cwd();
const distAssetsDir = resolve(workspaceRoot, 'dist/assets');
const createAppPath = resolve(workspaceRoot, 'src/app/createApp.ts');
const memoFieldPath = resolve(workspaceRoot, 'src/features/memo/memoField.ts');
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

console.log('Running story-1.5 automation-safe validation...');
execSync('npm run typecheck', { cwd: workspaceRoot, stdio: 'inherit' });
execSync('npm run build', { cwd: workspaceRoot, stdio: 'inherit' });

const createAppSource = readFileSync(createAppPath, 'utf8');
const memoFieldSource = readFileSync(memoFieldPath, 'utf8');
const stylesSource = readFileSync(stylesPath, 'utf8');
const assetFiles = readdirSync(distAssetsDir);
const builtJsPath = resolve(distAssetsDir, assetFiles.find((file) => file.endsWith('.js')) ?? '');
const builtCssPath = resolve(distAssetsDir, assetFiles.find((file) => file.endsWith('.css')) ?? '');
const builtJs = readFileSync(builtJsPath, 'utf8');
const builtCss = readFileSync(builtCssPath, 'utf8');

assertCheck(
  /createMemoField\('memo-title'\)/.test(createAppSource) &&
    /panel panel--memo/.test(createAppSource) &&
    /짧은 메모/.test(createAppSource) &&
    !/<textarea rows=/.test(createAppSource),
  'story-1.5:GOAL-1, story-1.5:SCOPE-2, and story-1.5:AC-3 source wire the memo section through a dedicated module that remains visible on first paint',
  'story-1.5 source is missing the memo module wiring or still contains inline memo markup',
);

assertCheck(
  /export function createMemoField/.test(memoFieldSource) &&
    /<textarea/.test(memoFieldSource) &&
    /rows="8"/.test(memoFieldSource) &&
    /name="todayMemo"/.test(memoFieldSource),
  'story-1.5:SCOPE-1 and story-1.5:AC-1 source define a dedicated multiline textarea memo field',
  'story-1.5:SCOPE-1 source is missing the expected dedicated textarea memo field',
);

assertCheck(
  /memo-field__label/.test(memoFieldSource) &&
    /memo-field__hint/.test(memoFieldSource) &&
    /aria-describedby="\$\{MEMO_HINT_ID\}"/.test(memoFieldSource),
  'story-1.5:SCOPE-2 source includes memo-specific label and supporting description text',
  'story-1.5:SCOPE-2 source is missing the memo label or supporting description text',
);

assertCheck(
  /\.panel--memo\s*\{[\s\S]*border-color:/.test(stylesSource) &&
    /\.memo-field\s*\{[\s\S]*display:\s*grid/.test(stylesSource) &&
    /\.memo-field__input\s*\{[\s\S]*min-height:\s*11rem/.test(stylesSource),
  'story-1.5:SCOPE-3 and story-1.5:AC-2 source provide a visually distinct memo card and memo field styling',
  'story-1.5:SCOPE-3 source is missing the expected memo card or field styling',
);

assertCheck(
  /\.memo-field__input\s*\{[\s\S]*padding:\s*1rem 1rem 1\.1rem/.test(stylesSource) &&
    /@media \(max-width: 640px\)[\s\S]*\.memo-field__input\s*\{[\s\S]*min-height:\s*9\.5rem/.test(stylesSource),
  'story-1.5:SCOPE-4 and story-1.5:AC-4 source provide comfortable default height and mobile padding for memo entry',
  'story-1.5:SCOPE-4 source is missing the expected memo height or mobile padding rules',
);

assertCheck(
  /today-memo/.test(builtJs) &&
    /todayMemo/.test(builtJs) &&
    /textarea/.test(builtJs) &&
    /짧게 이어 적는 오늘 메모/.test(builtJs),
  'story-1.5:AC-1 and story-1.5:AC-3 built bundle preserve the visible memo textarea surface',
  'story-1.5 built bundle is missing the expected memo textarea surface',
);

assertCheck(
  /\.panel--memo/.test(builtCss) &&
    /\.memo-field__input/.test(builtCss) &&
    /\.memo-field__hint/.test(builtCss),
  'story-1.5:AC-2 and story-1.5:AC-4 built CSS preserves memo card distinction and textarea sizing hooks',
  'story-1.5 built CSS is missing the expected memo styling hooks',
);

if (failed) {
  process.exitCode = 1;
  console.error('story-1.5 automation-safe validation failed.');
} else {
  console.log('story-1.5 automation-safe validation passed.');
}
