# JSB77

React + Vite frontend application.

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

## Vercel Deployment

1. Import this repository in [Vercel](https://vercel.com).
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configure Environment Variables (refer to `.env.example`):
   - `VITE_API_BASE_URL_DEV`
   - `VITE_API_BASE_URL_PROD`
   - `VITE_PAYLOAD_ENC_KEY`
   - `VITE_CRYPTO_SECRET`
   - `VITE_SITE_DOMAIN`
