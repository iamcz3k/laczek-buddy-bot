# LACZEK MD WhatsApp Runtime

Independent Node.js WhatsApp runtime for the LACZEK MD dashboard. It does not call Jawad's backend.

## Features in this phase

- Baileys multi-device connection, QR and pairing-code endpoints
- Persistent authentication state and reconnect handling
- Protected status, command-list, pairing and disconnect endpoints
- Group tools: `.groupinfo`, `.antilink on/off`, `.antispam on/off`, `.kick`, `.promote`, `.demote`, `.warn`, `.warnings`, `.resetwarn`, `.tagall`
- Anti-link deletion and warning escalation when the bot is a group admin
- Basic flood and repeated-message detection
- Media tools: `.sticker` from a replied image, `.toimage`, and `.compress`
- Starter commands: `.ping`, `.menu`, `.alive`

## Local setup

1. Use Node.js 20 or newer.
2. Copy `.env.example` to `.env`.
3. Set a long random `DASHBOARD_API_KEY`.
4. Run `npm install`, `npm run check`, then `npm start`.

The WhatsApp account is linked by scanning the QR or requesting a pairing code from the protected API. Keep the auth and data directories private. Never commit session files or API keys.

## API

- `GET /health` public hosting health check
- `GET /api/status` protected by `x-dashboard-key`
- `GET /api/commands` protected
- `GET /api/qr` protected; returns the current QR string and a data URL
- `POST /api/pairing-code` protected; JSON body: `{"phoneNumber":"2567XXXXXXXX"}`
- `POST /api/disconnect` protected

## Render

The repository-level `render.yaml` defines a web service with a persistent disk for WhatsApp credentials and group settings. A persistent disk requires a paid Render instance. Do not deploy or attach paid resources until the plan and cost are approved.

## Important

Baileys is an unofficial WhatsApp Web client library, not the official WhatsApp Business Platform. WhatsApp may change its protocol or restrict accounts. Use an account you control, respect consent and group rules, and do not use this bot for spam or unsolicited bulk messaging.
