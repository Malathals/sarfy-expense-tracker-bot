# Sarfy Expense Tracker Bot

A Telegram bot that tracks expenses from bank transaction notifications or manual input.

## Features

- Parse bank transaction notifications (Arabic format)
- Manual expense entry via Telegram
- Save expenses to PostgreSQL via Prisma
- REST API for querying expenses
- Production-ready setup with rate limiting, security headers, and structured logging

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express
- **Database:** PostgreSQL + Prisma ORM
- **Logger:** Pino
- **Security:** Helmet, CORS, express-rate-limit

## Project Structure

```
src/
├── controllers/        # Request handlers (no DB calls)
│   ├── expenses.controller.ts
│   └── telegram.controller.ts
├── services/           # DB layer
│   └── expense.service.ts
├── routes/             # Route definitions
│   ├── index.ts
│   ├── expenses.ts
│   └── telegram.ts
├── middleware/         # Express middleware
│   ├── errorHandler.ts
│   ├── rateLimiter.ts
│   └── validateTelegramWebhook.ts
├── utils/              # Pure helper functions
│   ├── expense.utils.ts
│   ├── telegram.utils.ts
│   └── translate.ts
├── lib/                # Shared instances
│   ├── prisma.ts
│   └── logger.ts
└── server.ts
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Docker (for PostgreSQL)

### Setup

1. Clone the repo and install dependencies:

```bash
pnpm install
```

2. Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

3. Start the database:

```bash
docker compose up -d
```

4. Run migrations and generate Prisma client:

```bash
npx prisma migrate dev
npx prisma generate
```

5. Start the dev server:

```bash
pnpm dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `TELEGRAM_BOT_TOKEN` | From [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_WEBHOOK_SECRET` | Optional secret to verify webhook requests |
| `GEMINI_API_KEY` | From [Google AI Studio](https://aistudio.google.com) |
| `PORT` | Server port (default: 3000) |
| `NODE_ENV` | `development` or `production` |
| `ALLOWED_ORIGIN` | CORS allowed origin |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/v1/expenses` | Get all expenses |
| `GET` | `/api/v1/expenses/today` | Get today's expenses and total |
| `POST` | `/api/v1/expenses` | Create expense manually |
| `POST` | `/api/v1/telegram/webhook` | Telegram webhook |

## Telegram Usage

**Commands:**
| Command | Description |
|---|---|
| `/today` | Show today's expenses and total |
| `/total` | Show all-time expenses and total |

**Manual entry:**
```
coffee 18
قهوة 18
```

**Bank notification:** Forward your bank SMS/notification directly — the bot extracts the amount and merchant, then asks what you bought.
