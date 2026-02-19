# CLAUDE.md

## Purpose
Operational guardrails for editing text/data files in this repository.

## Encoding Rules (Critical)
- Always read and write text files as UTF-8.
- Do not use ANSI/CP949/EUC-KR when saving JSON/Markdown.
- Prefer tools that preserve UTF-8 exactly.

## PowerShell Safe Write Rules
- Avoid direct Korean literals in PowerShell here-strings when possible.
- If writing Korean text via script, prefer Unicode escapes (`\uXXXX`) in JSON-producing scripts.
- When writing files from PowerShell, use .NET UTF-8 without BOM:
  - `[System.IO.File]::WriteAllText($path, $content, New-Object System.Text.UTF8Encoding($false))`

## JSON Editing Rules
- Keep `src/data/questions.json` valid UTF-8 JSON.
- After edits, run a validation read with Node:
  - `node -e "JSON.parse(require('fs').readFileSync('src/data/questions.json','utf8')); console.log('ok')"`
- If any text appears as `???`, treat it as corruption and restore immediately.

## Verification Checklist (after text edits)
1. Confirm target strings are readable in `node` output.
2. Confirm no accidental `?` replacement for Korean characters.
3. Run build once: `pnpm run build`.

## Notes
- Terminal rendering can be wrong even if file is correct. Verify with code points if needed.
- Prefer minimal, surgical edits to avoid broad re-encoding side effects.
