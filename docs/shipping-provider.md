# Shipping provider layer

The shipping module separates Wornora's cart and order logic from any delivery partner.

## Current provider

`SHIPPING_PROVIDER=mock` is the default. It returns simulated pincode serviceability, courier choices, delivery estimates, and delivery charges without making an external API call.

Use `SHIPPING_PICKUP_POSTAL_CODE` to configure the warehouse or pickup pincode. It defaults to `751003` for local development.

## Quote endpoint

```http
POST /api/shipping/quote
Authorization: Bearer <customer-jwt>
Content-Type: application/json

{
  "shippingAddressId": "<saved-address-id>",
  "paymentMethod": "COD"
}
```

The backend reads the authenticated customer's cart and saved address. It never accepts a delivery price from the browser.

## Product shipment data

Products may include `shippingDimensions`:

```json
{
  "weightKg": 0.25,
  "lengthCm": 20,
  "widthCm": 15,
  "heightCm": 5
}
```

Until catalog products are updated, the mock provider uses an explicitly reported fallback package size. A real provider integration should require real product shipment dimensions before booking a shipment.

## Order totals

COD order creation recalculates the quote server-side and stores the chosen courier and delivery charge in the order. Product prices are GST-inclusive, so the current `tax` amount stays `0`.

## Adding Shiprocket later

Create a Shiprocket provider that implements `getQuote()` alongside `providers/mock-shipping.provider.js`, then update `shipping-provider.service.js` to select it when `SHIPPING_PROVIDER=shiprocket`.
