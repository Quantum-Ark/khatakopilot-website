# KhataCopilot website (download hub + legal pages)

Static, dependency-free. Open `index.html` directly or serve the folder:

```bash
cd website && python3 -m http.server 8080   # -> http://localhost:8080/
```

## Files

| File | Purpose |
|------|---------|
| `index.html` | Story + features + 5-OS download grid + FAQ |
| `styles.css` | Editorial paper/ink theme, motion (reveal, ticker, phone demo) |
| `app.js` | OS auto-detect, counters, typewriter ledger, accordion, steps toggles |
| `privacy.html` / `terms.html` / `delete-account.html` | Public legal pages Play + App Store require (mirror of in-app `LegalDocs`; replace `[...]` + lawyer-review before release) |

## Download wiring

- **Android / Windows** buttons point at the **Public GitHub Release**
  `https://github.com/Quantum-Ark/khatacopilot-releases/releases/download/v1.0.0/…`
  (APK ~95 MB, Setup EXE ~15 MB, portable ZIP ~18 MB — SHA-256 shown on-page,
  full sums in repo `dist/SHA256SUMS.txt`).
- Never commit binaries: `website/dist/` holds optional local copies for
  offline preview and is git-ignored.
- **macOS / Linux / iOS** cards carry build/runbook steps until signed artifacts exist
  (`scripts/build-macos-dmg.sh`, `flutter build linux --release`, TestFlight).
- Before public hosting: upload `dist/` artifacts to a stable HTTPS host
  (e.g. `https://downloads.yourdomain.com/…`), swap the two `href`s, publish
  `release/latest.json` with real hashes, and set
  `https://yourdomain.com/{privacy,terms,delete-account}` as the store URLs.
