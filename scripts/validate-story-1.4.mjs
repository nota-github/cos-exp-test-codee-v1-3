import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const workspaceRoot = process.cwd();
const distAssetsDir = resolve(workspaceRoot, 'dist/assets');
const createAppPath = resolve(workspaceRoot, 'src/app/createApp.ts');
const todoSlotsPath = resolve(workspaceRoot, 'src/features/todos/todoSlots.ts');
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

console.log('Running story-1.4 automation-safe validation...');
execSync('npm run typecheck', { cwd: workspaceRoot, stdio: 'inherit' });
execSync('npm run build', { cwd: workspaceRoot, stdio: 'inherit' });

const createAppSource = readFileSync(createAppPath, 'utf8');
const todoSlotsSource = readFileSync(todoSlotsPath, 'utf8');
const stylesSource = readFileSync(stylesPath, 'utf8');
const assetFiles = readdirSync(distAssetsDir);
const builtJsPath = resolve(distAssetsDir, assetFiles.find((file) => file.endsWith('.js')) ?? '');
const builtCssPath = resolve(distAssetsDir, assetFiles.find((file) => file.endsWith('.css')) ?? '');
const builtJs = readFileSync(builtJsPath, 'utf8');
const builtCss = readFileSync(builtCssPath, 'utf8');

const slotMatches = [...todoSlotsSource.matchAll(/\{\s*id:\s*'([^']+)'\s*,\s*placeholder:\s*'([^']+)'\s*\}/g)];
const uniqueIds = new Set(slotMatches.map((match) => match[1]));
const uniquePlaceholders = new Set(slotMatches.map((match) => match[2]));
const builtSlotDefinitions = builtJs.match(/\{id:"todo-[^"]+",placeholder:"[^"]+"\}/g) ?? [];

assertCheck(
  slotMatches.length === 3 && uniqueIds.size === 3 && uniquePlaceholders.size === 3,
  'story-1.4:SCOPE-1 and story-1.4:AC-1 source defines exactly three unique todo slots',
  'story-1.4:SCOPE-1 source is missing the fixed three-slot todo definition',
);

assertCheck(
  /createTodoSlots\('todo-title'\)/.test(createAppSource) &&
    !/const todoExamples/.test(createAppSource) &&
    !/<ul class="todo-list"/.test(createAppSource),
  'story-1.4:GOAL-1 source wires the todo panel through the dedicated todoSlots module',
  'story-1.4:GOAL-1 source still contains inline todo row markup or is missing todoSlots wiring',
);

assertCheck(
  /aria-labelledby="\$\{labelledBy\}"/.test(todoSlotsSource) &&
    /data-todo-slot="\$\{slot\.id\}"/.test(todoSlotsSource) &&
    /type="checkbox"/.test(todoSlotsSource) &&
    /type="text"/.test(todoSlotsSource),
  'story-1.4:SCOPE-2 and story-1.4:AC-2 source render one checkbox and one text input in each todo row',
  'story-1.4:SCOPE-2 source is missing the expected checkbox/text input row structure',
);

assertCheck(
  /const checkboxId = `\$\{slot\.id\}-checkbox`/.test(todoSlotsSource) &&
    /const inputId = `\$\{slot\.id\}-input`/.test(todoSlotsSource) &&
    /for="\$\{checkboxId\}"/.test(todoSlotsSource) &&
    /for="\$\{inputId\}"/.test(todoSlotsSource),
  'story-1.4:SCOPE-3 and story-1.4:AC-3 source keeps each row wired to its own checkbox and input ids',
  'story-1.4:SCOPE-3 source is missing unique row-level checkbox/input wiring',
);

assertCheck(
  !/type="button"/.test(todoSlotsSource) &&
    !/추가|삭제|재정렬/.test(todoSlotsSource) &&
    !/add|remove|reorder/.test(todoSlotsSource),
  'story-1.4:AC-4 source exposes no add, delete, or reorder controls',
  'story-1.4:AC-4 source appears to expose controls outside the fixed three-slot scope',
);

assertCheck(
  /\.todo-row\s*\{[\s\S]*grid-template-columns:\s*3\.1rem minmax\(0,\s*1fr\)/.test(stylesSource) &&
    /\.todo-row__checkbox\s*\{[\s\S]*min-height:\s*3\.35rem/.test(stylesSource) &&
    /@media \(max-width: 640px\)[\s\S]*\.todo-row\s*\{[\s\S]*grid-template-columns:\s*3\.25rem minmax\(0,\s*1fr\)/.test(stylesSource),
  'story-1.4:SCOPE-4 and story-1.4:AC-5 source provide separated checkbox/input spacing for desktop and mobile',
  'story-1.4:SCOPE-4 source is missing the expected todo spacing or mobile layout adjustments',
);

assertCheck(
  builtSlotDefinitions.length === 3 &&
    /data-todo-slot="\$\{/.test(builtJs) &&
    /type="checkbox"/.test(builtJs) &&
    /type="text"/.test(builtJs) &&
    /-checkbox/.test(builtJs) &&
    /-input/.test(builtJs),
  'story-1.4:AC-1, story-1.4:AC-2, and story-1.4:AC-3 built bundle preserve the three-slot todo template and row-level field wiring',
  'story-1.4 built bundle is missing the expected three-slot todo definitions or row template markup',
);

assertCheck(
  /\.todo-row\{/.test(builtCss) &&
    /\.todo-row__checkbox\{/.test(builtCss) &&
    /\.todo-row__checkbox-input\{/.test(builtCss),
  'story-1.4:AC-5 built CSS preserves todo-row spacing and checkbox hit-area styling',
  'story-1.4 built CSS is missing the expected todo-row styling hooks',
);

if (failed) {
  process.exitCode = 1;
  console.error('story-1.4 automation-safe validation failed.');
} else {
  console.log('story-1.4 automation-safe validation passed.');
}
