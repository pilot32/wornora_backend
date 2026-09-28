# eCommerce Backend API Documentation

Welcome to the API documentation for the eCommerce Backend. This backend service provides authentication, product catalog management, cart management, address book management, and promotional coupon features.

---

## 1. Overview & Setup

### Base URL
By default, the server runs locally on the port specified in your `.env` file (e.g., `5000` or `8000`).
```
http://localhost:<PORT>/api
```

### Global Response Conventions

#### Success Response
Success responses return the HTTP status code (200, 201, etc.) along with the serialized `ApiResponse` object:
```json
{
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": { ... }
}
```
*Note: Some endpoints return a custom JSON structure without using the `ApiResponse` class helper, which is documented under their specific sections.*

#### Error Responses
Standard errors use `ApiError` class helper or Express fallback:
```json
{
  "success": false,
  "message": "Detailed error message"
}
```

Joi validation failures return a status code of `400 Bad Request` with the following structure:
```json
{
  "message": "validation failed",
  "error": "Detailed validation error message"
}
```

---

## 2. Authentication & Authorization

All protected routes require a JWT token passed in the `Authorization` header.

Header format:
```http
Authorization: Bearer <JWT_TOKEN>
```

Users can have one of two roles:
*   `CUSTOMER` (Default)
*   `ADMIN`

---

## Table of Contents

