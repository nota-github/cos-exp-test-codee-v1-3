import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const workspaceRoot = process.cwd();
const distAssetsDir = resolve(workspaceRoot, 'dist/assets');
const createAppPath = resolve(workspaceRoot, 'src/app/createApp.ts');
const moodOptionsPath = resolve(workspaceRoot, 'src/features/mood/moodOptions.ts');
const moodSelectorPath = resolve(workspaceRoot, 'src/features/mood/moodSelector.ts');
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

console.log('Running story-1.3 automation-safe validation...');
execSync('npm run typecheck', { cwd: workspaceRoot, stdio: 'inherit' });
execSync('npm run build', { cwd: workspaceRoot, stdio: 'inherit' });

const createAppSource = readFileSync(createAppPath, 'utf8');
const moodOptionsSource = readFileSync(moodOptionsPath, 'utf8');
const moodSelectorSource = readFileSync(moodSelectorPath, 'utf8');
const stylesSource = readFileSync(stylesPath, 'utf8');
const assetFiles = readdirSync(distAssetsDir);
const builtJsPath = resolve(distAssetsDir, assetFiles.find((file) => file.endsWith('.js')) ?? '');
const builtCssPath = resolve(distAssetsDir, assetFiles.find((file) => file.endsWith('.css')) ?? '');
const builtJs = readFileSync(builtJsPath, 'utf8');
const builtCss = readFileSync(builtCssPath, 'utf8');

const optionMatches = [...moodOptionsSource.matchAll(/\{\s*key:\s*'([^']+)'\s*,\s*label:\s*'([^']+)'\s*\}/g)];
const uniqueKeys = new Set(optionMatches.map((match) => match[1]));
const labels = optionMatches.map((match) => match[2]);
const uniqueLabels = new Set(labels);
const nonConstantSources = [createAppSource, moodSelectorSource, stylesSource].join('\n');

assertCheck(
  optionMatches.length === 3 && uniqueKeys.size === 3 && uniqueLabels.size === 3,
  'story-1.3:SCOPE-1 and story-1.3:AC-1 source defines exactly three unique mood options in one constant module',
  'story-1.3:SCOPE-1 source is missing the single constant-module definition for exactly three unique mood options',
);

assertCheck(
  labels.every((label) => !nonConstantSources.includes(label)),
  'story-1.3:AC-4 source keeps mood labels out of app wiring and styles so labels live only in the constant module',
  'story-1.3:AC-4 source duplicates mood label strings outside the constant module',
);

assertCheck(
  /createMoodSelector\('mood-title'\)/.test(createAppSource) &&
    !/const moodLabels/.test(createAppSource) &&
    !/aria-pressed="false"/.test(createAppSource),
  'story-1.3:SCOPE-2 source wires the mood panel through the dedicated selector module',
  'story-1.3:SCOPE-2 source still contains the old static mood preview or is missing the selector module wiring',
);

assertCheck(
  /fieldset class="mood-selector"/.test(moodSelectorSource) &&
    /type="radio"/.test(moodSelectorSource) &&
    /name="\$\{MOOD_GROUP_NAME\}"/.test(moodSelectorSource) &&
    /aria-labelledby="\$\{labelledBy\}"/.test(moodSelectorSource),
  'story-1.3:SCOPE-4 and story-1.3:AC-2 source use one accessible radio group for the three mood choices',
  'story-1.3:SCOPE-4 source is missing the expected accessible radio-group markup',
);

assertCheck(
  /\.mood-option__input:checked \+ \.mood-option__content/.test(stylesSource) &&
    /\.mood-option__input:focus-visible \+ \.mood-option__content/.test(stylesSource) &&
    /border-color:\s*var\(--accent\)/.test(stylesSource) &&
    /color:\s*var\(--accent\)/.test(stylesSource),
  'story-1.3:SCOPE-3 and story-1.3:AC-3 source styles clearly separate selected mood state by border, background, and text color',
  'story-1.3:SCOPE-3 source is missing the expected selected/focus mood styles',
);

assertCheck(
  /min-height:\s*4rem/.test(stylesSource) &&
    /gap:\s*0\.75rem/.test(stylesSource) &&
    /@media \(max-width: 640px\)[\s\S]*\.mood-options\s*\{\s*grid-template-columns:\s*1fr;/.test(stylesSource),
  'story-1.3:AC-5 source provides tap-sized controls, visible spacing, and a mobile single-column mood layout',
  'story-1.3:AC-5 source is missing the expected mobile tap-target sizing or spacing',
);

assertCheck(
  /today-mood/.test(builtJs) &&
    /type="radio"/.test(builtJs) &&
    /data-mood-key=/.test(builtJs),
  'story-1.3:AC-1 and story-1.3:AC-2 built bundle preserve the three-choice single-select radio markup',
  'story-1.3 built bundle is missing the expected single-select mood markup',
);

assertCheck(
  /\.mood-option__input:checked\+\.mood-option__content/.test(builtCss) &&
    /\.mood-option__input:focus-visible\+\.mood-option__content/.test(builtCss) &&
    /\.mood-options/.test(builtCss),
  'story-1.3:AC-3 and story-1.3:AC-5 built CSS preserves selected-state and mobile-ready mood styles',
  'story-1.3 built CSS is missing the expected mood selector styles',
);

if (failed) {
  process.exitCode = 1;
  console.error('story-1.3 automation-safe validation failed.');
} else {
  console.log('story-1.3 automation-safe validation passed.');
}
