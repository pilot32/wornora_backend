# Admin and Notification Roadmap

This file tracks the remaining admin-side backend and frontend work for the e-commerce platform, plus the email notification module needed for customer and admin order communication.

## Deployment deadline

The deployment deadline is Tuesday, October 6, 2026.

By this date, the platform should be ready for full deployment with the completed customer storefront, admin panel, backend APIs, QA validation, and production environment configuration.

## Work remaining before full deployment

The remaining work should be completed in this order so the project can move safely from implementation to QA and then deployment.

### 1. Finish pending feature work

- Complete the remaining admin backend APIs listed in this roadmap.
- Complete the matching admin frontend pages listed in this roadmap.
- Complete the email notification module for customer and admin order events.
- Done: complete basic product attributes on backend and frontend, including style/type, material, colors, sizes, tags, and care instructions. Full color-specific image variants remain pending.
- Clean production catalog data, including product names, categories, subcategories, prices, stock, and images.
- Keep Razorpay/payment gateway work on hold until it is explicitly approved.

### 2. Stabilize customer storefront

- Verify product listing, category filters, search, sorting, and product detail pages.
- Verify wishlist sync for logged-in users and guest users.
- Verify cart add/update/remove flows.
- Verify coupon apply/remove flows.
- Verify address create/edit/delete/default flows.
- Verify COD checkout from cart to order creation.
- Verify customer order history, order detail, cancellation, and review flows.

### 3. Stabilize admin panel

- Verify admin login and protected routes.
- Verify category, subcategory, and product management.
- Verify product image upload with real product photos.
- Verify admin order list and order status updates.
- Verify admin order detail once implemented.
- Verify coupon, customer, review, inventory, return/refund, and dashboard modules as they are completed.

### 4. QA environment testing

Before production deployment, test the website in a QA environment that uses deployment-like settings.

QA environment requirements:

- Frontend deployed to a preview/staging URL.
- Backend deployed to a staging or QA backend URL, or a separate Render service if available.
- Separate QA database if possible, so testing does not damage production data.
- Cloudinary/image upload configured and verified.
- Email provider configured in sandbox/test mode if available.
- Correct CORS settings between the QA frontend and QA backend.

QA test coverage:

- Customer account registration and login.
- Admin login.
- Product browsing and image loading.
- Search/filter/sort flows.
- Wishlist flows.
- Cart and coupon flows.
- Address management.
- COD checkout.
- Order confirmation.
- Admin order processing.
- Customer order status visibility.
- Email delivery for customer and admin order events once the email module is added.
- Responsive testing on mobile, tablet, and desktop.
- Empty states, loading states, and API error states.

### 5. Production deployment readiness

Before final deployment, verify:

- Backend build/start works without local-only files.
- Frontend production build passes.
- Environment variables are configured on Render and Vercel.
- Vercel `VITE_API_URL` points to the deployed backend `/api` URL.
- Render `CORS_ORIGIN` includes the Vercel production URL.
- Product images load from Cloudinary on the deployed frontend.
- Admin credentials are available only to the project owner/team.
- Test products are renamed or replaced with production-ready catalog data.
- QA blockers are fixed before production release.

## Current admin coverage

The project already has the main admin foundation in place:

- Admin authentication and protected admin routes.
- Category management.
- Subcategory management.
- Product management with image upload.
- Home content management for hero slides and promo banners.
- Admin order listing and order status updates.
- Backend order, cart, address, coupon, review, and wishlist modules are either implemented or in progress depending on the active branch.

## Remaining admin backend modules

### 1. Dashboard analytics APIs

Add backend endpoints that return real admin dashboard numbers instead of static frontend data.

Suggested metrics:

- Total revenue.
- Total orders.
- Pending orders.
- Confirmed orders.
- Delivered orders.
- Cancelled orders.
- Total customers.
- Total products.
- Low-stock products.
- Recent orders.
- Top-selling products.
- Revenue by day/month.

Suggested endpoint:

```http
GET /api/admin/dashboard
```

### 2. Coupon admin polish

The coupon module exists, but the admin side should be reviewed and completed end to end.

Needed capabilities:

- Create coupon.
- Edit coupon.
- Activate/deactivate coupon.
- Delete or archive coupon.
- Filter by active/expired/upcoming.
- Track usage count.
- Validate max usage and expiry handling.
- Show coupon usage in order details.

### 3. Customer management

Admins should be able to inspect customers and their activity.

Needed capabilities:

- List customers.
- Search customers by name, email, or phone.
- View customer profile.
- View customer orders.
- View customer addresses if needed.
- Block/unblock customers if business rules require it.

Suggested endpoints:

```http
GET /api/admin/customers
GET /api/admin/customers/:id
PATCH /api/admin/customers/:id/status
```

### 4. Review moderation