- [Authentication API](#1-authentication-api-apiauth)
- [Categories API](#2-categories-api-apicategories)
- [Subcategories API](#3-subcategories-api-apisubcategories)
- [Products API (Admin & Common)](#4-products-api-apiproducts)
- [Customer Storefront API](#5-customer-storefront-api-apicustomer)
- [Cart API](#6-cart-api-apicart)
- [Coupon API](#7-coupon-api-apicoupon)
- [Address API](#8-address-api-apiaddresses)
- [Home Page Content APIs](#9-home-page-content-apis-apihome)
- [Testing Guide](#10-testing-guide)

---

## 1. Authentication API (`/api/auth`)

Endpoints for register, login, and profile retrieval.

### Register User
*   **Path:** `POST /register`
*   **Access:** Public
*   **Request Body:**
    *   `name` (string, min: 2, max: 50, required)
    *   `email` (string, valid email, required)
    *   `password` (string, required)

**Example Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Example Response (200 OK):**
```json
{
  "message": "User succesfully created"
}
```

**Example Error Response (400 Bad Request):**
```json
{
  "message": "User with this email already exists"
}
```

---

### Login User
*   **Path:** `POST /login`
*   **Access:** Public
*   **Request Body:**
    *   `email` (string, valid email, required)
    *   `password` (string, required)

**Example Request:**
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Example Response (200 OK):**
```json
{
  "message": "Login Succesful",
  "user": {
    "_id": "648ef11b1b01c34a2e5d1a5b",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "CUSTOMER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Example Error Response (400 Bad Request):**
```json
{
  "message": "User not found"
}
```

---

### Get Profile
*   **Path:** `GET /profile`
*   **Access:** Authenticated (`CUSTOMER` or `ADMIN`)

**Example Response (200 OK):**
```json
{
  "user": {
    "userId": "648ef11b1b01c34a2e5d1a5b",
    "role": "CUSTOMER",
    "iat": 1687103400,
    "exp": 1687708200
  }
}
```

---

### Test Admin Access
*   **Path:** `POST /test-admin`
*   **Access:** Authenticated, Admin Only (`ADMIN`)

**Example Response (200 OK):**
```json
{
  "message": "Admin access granted"
}
```

---

## 2. Categories API (`/api/categories`)

Manage main product categories. All endpoints require `ADMIN` authorization.

### Create Category
*   **Path:** `POST /`
*   **Access:** Authenticated, Admin Only
*   **Request Body:**
    *   `name` (string, min: 2, max: 50, required)
    *   `slug` (string, lowercase, alphanumeric and hyphens, optional) - *Auto-generated from name if not provided*
    *   `isActive` (boolean, default: `true`, optional)
    *   `image` (string, valid URL, optional)

**Example Request:**
```json
{
  "name": "Indian Ethnic Wear",
  "image": "https://example.com/ethnic.jpg"
}
```

**Example Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Category created",
  "data": {
    "_id": "648ef2021b01c34a2e5d1a6c",
    "name": "Indian Ethnic Wear",
    "slug": "indian-ethnic-wear",
    "isActive": true,
    "image": "https://example.com/ethnic.jpg",
    "createdAt": "2026-06-30T10:55:00.000Z",
    "updatedAt": "2026-06-30T10:55:00.000Z"
  }
}
```

---

### Get All Categories
*   **Path:** `GET /`
*   **Access:** Authenticated, Admin Only
*   **Query Parameters:**
    *   `isActive` (boolean, optional) - Filter by status
    *   `search` (string, optional) - Case-insensitive match on name

**Example Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Categories fetched successfully",
  "data": [
    {
      "_id": "648ef2021b01c34a2e5d1a6c",
      "name": "Indian Ethnic Wear",
      "slug": "indian-ethnic-wear",
      "isActive": true,
      "image": "https://example.com/ethnic.jpg",
      "createdAt": "2026-06-30T10:55:00.000Z",
      "updatedAt": "2026-06-30T10:55:00.000Z"
    }
  ]
}
```

---

### Get Category by ID
*   **Path:** `GET /:id`
*   **Access:** Authenticated, Admin Only
*   **Path Parameters:**
    *   `id` (string, 24-character hex string, required)

**Example Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Category fetched successfully",
  "data": {
    "_id": "648ef2021b01c34a2e5d1a6c",
    "name": "Indian Ethnic Wear",
    "slug": "indian-ethnic-wear",
    "isActive": true,
    "image": "https://example.com/ethnic.jpg"
  }
}
```

---

### Update Category
*   **Path:** `PATCH /:id`
*   **Access:** Authenticated, Admin Only
*   **Path Parameters:**
    *   `id` (string, 24-character hex string, required)
*   **Request Body (At least one required):**
    *   `name` (string, min: 2, max: 50, optional)
    *   `slug` (string, lowercase, alphanumeric/hyphens, optional)
    *   `isActive` (boolean, optional)
    *   `image` (string, valid URL, optional)

**Example Request:**
```json
{
  "name": "Sarees & Ethnic Wear"
}
```

**Example Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Category updated successfully",
  "data": {
    "_id": "648ef2021b01c34a2e5d1a6c",
    "name": "Sarees & Ethnic Wear",
    "slug": "sarees-ethnic-wear",
    "isActive": true,
    "image": "https://example.com/ethnic.jpg"
  }
}
```

---

### Update Category Status
*   **Path:** `PATCH /:id/status`
*   **Access:** Authenticated, Admin Only
*   **Path Parameters:**
    *   `id` (string, 24-character hex string, required)
*   **Request Body:**
    *   `isActive` (boolean, required)

**Example Request:**
```json
{
  "isActive": false
}
```

**Example Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Category status updated successfully",
  "data": {
    "_id": "648ef2021b01c34a2e5d1a6c",
    "isActive": false
  }
}
```

---

### Delete Category
*   **Path:** `DELETE /:id`
*   **Access:** Authenticated, Admin Only
*   **Path Parameters:**
    *   `id` (string, 24-character hex string, required)

**Example Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Category deleted successfully"
}
```

---

## 3. Subcategories API (`/api/subcategories`)

Manage subcategories nested under parent categories.

### Create Subcategory
*   **Path:** `POST /`
*   **Access:** Authenticated, Admin Only
*   **Request Body:**
    *   `name` (string, min: 2, max: 50, required)
    *   `categoryId` (string, 24-character hex string, required)
    *   `slug` (string, lowercase, alphanumeric/hyphens, optional) - *Auto-generated from name*
    *   `isActive` (boolean, default: `true`, optional)
    *   `image` (string, valid URL, optional)

**Example Request:**
```json
{
  "name": "Banarasi Sarees",
  "categoryId": "648ef2021b01c34a2e5d1a6c",
  "image": "https://example.com/banarasi.jpg"
}
```

**Example Response (200 OK):**
```json
{
  "message": "Subcategory created successfully",
  "subcategory": {
    "_id": "648ef2df1b01c34a2e5d1a7a",
    "name": "Banarasi Sarees",
    "slug": "banarasi-sarees",
    "categoryId": {
      "_id": "648ef2021b01c34a2e5d1a6c",
      "name": "Sarees & Ethnic Wear"
    },
    "isActive": true,
    "image": "https://example.com/banarasi.jpg",
    "createdAt": "2026-06-30T10:56:00.000Z",
    "updatedAt": "2026-06-30T10:56:00.000Z"
  }
}
```

---

### Get All Subcategories
*   **Path:** `GET /`
*   **Access:** Public
*   **Query Parameters:**
    *   `categoryId` (string, 24-character hex string, optional) - Filter by parent category
    *   `isActive` (boolean, optional) - Filter by status
    *   `search` (string, optional) - Match name/slug case-insensitively

**Example Response (200 OK):**
```json
{
  "message": "Subcategories fetched successfully",
  "data": [
    {
      "_id": "648ef2df1b01c34a2e5d1a7a",
      "name": "Banarasi Sarees",
      "slug": "banarasi-sarees",
      "categoryId": {
        "_id": "648ef2021b01c34a2e5d1a6c",
        "name": "Sarees & Ethnic Wear"
      },
      "isActive": true,
      "image": "https://example.com/banarasi.jpg"
    }
  ]
}
```

---

### Get Subcategory by ID
*   **Path:** `GET /:id`
*   **Access:** Public
*   **Path Parameters:**
    *   `id` (string, 24-character hex string, required)

**Example Response (200 OK):**
```json
{
  "message": "Subcategory fetched successfully",
  "subcategory": {
    "_id": "648ef2df1b01c34a2e5d1a7a",
    "name": "Banarasi Sarees",
    "slug": "banarasi-sarees",
    "categoryId": {
      "_id": "648ef2021b01c34a2e5d1a6c",
      "name": "Sarees & Ethnic Wear"
    },
    "isActive": true
  }
}
```

---

### Update Subcategory
*   **Path:** `PATCH /:id`
*   **Access:** Authenticated, Admin Only
*   **Path Parameters:**
    *   `id` (string, 24-character hex string, required)
*   **Request Body (At least one required):**
    *   `name` (string, min: 2, max: 50, optional)
    *   `categoryId` (string, 24-character hex string, optional)
    *   `slug` (string, lowercase, alphanumeric/hyphens, optional)
    *   `isActive` (boolean, optional)
    *   `image` (string, valid URL, optional)

**Example Response (200 OK):**
```json
{
  "message": "Subcategory updated successfully",
  "subcategory": {
    "_id": "648ef2df1b01c34a2e5d1a7a",
    "name": "Bridal Banarasi Sarees",
    "slug": "bridal-banarasi-sarees"
  }
}
```

---

### Update Subcategory Status
*   **Path:** `PATCH /:id/status`
*   **Access:** Authenticated, Admin Only
*   **Path Parameters:**
    *   `id` (string, 24-character hex string, required)
*   **Request Body:**
    *   `isActive` (boolean, required)

**Example Request:**
```json
{
  "isActive": false
}
```

**Example Response (200 OK):**
```json
{
  "message": "Status updated successfully",
  "subcategory": {
    "_id": "648ef2df1b01c34a2e5d1a7a",
    "isActive": false
  }
}
```

---

### Disable/Delete Subcategory
*   **Path:** `DELETE /:id`
*   **Access:** Authenticated, Admin Only
*   **Path Parameters:**
    *   `id` (string, 24-character hex string, required)

> [!NOTE]
> The backend performs a **soft-delete** for subcategories, setting their `isActive` status to `false`.

**Example Response (200 OK):**
```json
{
  "message": "Subcategory disabled successfully",
  "subcategory": {
    "_id": "648ef2df1b01c34a2e5d1a7a",
    "isActive": false
  }
}
```

---

## 4. Products API (`/api/products`)

Administrative and catalog management endpoints for products.

### Create Product
*   **Path:** `POST /`
*   **Access:** Authenticated, Admin Only
*   **Request Body:**
    *   `name` (string, min: 2, max: 100, required)
    *   `slug` (string, optional) - *Auto-generated from name if not provided*
    *   `description` (string, min: 10, max: 2000, required)
    *   `categoryId` (string, 24-character hex string, required)
    *   `subcategoryId` (string, 24-character hex string, required)
    *   `price` (number, positive, required)
    *   `discountedPrice` (number, positive, optional, must be <= `price`)
    *   `stock` (number, integer, min: 1, optional, default: 0)
    *   `images` (array of image URLs, optional)
    *   `isActive` (boolean, optional, default: `true`)
    *   `featured` (boolean, optional, default: `false`)

> [!IMPORTANT]
> The backend enforces that the provided `subcategoryId` must belong to the provided `categoryId`. If the relationship is invalid, it returns `400 Bad Request`.

**Example Request:**
```json
{
  "name": "Red Silk Banarasi Saree",
  "description": "Exquisite handcrafted pure silk saree with gold zari border.",
  "categoryId": "648ef2021b01c34a2e5d1a6c",
  "subcategoryId": "648ef2df1b01c34a2e5d1a7a",
  "price": 8500,
  "discountedPrice": 7500,
  "stock": 10,
  "images": ["https://example.com/saree1.jpg"]
}
```

**Example Response (201 Created):**
```json
{
  "message": "Product created successfully",
  "product": {
    "_id": "648ef5a31b01c34a2e5d1a9d",
    "name": "Red Silk Banarasi Saree",
    "slug": "red-silk-banarasi-saree",
    "description": "Exquisite handcrafted pure silk saree with gold zari border.",
    "categoryId": {
      "_id": "648ef2021b01c34a2e5d1a6c",
      "name": "Sarees & Ethnic Wear",
      "slug": "sarees-ethnic-wear"
    },
    "subcategoryId": {
      "_id": "648ef2df1b01c34a2e5d1a7a",
      "name": "Banarasi Sarees",
      "slug": "banarasi-sarees"
    },
    "price": 8500,
    "discountedPrice": 7500,
    "stock": 10,
    "images": ["https://example.com/saree1.jpg"],
    "isActive": true,
    "featured": false
  }
}
```

---

### Get All Products (Admin / Catalog View)
*   **Path:** `GET /`
*   **Access:** Public
*   **Query Parameters:**
    *   `categoryId` (string, optional)
    *   `subcategoryId` (string, optional)
    *   `featured` (boolean, optional)
    *   `isActive` (boolean, optional)
    *   `search` (string, optional) - Checks name & description
    *   `minPrice` (number, optional)
    *   `maxPrice` (number, optional)
    *   `page` (number, default: 1, optional)
    *   `limit` (number, default: 10, max: 100, optional)
    *   `sortBy` (string, valid: `price`, `name`, `createdAt`, `updatedAt`, default: `createdAt`, optional)
    *   `sortOrder` (string, valid: `asc`, `desc`, default: `desc`, optional)

**Example Response (200 OK):**
```json
{
  "message": "Products fetched successfully",
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "totalItems": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### Get Product by ID
*   **Path:** `GET /:id`
*   **Access:** Public
*   **Path Parameters:**
    *   `id` (string, 24-character hex string, required)

**Example Response (201 Created):**
```json
{
  "message": "Product fetched succesfully",
  "product": {
    "_id": "648ef5a31b01c34a2e5d1a9d",
    "name": "Red Silk Banarasi Saree",
    "price": 8500,
    "stock": 10
  }
}
```

---

### Update Product
*   **Path:** `PATCH /:id`
*   **Access:** Authenticated, Admin Only
*   **Path Parameters:**
    *   `id` (string, 24-character hex string, required)
*   **Request Body (At least one required):**
    *   `name` (string, optional)
    *   `description` (string, optional)
    *   `categoryId` (string, optional)
    *   `subcategoryId` (string, optional)
    *   `price` (number, optional)
    *   `discountedPrice` (number, optional)
    *   `stock` (number, optional)
    *   `images` (array of strings, optional)
    *   `isActive` (boolean, optional)
    *   `featured` (boolean, optional)

**Example Response (200 OK):**
```json
{
  "message": "Product updated successfully",
  "product": {
    "_id": "648ef5a31b01c34a2e5d1a9d",
    "name": "Updated Saree Name",
    "price": 8500
  }
}
```

---

### Update Product Status
*   **Path:** `PATCH /:id/status`
*   **Access:** Authenticated, Admin Only
*   **Request Body:**
    *   `isActive` (boolean, required)

**Example Response (200 OK):**
```json
{
  "message": "Status updated successfully",
  "product": {
    "_id": "648ef5a31b01c34a2e5d1a9d",
    "isActive": false
  }
}
```

---

### Update Product Featured Status
*   **Path:** `PATCH /:id/featured`
*   **Access:** Authenticated, Admin Only
*   **Request Body:**
    *   `featured` (boolean, required)

**Example Response (200 OK):**
```json
{
  "message": "Product featured successfully",
  "product": {
    "_id": "648ef5a31b01c34a2e5d1a9d",
    "featured": true
  }
}
```

---

### Upload Image to Cloudinary
*   **Path:** `POST /upload`
*   **Access:** Public
*   **Content-Type:** `multipart/form-data`
*   **Multipart Body Fields:**
    *   `image` (file, required) - Image file upload stream

**Example Response (200 OK):**
```json
{
  "message": "photo uploaded successfully",
  "result": {
    "public_id": "wornora/products/ab12cd34...",
    "url": "http://res.cloudinary.com/demo/image/upload/v1577836800/wornora/products/...",
    "secure_url": "https://res.cloudinary.com/demo/image/upload/v1577836800/wornora/products/..."
  }
}
```

---

### Disable/Delete Product
*   **Path:** `DELETE /:id`
*   **Access:** Authenticated, Admin Only
*   **Path Parameters:**
    *   `id` (string, 24-character hex string, required)

> [!NOTE]
> The backend performs a **soft-delete** for products, setting their `isActive` status to `false`.

**Example Response (200 OK):**
```json
{
  "message": "Product disabled successfully",
  "product": {
    "id": "648ef5a31b01c34a2e5d1a9d",
    "name": "Red Silk Banarasi Saree",
    "isActive": false
  }
}
```

---

## 5. Customer Storefront API (`/api/customer`)

These endpoints serve public customers on the shop catalog. They only return products where `isActive` is `true`.

### Get All Active Products
*   **Path:** `GET /products`
*   **Access:** Public
*   **Query Parameters:**
    *   `categoryId` (string, optional)
    *   `subcategoryId` (string, optional)
    *   `search` (string, optional) - Match on product name
    *   `page` (number, optional, default: 1)
    *   `limit` (number, optional, default: 10)

**Example Response (200 OK):**
```json
{
  "page": 1,
  "limit": 10,
  "total": 24,
  "totalPages": 3,
  "products": [
    {
      "_id": "648ef5a31b01c34a2e5d1a9d",
      "name": "Red Silk Banarasi Saree",
      "price": 8500,
      "discountedPrice": 7500,
      "images": ["https://example.com/saree1.jpg"],
      "categoryId": {
        "_id": "648ef2021b01c34a2e5d1a6c",
        "name": "Sarees & Ethnic Wear"
      },
      "subcategoryId": {
        "_id": "648ef2df1b01c34a2e5d1a7a",
        "name": "Banarasi Sarees"
      }
    }
  ]
}
```

---

### Get Featured Products
*   **Path:** `GET /products/featured`
*   **Access:** Public

**Example Response (200 OK):**
```json
{
  "products": [
    {
      "_id": "648ef5a31b01c34a2e5d1a9d",
      "name": "Red Silk Banarasi Saree",
      "featured": true,
      "price": 8500
    }
  ]
}
```

---

### Get New Arrivals
*   **Path:** `GET /products/new-arrivals`
*   **Access:** Public
*   **Details:** Returns the top 12 newly added products (`isActive: true`), sorted by `createdAt` in descending order.

**Example Response (200 OK):**
```json
{
  "products": [ ... ]
}
```

---

### Get Specific Active Product
*   **Path:** `GET /products/:id`
*   **Access:** Public
*   **Path Parameters:**
    *   `id` (string, 24-character hex string, required)

**Example Response (200 OK):**
```json
{
  "product": {
    "_id": "648ef5a31b01c34a2e5d1a9d",
    "name": "Red Silk Banarasi Saree",
    "price": 8500,
    "isActive": true
  }
}
```

**Example Error Response (400 Bad Request):**
*If the product is not found or is inactive (`isActive: false`):*
```json
{
  "message": "no product found"
}
```

---

## 6. Cart API (`/api/cart`)

User shopping cart operations. All endpoints require **Authentication**.

### Add Product to Cart
*   **Path:** `POST /add`
*   **Access:** Authenticated
*   **Request Body:**
    *   `productId` (string, 24-character hex string, required)
    *   `quantity` (number, integer, min: 1, default: 1, optional)

**Example Request:**
```json
{
  "productId": "648ef5a31b01c34a2e5d1a9d",
  "quantity": 2
}
```

**Example Response (200 OK):**
```json
{
  "message": "Item added to cart",
  "cart": {
    "_id": "648efb221b01c34a2e5d1aba",
    "userId": "648ef11b1b01c34a2e5d1a5b",
    "items": [
      {
        "_id": "648efb221b01c34a2e5d1abb",
        "productId": {
          "_id": "648ef5a31b01c34a2e5d1a9d",
          "name": "Red Silk Banarasi Saree",
          "price": 8500,
          "images": ["https://example.com/saree1.jpg"],
          "slug": "red-silk-banarasi-saree"
        },
        "quantity": 2,
        "priceAddition": 8500
      }
    ],
    "appliedCoupon": null
  }
}
```

---

### Get Cart Items
*   **Path:** `GET /`
*   **Access:** Authenticated

**Example Response (200 OK):**
```json
{
  "message": "Cart items retrieved successfully",
  "cart": {
    "userId": "648ef11b1b01c34a2e5d1a5b",
    "items": [ ... ],
    "appliedCoupon": null
  }
}
```

---

### Update Cart Item Quantity
*   **Path:** `PATCH /:productId`
*   **Access:** Authenticated
*   **Path Parameters:**
    *   `productId` (string, 24-character hex string, required)
*   **Request Body:**
    *   `quantity` (number, integer, min: 1, required)

**Example Request:**
```json
{
  "quantity": 5
}
```

**Example Response (200 OK):**
```json
{
  "message": "Cart item quantity updated successfully",
  "cart": { ... }
}
```

---

### Remove Item from Cart
*   **Path:** `DELETE /:productId`
*   **Access:** Authenticated
*   **Path Parameters:**
    *   `productId` (string, 24-character hex string, required)

**Example Response (200 OK):**
```json
{
  "message": "Item removed from cart",
  "cart": { ... }
}
```

---

### Clear Cart
*   **Path:** `DELETE /`
*   **Access:** Authenticated

**Example Response (200 OK):**
```json
{
  "message": "Cart cleared successfully",
  "cart": {
    "userId": "648ef11b1b01c34a2e5d1a5b",
    "items": [],
    "appliedCoupon": null
  }
}
```

---

## 7. Coupon API (`/api/coupon`)

Store management coupons for promotions.

### Create Coupon
*   **Path:** `POST /`
*   **Access:** Authenticated, Admin Only
*   **Request Body:**
    *   `code` (string, uppercase, required)
    *   `description` (string, optional)
    *   `discountType` (string, valid: `percentage`, `fixed`, required)
    *   `discountValue` (number, min: 0, required)
    *   `minimumCartValue` (number, min: 0, optional, default: 0)
    *   `maximumDiscountAmount` (number, min: 0, optional, default: `null`)
    *   `startDate` (date string, optional, default: `null`)
    *   `expiryDate` (date string, optional, default: `null`)
    *   `usageLimit` (number, min: 0, optional, default: `null`)
    *   `perUserLimit` (number, min: 1, optional, default: 1)
    *   `isActive` (boolean, optional, default: `true`)

**Example Request:**
```json
{
  "code": "FESTIVE20",
  "description": "20% off during Diwali sale",
  "discountType": "percentage",
  "discountValue": 20,
  "minimumCartValue": 1000,
  "maximumDiscountAmount": 500,
  "expiryDate": "2026-12-31T23:59:59.000Z"
}
```

**Example Response (201 Created):**
```json
{
  "message": "Coupon created successfully",
  "coupon": {
    "_id": "648efce31b01c34a2e5d1ad0",
    "code": "FESTIVE20",
    "description": "20% off during Diwali sale",
    "discountType": "percentage",
    "discountValue": 20,
    "minimumCartValue": 1000,
    "maximumDiscountAmount": 500,
    "expiryDate": "2026-12-31T23:59:59.000Z",
    "perUserLimit": 1,
    "isActive": true,
    "usedCount": 0
  }
}
```

---

### Get All Coupons
*   **Path:** `GET /`
*   **Access:** Authenticated, Admin Only

**Example Response (200 OK):**
```json
{
  "coupons": [
    {
      "_id": "648efce31b01c34a2e5d1ad0",
      "code": "FESTIVE20",
      "discountType": "percentage",
      "discountValue": 20,
      "isActive": true
    }
  ]
}
```

---

### Get Coupon by ID
*   **Path:** `GET /:id`
*   **Access:** Public
*   **Path Parameters:**
    *   `id` (string, 24-character hex string, required)

**Example Response (200 OK):**
```json
{
  "coupon": {
    "_id": "648efce31b01c34a2e5d1ad0",
    "code": "FESTIVE20",
    "discountType": "percentage",
    "discountValue": 20,
    "isActive": true
  }
}
```

---

### Update Coupon
*   **Path:** `PATCH /:id`
*   **Access:** Authenticated, Admin Only
*   **Path Parameters:**
    *   `id` (string, 24-character hex string, required)
*   **Request Body (At least one required):**
    *   `code` (string, optional)
    *   `description` (string, optional)
    *   `discountType` (string, valid: `percentage`, `fixed`, optional)
    *   `discountValue` (number, optional)
    *   `minimumCartValue` (number, optional)
    *   `maximumDiscountAmount` (number, optional)
    *   `startDate` (date, optional)
    *   `expiryDate` (date, optional)
    *   `usageLimit` (number, optional)
    *   `perUserLimit` (number, optional)
    *   `isActive` (boolean, optional)

**Example Response (200 OK):**
```json
{
  "message": "Coupon updated successfully",
  "coupon": { ... }
}
```

---

### Update Coupon Status
*   **Path:** `PATCH /:id/status`
*   **Access:** Authenticated, Admin Only
*   **Request Body:**
    *   `isActive` (boolean, required)

**Example Response (200 OK):**
```json
{
  "message": "Status updated successfully",
  "coupon": {
    "_id": "648efce31b01c34a2e5d1ad0",
    "isActive": false
  }
}
```

---

### Delete Coupon
*   **Path:** `DELETE /:id`
*   **Access:** Authenticated, Admin Only
*   **Path Parameters:**
    *   `id` (string, 24-character hex string, required)

**Example Response (200 OK):**
```json
{
  "message": "Coupon deleted successfully"
}
```

---

## 8. Address API (`/api/addresses`)

Manage customer address books. All endpoints require **Authentication**.

### Create Address
*   **Path:** `POST /`
*   **Access:** Authenticated
*   **Request Body:**
    *   `fullName` (string, min: 2, max: 100, required)
    *   `phone` (string, valid format, required)
    *   `addressLine1` (string, required)
    *   `addressLine2` (string, optional)
    *   `city` (string, required)
    *   `state` (string, required)
    *   `postalCode` (string, required)
    *   `country` (string, default: `"India"`, optional)
    *   `addressType` (string, valid: `Home`, `Work`, `Other`, default: `Home`, optional)
    *   `isDefault` (boolean, default: `false`, optional)

> [!NOTE]
> If a user has no prior addresses, or if `isDefault` is set to `true`, the address will automatically be designated as the default address. All other addresses for that user will have their `isDefault` flags set to `false`.

**Example Request:**
```json
{
  "fullName": "Jane Doe",
  "phone": "9876543210",
  "addressLine1": "Flat 404, Alpine Residency",
  "addressLine2": "Green Glen Layout",
  "city": "Bengaluru",
  "state": "Karnataka",
  "postalCode": "560103",
  "addressType": "Home",
  "isDefault": true
}
```

**Example Response (201 Created):**
```json
{
  "message": "Address created successfully",
  "address": {
    "_id": "648eff221b01c34a2e5d1af0",
    "userId": "648ef11b1b01c34a2e5d1a5b",
    "fullName": "Jane Doe",
    "phone": "9876543210",
    "addressLine1": "Flat 404, Alpine Residency",
    "addressLine2": "Green Glen Layout",
    "city": "Bengaluru",
    "state": "Karnataka",
    "postalCode": "560103",
    "country": "India",
    "addressType": "Home",
    "isDefault": true
  }
}
```

---

### Get User Addresses
*   **Path:** `GET /`
*   **Access:** Authenticated
*   **Details:** Returns the list of addresses for the logged-in user, sorted so that default addresses and the most recently updated ones appear first.

**Example Response (200 OK):**
```json
{
  "message": "Addresses retrieved successfully",
  "addresses": [ ... ]
}
```

---

### Get Address by ID
*   **Path:** `GET /:id`
*   **Access:** Authenticated
*   **Path Parameters:**
    *   `id` (string, 24-character hex string, required)

> [!IMPORTANT]
> The backend verifies address ownership. If the address exists but does not belong to the logged-in user, it will return `404 Not Found`.

**Example Response (200 OK):**
```json
{
  "message": "Address retrieved successfully",
  "address": { ... }
}
```

---

### Update Address
*   **Path:** `PATCH /:id`
*   **Access:** Authenticated
*   **Path Parameters:**
    *   `id` (string, 24-character hex string, required)
*   **Request Body (At least one required):**
    *   `fullName` (string, optional)
    *   `phone` (string, optional)
    *   `addressLine1` (string, optional)
    *   `addressLine2` (string, optional)
    *   `city` (string, optional)
    *   `state` (string, optional)
    *   `postalCode` (string, optional)
    *   `country` (string, optional)
    *   `addressType` (string, valid: `Home`, `Work`, `Other`, optional)
    *   `isDefault` (boolean, optional)

> [!NOTE]
> If updating an address's `isDefault` to `true`, the default flag on all other user addresses will be cleared. If setting it to `false` when it was currently the default, the next most recently updated address will automatically be selected as the default address.

**Example Response (200 OK):**
```json
{
  "message": "Address updated successfully",
  "address": { ... }
}
```

---

### Delete Address
*   **Path:** `DELETE /:id`
*   **Access:** Authenticated
*   **Path Parameters:**
    *   `id` (string, 24-character hex string, required)

> [!NOTE]
> If the deleted address was marked as default, the next most recently updated address will automatically be designated as the default.

**Example Response (200 OK):**
```json
{
  "message": "Address deleted successfully"
}
```

---

### Set Default Address
*   **Path:** `PATCH /:id/default`
*   **Access:** Authenticated
*   **Path Parameters:**
    *   `id` (string, 24-character hex string, required)

**Example Response (200 OK):**
```json
{
  "message": "Default address set successfully",
  "address": {
    "_id": "648eff221b01c34a2e5d1af0",
    "isDefault": true
  }
}
```

---

## 9. Home Page Content APIs (`/api/home`)

Endpoints to manage the homepage Hero Slides, Promo Banners, and Category Tiles.

### 9.1 Hero Slides

#### Get Hero Slides
*   **Path:** `GET /hero-slides`
*   **Access:** Public
*   **Query Parameters:**
    *   `activeOnly` (boolean, default: `true`, optional) - If `false`, returns inactive slides too (for Admin preview).

**Example Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Hero slides fetched successfully",
  "data": [
    {
      "_id": "60d0fe4f5311236168a109a1",
      "eyebrow": "Handcrafted Elegance",
      "title": "Celebrate Your\nDesi Heritage",
      "subtitle": "Sarees, lehengas & jewellery woven with timeless artistry.",
      "cta": { "label": "Shop the Collection", "to": "/shop" },
      "secondaryCta": { "label": "New Arrivals", "to": "/shop?filter=new" },
      "image": "https://example.com/saree.jpg",
      "align": "left",
      "isActive": true,
      "order": 1
    }
  ]
}
```

#### Create Hero Slide
*   **Path:** `POST /hero-slides`
*   **Access:** Authenticated, Admin Only
*   **Request Body:**
    *   `eyebrow` (string, optional)
    *   `title` (string, required)
    *   `subtitle` (string, optional)
    *   `cta` (object with `label` and `to` strings, required)
    *   `secondaryCta` (object with `label` and `to` strings, optional)
    *   `image` (string, valid URL, required)
    *   `align` (string, valid: `left`, `center`, `right`, default: `left`, optional)
    *   `isActive` (boolean, default: `true`, optional)
    *   `order` (number, default: `0`, optional)

**Example Request:**
```json
{
  "eyebrow": "Exclusive Launch",
  "title": "New Banarasi Silk",
  "cta": {
    "label": "View Collection",
    "to": "/shop?category=banarasi"
  },
  "image": "https://example.com/banarasi-hero.jpg"
}
```

**Example Response (210 Created):**
```json
{
  "statusCode": 201,
  "message": "Hero slide created successfully",
  "data": {
    "_id": "64a1d48c8c22bb371b2d01e1",
    "eyebrow": "Exclusive Launch",
    "title": "New Banarasi Silk",
    "cta": { "label": "View Collection", "to": "/shop?category=banarasi" },
    "image": "https://example.com/banarasi-hero.jpg",
    "align": "left",
    "isActive": true,
    "order": 0
  }
}
```

#### Update Hero Slide
*   **Path:** `PATCH /hero-slides/:id`
*   **Access:** Authenticated, Admin Only
*   **Request Body:** Same fields as create (all optional, at least one required).

**Example Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Hero slide updated successfully",
  "data": { ... }
}
```

#### Update Hero Slide Status
*   **Path:** `PATCH /hero-slides/:id/status`
*   **Access:** Authenticated, Admin Only
*   **Request Body:**
    *   `isActive` (boolean, required)

**Example Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Hero slide status updated successfully",
  "data": {
    "_id": "64a1d48c8c22bb371b2d01e1",
    "isActive": false
  }
}
```

#### Delete Hero Slide
*   **Path:** `DELETE /hero-slides/:id`
*   **Access:** Authenticated, Admin Only

**Example Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Hero slide deleted successfully"
}
```

---

### 9.2 Promo Banners

#### Get Promo Banners
*   **Path:** `GET /promo-banners`
*   **Access:** Public
*   **Query Parameters:**
    *   `activeOnly` (boolean, default: `true`, optional)

**Example Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Promotional banners fetched successfully",
  "data": [
    {
      "_id": "60d0fe4f5311236168a109b1",
      "eyebrow": "Festive Sale",
      "title": "Up to 40% Off",
      "subtitle": "Use code FESTIVE20 at checkout",
      "cta": { "label": "Shop Now", "to": "/shop?filter=sale" },
      "image": "https://example.com/banner.jpg",
      "accent": "maroon",
      "isActive": true,
      "order": 1
    }
  ]
}
```

#### Create Promo Banner
*   **Path:** `POST /promo-banners`
*   **Access:** Authenticated, Admin Only
*   **Request Body:**
    *   `eyebrow` (string, optional)
    *   `title` (string, required)
    *   `subtitle` (string, optional)
    *   `cta` (object with `label` and `to` strings, required)
    *   `image` (string, valid URL, required)
    *   `accent` (string, valid: `maroon`, `terracotta`, `gold`, default: `gold`, optional)
    *   `isActive` (boolean, default: `true`, optional)
    *   `order` (number, default: `0`, optional)

**Example Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Promotional banner created successfully",
  "data": { ... }
}
```

#### Update Promo Banner
*   **Path:** `PATCH /promo-banners/:id`
*   **Access:** Authenticated, Admin Only

#### Update Promo Banner Status
*   **Path:** `PATCH /promo-banners/:id/status`
*   **Access:** Authenticated, Admin Only
*   **Request Body:** `{ "isActive": boolean }`

#### Delete Promo Banner
*   **Path:** `DELETE /promo-banners/:id`
*   **Access:** Authenticated, Admin Only

---

### 9.3 Category Tiles

#### Get Category Tiles
*   **Path:** `GET /category-tiles`
*   **Access:** Public
*   **Query Parameters:**
    *   `activeOnly` (boolean, default: `true`, optional)

**Example Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Category tiles fetched successfully",
  "data": [
    {
      "_id": "60d0fe4f5311236168a109c1",
      "name": "Sarees",
      "slug": "sarees",
      "to": "/shop?category=clothing&subcategory=sarees",
      "image": "https://example.com/saree-tile.jpg",
      "isActive": true,
      "order": 1
    }
  ]
}
```

#### Create Category Tile
*   **Path:** `POST /category-tiles`
*   **Access:** Authenticated, Admin Only
*   **Request Body:**
    *   `name` (string, required)
    *   `slug` (string, lowercase, alphanumeric/hyphens, required)
    *   `to` (string, required)
    *   `image` (string, valid URL, required)
    *   `isActive` (boolean, default: `true`, optional)
    *   `order` (number, default: `0`, optional)

**Example Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Category tile created successfully",
  "data": { ... }
}
```

#### Update Category Tile
*   **Path:** `PATCH /category-tiles/:id`
*   **Access:** Authenticated, Admin Only

#### Update Category Tile Status
*   **Path:** `PATCH /category-tiles/:id/status`
*   **Access:** Authenticated, Admin Only
*   **Request Body:** `{ "isActive": boolean }`

#### Delete Category Tile
*   **Path:** `DELETE /category-tiles/:id`
*   **Access:** Authenticated, Admin Only

---

## 10. Testing Guide

You can test the API endpoints using **cURL** commands in your terminal or via tools like Postman. Below are exact templates and instructions for testing the newly implemented Home Content and existing APIs.

### Prerequisites
Make sure your server is running locally:
```bash
npm run dev
```
By default, the server runs on port **5000** (Base URL: `http://localhost:5000/api`).

---

### 10.1 Public Endpoint Testing

Since public routes do not require authentication, you can run simple GET requests directly:

#### 1. Fetch Hero Slides
```bash
curl -X GET "http://localhost:5000/api/home/hero-slides"
```

#### 2. Fetch Promo Banners
```bash
curl -X GET "http://localhost:5000/api/home/promo-banners"
```

#### 3. Fetch Category Tiles
```bash
curl -X GET "http://localhost:5000/api/home/category-tiles"
```

---

### 10.2 Admin Endpoint Testing

Admin endpoints require a valid JWT token with the `ADMIN` role. Below is an active testing admin token you can use:

**Token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTFkYzYwMmMxYTk0ZTRmNjE0YmQzMmMiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODA0MTI5NTksImV4cCI6MTc4MTAxNzc1OX0.EDm9cok1bY7bYIpWUIwcvxGvFiLKFCxl14L8m0tiSVc
```

#### 1. Create a Hero Slide (POST)
```bash
curl -X POST "http://localhost:5000/api/home/hero-slides" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTFkYzYwMmMxYTk0ZTRmNjE0YmQzMmMiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODA0MTI5NTksImV4cCI6MTc4MTAxNzc1OX0.EDm9cok1bY7bYIpWUIwcvxGvFiLKFCxl14L8m0tiSVc" \
  -H "Content-Type: application/json" \
  -d '{
    "eyebrow": "Festive Special",
    "title": "Timeless Handlooms",
    "subtitle": "Discover handwoven traditional wear.",
    "cta": { "label": "Shop Now", "to": "/shop" },
    "image": "https://example.com/handloom.jpg",
    "align": "center",
    "order": 1
  }'
```

#### 2. Update a Hero Slide (PATCH)
Replace `YOUR_HERO_SLIDE_ID` with the `_id` returned from the create request:
```bash
curl -X PATCH "http://localhost:5000/api/home/hero-slides/YOUR_HERO_SLIDE_ID" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTFkYzYwMmMxYTk0ZTRmNjE0YmQzMmMiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODA0MTI5NTksImV4cCI6MTc4MTAxNzc1OX0.EDm9cok1bY7bYIpWUIwcvxGvFiLKFCxl14L8m0tiSVc" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Timeless Handwoven Heritage"
  }'
```

#### 3. Toggle a Hero Slide Status (PATCH)
```bash
curl -X PATCH "http://localhost:5000/api/home/hero-slides/YOUR_HERO_SLIDE_ID/status" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTFkYzYwMmMxYTk0ZTRmNjE0YmQzMmMiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODA0MTI5NTksImV4cCI6MTc4MTAxNzc1OX0.EDm9cok1bY7bYIpWUIwcvxGvFiLKFCxl14L8m0tiSVc" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

#### 4. Delete a Hero Slide (DELETE)
```bash
curl -X DELETE "http://localhost:5000/api/home/hero-slides/YOUR_HERO_SLIDE_ID" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTFkYzYwMmMxYTk0ZTRmNjE0YmQzMmMiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODA0MTI5NTksImV4cCI6MTc4MTAxNzc1OX0.EDm9cok1bY7bYIpWUIwcvxGvFiLKFCxl14L8m0tiSVc"
```

The same request patterns with the `Authorization` header can be used to create, update, toggle, or delete Promo Banners and Category Tiles at `/api/home/promo-banners` and `/api/home/category-tiles`.

