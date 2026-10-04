# Razorpay Test Mode

Razorpay is implemented as an online-payment alternative to COD. The backend creates the Razorpay order and verifies the payment signature; the browser never receives the Razorpay key secret.

## Environment variables

Add these values only to the backend `.env` for local development and the backend service environment for QA:

```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

Use Test Mode keys while developing. Do not add `RAZORPAY_KEY_SECRET` to Vercel or to any frontend environment file.

## API flow

1. `POST /api/payments/razorpay/order` creates a pending Wornora order and a Razorpay order using the backend-calculated cart total.
2. The frontend opens Razorpay Standard Checkout with the returned public key ID and Razorpay order ID.
3. `POST /api/payments/razorpay/verify` verifies Razorpay's HMAC signature before the local order becomes `PLACED` and `PAID`.

The backend recalculates product subtotal, coupon discount, and shipping charges before creating the payment order. A browser-supplied amount is never used.

## Test checklist

- Select **Pay Online** in the cart.
- Complete a Test Mode success payment in Razorpay Checkout.
- Confirm the Wornora order becomes `PLACED` with payment status `PAID`.
- Confirm stock is reduced and the cart is cleared only after signature verification.
- Test a failed or dismissed payment and confirm the cart remains available.
