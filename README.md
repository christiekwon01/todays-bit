# Today's Bit

Daily speaking practice for [@dailybit](https://instagram.com/dailybit). One prompt per day, record your bit, save and post as **Day XX of Today's Bit**.

## Quick start

```bash
npm install
npm run dev
```

Open on your phone (same Wi‑Fi): use the network URL Vite prints.

## Prompt library

Prompts live in [`speaking_prompt_library.md`](./speaking_prompt_library.md) (260 prompts). The app parses this file at runtime.

To regenerate the default library:

```bash
node scripts/seed-prompts.mjs
```

Replace `speaking_prompt_library.md` with your own file using the same format:

```markdown
## Category Name

1. First prompt text
2. Second prompt text
```

## Features

- Daily prompt (stable until local midnight)
- 30s optional thinking timer
- Browser recording (90s max) with playback
- Save download + Web Share (iOS Instagram / Files)
- Streak + calendar progress in `localStorage`
- Dark mode, shuffle prompt, export JSON, stats

## Build

```bash
npm run build
npm run preview
```

## iPhone notes

- Allow microphone when prompted
- Prefer **Share** if download is hard to find
- Saved files: **Files → Downloads** (`day-N-todays-bit.m4a` or `.webm`)
- Caption: **Day N of Today's Bit**
