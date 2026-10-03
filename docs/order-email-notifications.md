# Order Email Notifications

Order emails are best-effort notifications. Creating an order, changing an order status, and cancelling an order still succeed if email delivery is unavailable.

## Events

- A customer receives an order confirmation after a COD order is placed.
- The configured admin address receives a new-order alert.
- A customer receives an update when an admin changes the order status.
- A customer receives an update when they cancel an eligible order.

## Environment configuration

Configure these values in the Render backend service. Never put the API key in Vercel or the frontend project.

```env
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_your_resend_api_key
EMAIL_FROM="Wornora <orders@your-verified-domain.com>"
ADMIN_ORDER_EMAIL=admin@yourdomain.com
FRONTEND_URL=https://wornora.vercel.app
```

`EMAIL_FROM` must use a domain verified with the email provider. `FRONTEND_URL` is optional; when present, the admin email includes a direct link to the admin order detail page.

For local development only, use `EMAIL_PROVIDER=console`. It logs notification subjects to the backend terminal instead of sending an email.
