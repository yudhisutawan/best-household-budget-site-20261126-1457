// Ledgerline — entry program for the best household budget site bounty.
// Node 22, standard library only. The site itself is plain static files in
// app/ (index.html, style.css, app.js — no build step, no network requests).
// Ledgerline won the 5-candidate tournament because it is a dense,
// professional finance dashboard rather than a single-purpose tracker:
// net worth, a FIRE projection, a 6-month balance projection, and a
// what-if simulator sit next to envelope budgets, an expense log, goals,
// and a subscription audit. The SplitHouse settlement panel was merged in,
// and the Hermes ForecastFlow/KinBudget angles are included, so the entry
// covers both long-horizon planning and day-to-day household money.
// This program hands the entry in: it copies app/ and screenshots/ from
// beside this file into the output directory and writes dossier.json with
// buildDossier from the vendored make.fun library. The vendored file
// vendor/makefun-frontend.ts is the kit's copy, unchanged; the scorer
// rebuilds the dossier with its own copy and compares byte for byte.
//
// Run outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Caps from the competition's gate: at most 4 screenshots of 256 KiB each,
// app/ at most 993 files and directories and 16 MiB in all, dossier text
// capped at 160 KiB. buildDossier refuses anything past them.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);
