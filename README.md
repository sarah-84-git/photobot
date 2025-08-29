# Photobot — Photo Q&A Bot

A tiny Next.js app that lets you upload a photo and ask a question about it. Built to stay **separate** from your Fireside chatbot.

## Quick start

```bash
pnpm i  # or npm i / yarn
cp .env.example .env.local  # or create manually
pnpm dev
```

Open http://localhost:3000

## Environment

- `OPENAI_API_KEY` — required.

## Deploy

1. Push this repo to GitHub.
2. In Vercel, **New Project** → import this repo → add `OPENAI_API_KEY` in **Environment Variables**.
3. Deploy.

## Notes

- This starter sends the image as a Data URL to the API. No database or blob storage is used.
- If you want persistence or bigger images, add Vercel Blob or Cloudinary later.
