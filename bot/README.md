# LACZEK MD WhatsApp Runtime

Independent Node.js WhatsApp runtime for the LACZEK MD dashboard. This service does not call Jawad's backend.

## Included foundation

- WhatsApp multi-device connection using Baileys
- QR code retrieval and pairing-code generation through protected endpoints
- Persistent multi-file authentication state
- Reconnect handling for temporary disconnects
- Protected status, command-list, pairing and disconnect endpoints
- Starter commands: `.ping`, `.menu`, `.alive`
- Health endpoint for hosting checks

## Local setup

1. Use Node.js 20 or newer.
2. Copy `.env.example` to `.env`.
3. Set a long random `DASHBOARD_API_KEY`.
4. Run `npm install` then `npm start`.

The WhatsApp account is linked by scanning the QR or requesting a pairing code from the protected API. Keep the auth directory private. Never commit session files or API keys.

## API

- `GET /health` public hosting health check
- `GET /api/status` protected by `x-dashboard-key`
- `GET /api/commands` protected
- `GET /api/qr` protected; returns the current QR string and a data URL
- `POST /api/pairing-code` protected; JSON body: `{"phoneNumber":"2567XXXXXXXX"}`
- `POST /api/disconnect` protected

## Render

The repository-level `render.yaml` defines a web service with a persistent disk for WhatsApp credentials. A persistent disk requires a paid Render instance. Do not deploy or attach paid resources until the plan and cost are approved.

## Important

Baileys is an unofficial WhatsApp Web client library, not the official WhatsApp Business Platform. WhatsApp may change its protocol or restrict accounts. Use an account you control, respect consent and group rules, and do not use this bot for spam or unsolicited bulk messaging.
