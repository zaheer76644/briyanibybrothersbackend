# Biryani By Brothers — Backend API

Node.js + Express + MongoDB API for the React storefront in `../frontend`.

## Setup

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run seed:admin
npm run dev
```

API: `http://localhost:5000/api/health`

## Auth

- Customer cookie: `bbb_customer_token` (HttpOnly)
- Admin cookie: `bbb_admin_token` (HttpOnly)

## Tests

```bash
npm test
```