Reviews should be manageable from admin.

Needed capabilities:

- List all reviews.
- Filter by product, user, rating, status.
- Hide/delete inappropriate reviews.
- View verified-purchase status.
- Optional: admin reply to review.

Suggested endpoints:

```http
GET /api/admin/reviews
PATCH /api/admin/reviews/:id/status
DELETE /api/admin/reviews/:id
```

### 5. Return and refund management

This is needed after order delivery/cancellation flows mature.

Needed capabilities:

- Customer return request.
- Admin return request list.
- Approve/reject return.
- Track refund status.
- Store return reason and optional images.
- Update inventory if return is accepted.

Suggested endpoints:

```http
POST /api/orders/:id/returns
GET /api/admin/returns
PATCH /api/admin/returns/:id/status
```

### 6. Inventory management

Product stock exists, but admin inventory tooling is still needed.

Needed capabilities:

- Low-stock product list.
- Quick stock adjustment.
- Stock adjustment reason.
- Stock adjustment history.
- Out-of-stock report.

Suggested endpoints:

```http
GET /api/admin/inventory/low-stock
PATCH /api/admin/inventory/:productId/stock
GET /api/admin/inventory/:productId/history
```

### 7. Admin audit logs

For important admin changes, store who changed what and when.

Events worth logging:

- Product create/update/delete.
- Category/subcategory changes.
- Coupon changes.
- Order status updates.
- Refund/return status updates.
- Review moderation actions.

Suggested endpoint:

```http
GET /api/admin/audit-logs
```

### 8. Product attributes and variants

Status: basic product attributes are done on the backend and frontend. The product model now supports product-level style/type, material, colors, sizes, tags, and care instructions. The admin product form can create/edit these fields, and the customer product page displays them. Full color-specific image groups, per-color/per-size stock, and variant SKU support are still pending.

The remaining variant work should be added after the immediate deployment flow is stable, unless production products require multiple color image sets before launch.

Needed product fields:

- Product style/type, such as kurti, top, saree, dress, co-ord set, jewelry set, earrings, rings, or necklace.
- Available colors.
- Optional sizes for clothing products.
- Color-specific image groups so the storefront can change images when the customer selects a color.
- Color-specific stock if inventory differs by color.
- Optional variant SKU for each color/size combination.

Suggested product structure:

```js
{
  style: 'Kurti',
  variants: [
    {
      colorName: 'Red',
      colorHex: '#B11226',
      sizes: [
        { size: 'S', stock: 5, sku: 'WOR-KURTI-RED-S' },
        { size: 'M', stock: 8, sku: 'WOR-KURTI-RED-M' }
      ],
      images: [
        'https://res.cloudinary.com/.../red-front.jpg',
        'https://res.cloudinary.com/.../red-back.jpg'
      ]
    },
    {
      colorName: 'White',
      colorHex: '#FFFFFF',
      sizes: [
        { size: 'S', stock: 4, sku: 'WOR-KURTI-WHT-S' },
        { size: 'M', stock: 6, sku: 'WOR-KURTI-WHT-M' }
      ],
      images: [
        'https://res.cloudinary.com/.../white-front.jpg',
        'https://res.cloudinary.com/.../white-back.jpg'
      ]
    }
  ]
}
```

Backend work needed:

- Update product schema with `style` and `variants`.
- Update create/update product validation.
- Update admin product create/update APIs.
- Keep backward compatibility with existing `images` and `stock` fields during migration.
- Update customer product APIs to return variants.
- Update cart/order item snapshot to store selected color, selected size, selected variant image, and variant SKU.
- Validate selected variant stock during checkout.
- Decrease the correct variant stock after order placement.

Suggested endpoints:

```http
PATCH /api/products/:id/variants
PATCH /api/products/:id/variants/:variantId
DELETE /api/products/:id/variants/:variantId
```

## Remaining admin frontend features

### 1. Real dashboard

Replace static dashboard values with real backend analytics.

Frontend page:

```text
/admin
```

Needed UI:

- Revenue card.
- Orders card.
- Customers card.
- Products card.
- Pending orders card.
- Low-stock card.
- Recent orders table.
- Top products table.

### 2. Coupon admin page

Add full coupon management UI.

Suggested route:

```text
/admin/coupons
```

Needed UI:

- Coupon table.
- Create/edit coupon form.
- Active/inactive toggle.
- Expiry display.
- Usage count display.
- Delete/archive action.

### 3. Customers admin page

Suggested route:

```text
/admin/customers
```

Needed UI:

- Customer table.
- Search box.
- Customer status badge.
- Customer detail view.
- Customer order history section.

### 4. Reviews admin page

Suggested route:

```text
/admin/reviews
```

Needed UI:

- Review table.
- Product and customer columns.
- Rating filter.
- Verified-purchase badge.
- Hide/delete action.

