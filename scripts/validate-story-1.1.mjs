import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const workspaceRoot = process.cwd();
const distAssetsDir = resolve(workspaceRoot, 'dist/assets');
const createAppPath = resolve(workspaceRoot, 'src/app/createApp.ts');
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

console.log('Running story-1.1 automation-safe validation...');
execSync('npm run typecheck', { cwd: workspaceRoot, stdio: 'inherit' });
execSync('npm run build', { cwd: workspaceRoot, stdio: 'inherit' });

const sourceMarkup = readFileSync(createAppPath, 'utf8');
const sourceStyles = readFileSync(stylesPath, 'utf8');
const assetFiles = readdirSync(distAssetsDir);
const builtJsPath = resolve(distAssetsDir, assetFiles.find((file) => file.endsWith('.js')) ?? '');
const builtCssPath = resolve(distAssetsDir, assetFiles.find((file) => file.endsWith('.css')) ?? '');
const builtJs = readFileSync(builtJsPath, 'utf8');
const builtCss = readFileSync(builtCssPath, 'utf8');

assertCheck(
  /오늘 날짜/.test(sourceMarkup) &&
    /오늘의 기분/.test(sourceMarkup) &&
    /할 일 세 가지/.test(sourceMarkup) &&
    /짧은 메모/.test(sourceMarkup),
  'story-1.1:AC-2 source markup includes date, mood, todo, and memo sections',
  'story-1.1:AC-2 source markup is missing one or more required sections',
);

assertCheck(
  /오늘 날짜/.test(builtJs) &&
    /오늘의 기분/.test(builtJs) &&
    /할 일 세 가지/.test(builtJs) &&
    /짧은 메모/.test(builtJs),
  'story-1.1:AC-2 built bundle preserves the four main sections',
  'story-1.1:AC-2 built bundle is missing one or more required section labels',
);

assertCheck(
  /dashboard-grid/.test(sourceMarkup) &&
    /@media \(min-width: 860px\)[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/.test(sourceStyles),
  'story-1.1:AC-3 source styles define a desktop two-column dashboard grid',
  'story-1.1:AC-3 source styles are missing the desktop two-column dashboard rule',
);

assertCheck(
  /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/.test(builtCss),
  'story-1.1:AC-3 built CSS contains the desktop two-column dashboard rule',
  'story-1.1:AC-3 built CSS is missing the desktop two-column dashboard rule',
);

assertCheck(
  /button:focus-visible/.test(sourceStyles) &&
    /input:focus-visible/.test(sourceStyles) &&
    /textarea:focus-visible/.test(sourceStyles) &&
    /outline:\s*3px solid/.test(sourceStyles),
  'story-1.1:AC-4 source styles define visible focus treatment for controls',
  'story-1.1:AC-4 source styles are missing the expected focus treatment',
);

assertCheck(
  /outline:3px solid/.test(builtCss) &&
    /button,input,textarea\{border:1px solid var\(--border\)/.test(builtCss) &&
    /border-radius:var\(--radius-control\)/.test(builtCss),
  'story-1.1:AC-4 built CSS preserves focus and control boundary styling',
  'story-1.1:AC-4 built CSS is missing focus or control boundary styling',
);

assertCheck(
  !/\brouter\b/i.test(sourceMarkup) &&
    !/\bmodal\b/i.test(sourceMarkup) &&
    !/\baccordion\b/i.test(sourceMarkup) &&
    !/\btabs?\b/i.test(sourceMarkup),
  'story-1.1:AC-5 source markup does not introduce routing, modal, tab, or accordion dependencies',
  'story-1.1:AC-5 source markup appears to introduce a disallowed dependency',
);

if (failed) {
  process.exitCode = 1;
  console.error('story-1.1 automation-safe validation failed.');
} else {
  console.log('story-1.1 automation-safe validation passed.');
}
