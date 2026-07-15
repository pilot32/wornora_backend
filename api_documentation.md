# Backend API Documentation for Frontend Integration

This document outlines the API endpoints, expected request bodies, and responses for the e-commerce admin panel. It covers Auth, Categories, Subcategories, and Products.

## Base URL
`/api`

## Authentication Flow
1. User logs in via `/api/auth/login`.
2. The response includes a JWT token.
3. For protected routes, pass the token in the `Authorization` header: `Bearer <token>`.
4. Some routes require `ADMIN` role.

---

## 1. Authentication (`/api/auth`)

### 1.1 Register
- **Method:** `POST`
- **Endpoint:** `/register`
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User succesfully created"
  }
  ```

### 1.2 Login
- **Method:** `POST`
- **Endpoint:** `/login`
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login Succesful",
    "user": { ... },
    "token": "jwt_token_here"
  }
  ```

### 1.3 Profile (Protected)
- **Method:** `GET`
- **Endpoint:** `/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Returns the current logged-in user data.

---

## 2. Categories (`/api/categories`)

### 2.1 Get All Categories
- **Method:** `GET`
- **Endpoint:** `/`
- **Response:**
  ```json
  {
    "message": "categories fetched successqully",
    "categories": [ ... ]
  }
  ```

### 2.2 Get Category By ID
- **Method:** `GET`
- **Endpoint:** `/:id`
- **Response:** Returns a single category.

### 2.3 Create Category (Protected, ADMIN)
- **Method:** `POST`
- **Endpoint:** `/`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "Electronics",
    "slug": "electronics", // optional
    "isActive": true,
    "image": "url_to_image" // optional
  }
  ```
- **Response:** Returns the created category.

### 2.4 Update Category (Protected, ADMIN)
- **Method:** `PATCH`
- **Endpoint:** `/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** Fields to update (e.g., `name`, `isActive`, `image`).
- **Response:** Returns the updated category.

### 2.5 Update Category Status (Protected, ADMIN)
- **Method:** `PATCH`
- **Endpoint:** `/:id/status`
- **Headers:** `Authorization: Bearer <token>` // Missing from router file but good practice
- **Request Body:**
  ```json
  {
    "isActive": false
  }
  ```
- **Response:** Returns the updated category status.

### 2.6 Delete Category (Protected, ADMIN)
- **Method:** `DELETE`
- **Endpoint:** `/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Deletes the category.

---

## 3. Subcategories (`/api/subcategories`)

### 3.1 Get All Subcategories
- **Method:** `GET`
- **Endpoint:** `/`
- **Query Params:** `categoryId` (optional, to filter by category)
- **Response:** List of subcategories.

### 3.2 Get Subcategory By ID
- **Method:** `GET`
- **Endpoint:** `/:id`
- **Response:** Returns a single subcategory.

### 3.3 Create Subcategory (Protected, ADMIN)
- **Method:** `POST`
- **Endpoint:** `/`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "Smartphones",
    "categoryId": "valid_category_object_id",
    "image": "url_to_image" // optional
  }
  ```
- **Response:** Returns the created subcategory.

### 3.4 Update Subcategory (Protected, ADMIN)
- **Method:** `PATCH`
- **Endpoint:** `/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** Fields to update.
- **Response:** Returns updated subcategory.

### 3.5 Update Subcategory Status (Protected, ADMIN)
- **Method:** `PATCH`
- **Endpoint:** `/:id/status`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "isActive": false
  }
  ```
- **Response:** Returns updated status.

### 3.6 Delete Subcategory (Protected, ADMIN)
- **Method:** `DELETE`
- **Endpoint:** `/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Actually sets `isActive` to false instead of deleting entirely.

---

## 4. Products (`/api/products`)

### 4.1 Get All Products
- **Method:** `GET`
- **Endpoint:** `/`
- **Query Params:** `categoryId`, `subcategoryId`, `featured` (true/false), `isActive` (true/false)
- **Response:** List of products matching filters.

### 4.2 Get Product By ID
- **Method:** `GET`
- **Endpoint:** `/:id`
- **Response:** Returns single product.

### 4.3 Create Product (Protected, ADMIN)
- **Method:** `POST`
- **Endpoint:** `/`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "iPhone 13",
    "description": "Apple smartphone",
    "categoryId": "valid_category_id",
    "subcategoryId": "valid_subcategory_id",
    "price": 799,
    "discountedPrice": 699, // optional
    "stock": 100, // optional
    "images": ["url1", "url2"], // optional
    "isActive": true, // optional
    "featured": true // optional
  }
  ```
- **Response:** Returns created product.

### 4.4 Update Product (Protected, ADMIN)
- **Method:** `PATCH`
- **Endpoint:** `/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** Any valid fields to update.
- **Response:** Returns updated product.

### 4.5 Update Product Status (Protected, ADMIN)
- **Method:** `PATCH`
- **Endpoint:** `/:id/status`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "isActive": false
  }
  ```
- **Response:** Returns updated product status.