### 5. Returns and refunds admin page

Suggested route:

```text
/admin/returns
```

Needed UI:

- Return request table.
- Request detail drawer/page.
- Approve/reject buttons.
- Refund status control.
- Admin note field.

### 6. Inventory admin page

Suggested route:

```text
/admin/inventory
```

Needed UI:

- Low-stock table.
- Out-of-stock table.
- Stock update input.
- Stock history view.

### 7. Admin order detail page

The admin order list exists, but a full order detail page is still needed.

Suggested route:

```text
/admin/orders/:id
```

Needed UI:

- Order items.
- Customer details.
- Shipping address.
- Billing address.
- Payment method and payment status.
- Coupon/discount.
- Tracking number and tracking URL.
- Admin note.
- Status timeline.

### 8. Product attributes and variant UI

The admin product form should support more than a single description and image group.

Needed UI:

- Style/type input or select field.
- Color variant section.
- Color name field.
- Color hex picker or color text input.
- Variant image uploader for each color.
- Size and stock rows for each color when the product is clothing.
- Variant SKU field.
- Add/remove color variant buttons.
- Preview of which images belong to which color.

Customer storefront behavior:

- Show color swatches on product detail page.
- When a customer selects a color, swap the product image gallery to that color's images.
- Show available sizes for the selected color.
- Disable out-of-stock color/size combinations.
- Add selected color, size, SKU, and image to cart and order items.

## Email notification module

The platform should notify both customers and admins about important order events.

### Backend email client

Add an email service module with a provider such as Resend, SendGrid, Mailgun, AWS SES, or Nodemailer SMTP.

Suggested files:

```text
modules/notifications/email.service.js
modules/notifications/email.templates.js
modules/notifications/notification.service.js
validations/notification.validation.js
```

Suggested environment variables:

```env
EMAIL_PROVIDER=resend
EMAIL_API_KEY=
EMAIL_FROM="Wornora <orders@yourdomain.com>"
ADMIN_ORDER_EMAIL=
FRONTEND_URL=
```

### Customer emails

Send customer emails for:

- Account registration welcome email.
- Order placed confirmation.
- Order confirmed by admin.
- Order shipped.
- Out for delivery.
- Delivered.
- Cancelled.
- Return request received.
- Return approved/rejected.
- Refund processed.

### Admin emails

Send admin emails for:

- New order placed.
- Customer cancelled an order.
- New return request.
- Low-stock alert.
- Failed payment alert when payment gateway is added.

### Suggested email triggers

Order creation:

```text
createCodOrderService()
```

Should send:

- Customer order placed email.
- Admin new order email.

Admin order status update:

```text
updateOrderStatusService()
```

Should send:

- Customer order status update email.

Customer order cancellation:

```text
cancelMyOrderService()
```

Should send:

- Customer cancellation confirmation.
- Admin cancellation notification.

Return/refund status update:

```text
updateReturnStatusService()
```

Should send:

- Customer return/refund update email.

### Email reliability requirements

Emails should not break core API flows. If an email fails:

- Log the error.
- Do not fail order creation or status update.
- Store notification status later if auditability is required.

Recommended helper pattern:

```js
try {
  await notificationService.sendOrderPlacedEmails(order);
} catch (err) {
  logger.error('Order email failed', err);
}
```

### Email templates

Initial templates needed:

- `orderPlacedCustomer`
- `orderPlacedAdmin`
- `orderStatusUpdatedCustomer`
- `orderCancelledCustomer`
- `orderCancelledAdmin`
- `returnRequestedAdmin`
- `returnStatusUpdatedCustomer`
- `lowStockAdmin`

Each template should support:

- Subject.
- HTML body.
- Plain text body.
- Order number.
- Customer name.
- Product summary.
- Grand total.
- CTA link to order detail.

## Suggested implementation order

1. Real admin dashboard analytics backend.
2. Real admin dashboard frontend.
3. Coupon admin frontend polish.
4. Review moderation backend and frontend.
5. Email notification service.
6. Order email triggers.
7. Customer management.
8. Inventory management.
9. Returns/refunds.
10. Audit logs.

## Deployment notes

When frontend and backend are deployed separately:

- Vercel frontend must use:

```env
VITE_API_URL=https://wornora.onrender.com/api
```

- Render backend must allow the Vercel origin:

```env
CORS_ORIGIN=https://wornora.vercel.app,http://localhost:5173,http://127.0.0.1:5173
```

- Email provider keys must be configured only on the backend deployment.

## QA admin test credentials

Use this account for testing the admin flow on the deployed website while the project is in QA/testing.

```text
Email: ojhaakshat429@gmail.com
Password: WornoraAdmin@2026
Role: ADMIN
```

These credentials are for QA/admin-flow testing. Rotate or remove this password before handing the project over for production use.

