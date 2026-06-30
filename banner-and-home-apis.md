# Home Page Content & Banner APIs (Proposal)

This document outlines the required database schemas and `GET` API endpoints needed in the backend to make the storefront home page fully dynamic (loading content like Hero slides, Promo banners, Category tiles, and Testimonials from the database).

All API structures below are designed to be consistent with the backend's new custom `ApiResponse` and `ApiError` conventions.

---

## 1. Hero Slides API

### Database Schema Proposal (`HeroSlide` model)
```javascript
const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema({
    eyebrow: { type: String, trim: true },
    title: { type: String, required: true, trim: true }, // supports "\n" for layout line-breaks
    subtitle: { type: String, trim: true },
    cta: {
        label: { type: String, required: true },
        to: { type: String, required: true }
    },
    secondaryCta: {
        label: { type: String },
        to: { type: String }
    },
    image: { type: String, required: true }, // Cloudinary or image URL
    align: { type: String, enum: ['left', 'center', 'right'], default: 'left' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('HeroSlide', heroSlideSchema);
```

### API Endpoint: `GET /api/home/hero-slides`
- **Access:** Public
- **Query Params:** None (or `?activeOnly=true`)
- **Response Structure (Success 200):**
  ```json
  {
      "success": true,
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
              "image": "https://loremflickr.com/1600/1000/saree,indian,woman?lock=5",
              "align": "left",
              "isActive": true,
              "order": 1
          }
      ]
  }
  ```

---

## 2. Promo Banners API

### Database Schema Proposal (`PromoBanner` model)
```javascript
const mongoose = require('mongoose');

const promoBannerSchema = new mongoose.Schema({
    eyebrow: { type: String, trim: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    cta: {
        label: { type: String, required: true },
        to: { type: String, required: true }
    },
    image: { type: String, required: true },
    accent: { type: String, enum: ['maroon', 'terracotta', 'gold'], default: 'gold' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('PromoBanner', promoBannerSchema);
```

### API Endpoint: `GET /api/home/promo-banners`
- **Access:** Public
- **Response Structure (Success 200):**
  ```json
  {
      "success": true,
      "statusCode": 200,
      "message": "Promotional banners fetched successfully",
      "data": [
          {
              "_id": "60d0fe4f5311236168a109b1",
              "eyebrow": "Festive Sale",
              "title": "Up to 40% Off",
              "subtitle": "Use code FESTIVE20 at checkout",
              "cta": { "label": "Shop Now", "to": "/shop?filter=sale" },
              "image": "https://loremflickr.com/800/600/saree,festival?lock=8",
              "accent": "maroon",
              "isActive": true,
              "order": 1
          }
      ]
  }
  ```

---

## 3. Category Tiles API

### Database Schema Proposal (`CategoryTile` model)
```javascript
const mongoose = require('mongoose');

const categoryTileSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    to: { type: String, required: true }, // e.g. "/shop?category=clothing&subcategory=sarees"
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('CategoryTile', categoryTileSchema);
```

### API Endpoint: `GET /api/home/category-tiles`
- **Access:** Public
- **Response Structure (Success 200):**
  ```json
  {
      "success": true,
      "statusCode": 200,
      "message": "Category tiles fetched successfully",
      "data": [
          {
              "_id": "60d0fe4f5311236168a109c1",
              "name": "Sarees",
              "slug": "sarees",
              "to": "/shop?category=clothing&subcategory=sarees",
              "image": "https://loremflickr.com/600/750/saree?lock=111",
              "isActive": true,
              "order": 1
          }
      ]
  }
  ```

---

## 4. Testimonials API

### Database Schema Proposal (`Testimonial` model)
```javascript
const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
```

### API Endpoint: `GET /api/home/testimonials`
- **Access:** Public
- **Response Structure (Success 200):**
  ```json
  {
      "success": true,
      "statusCode": 200,
      "message": "Testimonials fetched successfully",
      "data": [
          {
              "_id": "60d0fe4f5311236168a109d1",
              "name": "Ananya R.",
              "location": "Mumbai",
              "rating": 5,
              "text": "The Banarasi saree is absolutely stunning — the zari work looks even better in person. Wore it to my sister’s wedding and got endless compliments!",
              "isActive": true,
              "order": 1
          }
      ]
  }
  ```
