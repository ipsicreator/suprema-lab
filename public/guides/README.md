This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## SNS Login Setup (Google / Naver / Kakao)

1. Install dependencies
```bash
npm install
```

2. Create env file
```bash
cp .env.example .env.local
```

3. Fill OAuth credentials in `.env.local`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`
- `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`
- `AUTH_SECRET` (required)

4. Add callback URL in each provider console
- local: `http://localhost:3000/api/auth/callback/{provider}`
- production: `https://<your-domain>/api/auth/callback/{provider}`

5. Run
```bash
npm run dev
```

## Billing API (monthly / 3 months / 6 months / one-time)

- `GET /api/platform/billing`
  - 플랜, 내 구독, 주문 조회

- `POST /api/platform/billing`
  - 결제 요청 생성
  - body example (정기 3개월):
```json
{
  "planId": "plan_starter",
  "billingType": "subscription",
  "termMonths": 3,
  "provider": "toss"
}
```
  - body example (1회 결제, 별도 금액):
```json
{
  "planId": "plan_pro",
  "billingType": "one_time",
  "overrideAmountKrw": 250000,
  "provider": "manual"
}
```

- `PATCH /api/platform/billing`
  - 상품 가격/기간 설정 변경
```json
{
  "planId": "plan_starter",
  "monthlyPriceKrw": 59000,
  "oneTimePriceKrw": 149000,
  "availableTermsMonths": [1, 3, 6]
}
```

## Execution Order (1 -> 2 -> 3)

1. Payment flow
- Open `/billing`
- Choose plan / monthly(1,3,6) or one-time
- Click payment button to create order and open Toss payment window
- After redirect to `/billing/success`, platform calls confirm API automatically

2. Webhook flow
- Set Toss webhook to `POST /api/webhooks/toss`
- On payment event, order/subscription status updates automatically

3. Admin pricing
- Open `/admin/pricing`
- Update monthly/one-time price and allowed month terms
- Save per plan

## Required Env for production

- `NEXT_PUBLIC_TOSS_CLIENT_KEY`: Toss client key (frontend checkout)
- `TOSS_SECRET_KEY`: Toss secret key (server confirm API)
- `TOSS_WEBHOOK_SECRET`: Toss webhook verification secret
- `ADMIN_EMAILS`: comma-separated admin account emails for `/api/platform/billing` PATCH

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
