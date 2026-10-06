/*
 * Creates a presentable Wornora catalogue from the local photo assets.
 * Safe to rerun: records are matched by slug/title and updated in place.
 * Run from backend: node scripts/seed-client-showcase.js
 */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary.config');
const Category = require('../modules/categories/category.model');
const Subcategory = require('../modules/subcategories/subcategory.model');
const Product = require('../modules/products/products.model');
const HeroSlide = require('../modules/home/heroSlide.model');
const PromoBanner = require('../modules/home/promoBanner.model');
const CategoryTile = require('../modules/home/categoryTile.model');

const photos = path.resolve(__dirname, '../../photo');
const photo = (name) => path.join(photos, name);

const upload = async (fileName) => {
    const filePath = photo(fileName);
    if (!fs.existsSync(filePath)) throw new Error(`Missing image: ${fileName}`);

    const result = await cloudinary.uploader.upload(filePath, {
        folder: 'wornora/client-showcase',
        public_id: path.parse(fileName).name,
        overwrite: true,
        resource_type: 'image',
    });
    return result.secure_url;
};

const upsertCategory = (name, image) => Category.findOneAndUpdate(
    { slug: name.toLowerCase() },
    { $set: { name, slug: name.toLowerCase(), image, isActive: true } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
);

const upsertSubcategory = (name, categoryId, image) => Subcategory.findOneAndUpdate(
    { slug: name.toLowerCase() },
    { $set: { name, slug: name.toLowerCase(), categoryId, image, isActive: true } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
);

const upsertProduct = ({ name, categoryId, subcategoryId, images, price, discountedPrice, material, sizes, tags, featured }) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return Product.findOneAndUpdate(
        { slug },
        {
            $set: {
                name,
                slug,
                description: `A handcrafted ${name.toLowerCase()} selected for the Wornora client showcase.`,
                categoryId,
                subcategoryId,
                price,
                discountedPrice,
                stock: 12,
                images,
                material,
                sizes,
                tags,
                style: 'Festive handcrafted',
                careInstructions: 'Store in a dry place and handle with care.',
                isActive: true,
                featured,
            },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
};

async function main() {
    if (!process.env.MONGO_DB_URI) throw new Error('MONGO_DB_URI is required');
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error('Cloudinary credentials are required');
    }

    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log('Connected to MongoDB. Uploading 17 client images...');

    const imageNames = [
        '113403.jpg', '113404.jpg', '113405.jpg', '113406.jpg', '113407.jpg', '113408.jpg', '113409.jpg', '113410.jpg', '113411.jpg',
        '375fad87-c544-4b1b-bb84-90c396ecfd3c.JPG', '39ff5823-f1b0-4a79-bb9b-93de890ee95f.JPG', '3ab6227d-65f8-4328-a4ef-5a3295c6c712.JPG', '42288fec-3981-49f4-8118-e3383d6b8d49.JPG', '4e3b4b10-503f-4798-ad65-15f4e846386e.JPG', '595152b0-eec1-4da7-9485-65f6a4809bfa.JPG', '84861e63-176e-4a52-9f21-a46b037ffc8b.JPG', '9e781c83-53f8-4500-8c32-fb4357f7bcd1.JPG',
    ];
    const imageUrls = Object.fromEntries(await Promise.all(imageNames.map(async name => [name, await upload(name)])));

    const clothing = await upsertCategory('Clothing', imageUrls['4e3b4b10-503f-4798-ad65-15f4e846386e.JPG']);
    const jewellery = await upsertCategory('Jewellery', imageUrls['113403.jpg']);
    const kurtis = await upsertSubcategory('Kurtis', clothing._id, imageUrls['375fad87-c544-4b1b-bb84-90c396ecfd3c.JPG']);
    const tops = await upsertSubcategory('Tops', clothing._id, imageUrls['84861e63-176e-4a52-9f21-a46b037ffc8b.JPG']);
    const earrings = await upsertSubcategory('Earrings', jewellery._id, imageUrls['113403.jpg']);
    const rings = await upsertSubcategory('Rings', jewellery._id, imageUrls['113407.jpg']);

    const products = [
        { name: 'Red Printed Kurti', categoryId: clothing._id, subcategoryId: kurtis._id, images: [imageUrls['375fad87-c544-4b1b-bb84-90c396ecfd3c.JPG'], imageUrls['39ff5823-f1b0-4a79-bb9b-93de890ee95f.JPG'], imageUrls['595152b0-eec1-4da7-9485-65f6a4809bfa.JPG']], price: 1899, discountedPrice: 1499, material: 'Cotton blend', sizes: ['S', 'M', 'L', 'XL'], tags: ['kurti', 'printed', 'red'], featured: true },
        { name: 'White Floral Corset Top', categoryId: clothing._id, subcategoryId: tops._id, images: [imageUrls['3ab6227d-65f8-4328-a4ef-5a3295c6c712.JPG'], imageUrls['42288fec-3981-49f4-8118-e3383d6b8d49.JPG'], imageUrls['4e3b4b10-503f-4798-ad65-15f4e846386e.JPG'], imageUrls['84861e63-176e-4a52-9f21-a46b037ffc8b.JPG'], imageUrls['9e781c83-53f8-4500-8c32-fb4357f7bcd1.JPG']], price: 1699, discountedPrice: 1299, material: 'Cotton blend', sizes: ['S', 'M', 'L'], tags: ['top', 'floral', 'white'], featured: true },
        { name: 'Heritage Tassel Earrings', categoryId: jewellery._id, subcategoryId: earrings._id, images: [imageUrls['113403.jpg']], price: 1699, discountedPrice: 1399, material: 'Gold-tone alloy', sizes: [], tags: ['earrings', 'tassel', 'gold'], featured: true },
        { name: 'Ruby Drop Earrings', categoryId: jewellery._id, subcategoryId: earrings._id, images: [imageUrls['113404.jpg']], price: 1499, discountedPrice: 1199, material: 'Gold-tone alloy', sizes: [], tags: ['earrings', 'ruby', 'gold'], featured: false },
        { name: 'Pearl Temple Earrings', categoryId: jewellery._id, subcategoryId: earrings._id, images: [imageUrls['113405.jpg']], price: 1999, discountedPrice: 1699, material: 'Gold-tone alloy', sizes: [], tags: ['earrings', 'pearl', 'temple'], featured: true },
        { name: 'Kundan Ear Cuff', categoryId: jewellery._id, subcategoryId: earrings._id, images: [imageUrls['113406.jpg']], price: 1299, discountedPrice: 999, material: 'Gold-tone alloy', sizes: [], tags: ['ear cuff', 'kundan', 'gold'], featured: false },
        { name: 'Antique Statement Ring', categoryId: jewellery._id, subcategoryId: rings._id, images: [imageUrls['113407.jpg']], price: 1399, discountedPrice: 1099, material: 'Gold-tone alloy', sizes: ['Adjustable'], tags: ['ring', 'antique', 'gold'], featured: true },
        { name: 'Charm Box Ring', categoryId: jewellery._id, subcategoryId: rings._id, images: [imageUrls['113408.jpg']], price: 1199, discountedPrice: 899, material: 'Gold-tone alloy', sizes: ['Adjustable'], tags: ['ring', 'charm', 'gold'], featured: false },
        { name: 'Floral Motif Ring', categoryId: jewellery._id, subcategoryId: rings._id, images: [imageUrls['113409.jpg']], price: 1299, discountedPrice: 999, material: 'Gold-tone alloy', sizes: ['Adjustable'], tags: ['ring', 'floral', 'gold'], featured: false },
        { name: 'Ruby Jhumka Ring', categoryId: jewellery._id, subcategoryId: rings._id, images: [imageUrls['113410.jpg']], price: 1499, discountedPrice: 1199, material: 'Gold-tone alloy', sizes: ['Adjustable'], tags: ['ring', 'ruby', 'jhumka'], featured: true },
        { name: 'Crystal Tassel Earrings', categoryId: jewellery._id, subcategoryId: earrings._id, images: [imageUrls['113411.jpg']], price: 1599, discountedPrice: 1299, material: 'Gold-tone alloy', sizes: [], tags: ['earrings', 'crystal', 'tassel'], featured: false },
    ];
    await Promise.all(products.map(upsertProduct));

    const heroSlides = [
        { title: 'Handcrafted\nGold Stories', eyebrow: 'New jewellery edit', subtitle: 'Statement pieces made for every celebration.', cta: { label: 'Explore Jewellery', to: '/shop?category=jewellery' }, image: imageUrls['113403.jpg'], align: 'right', order: 10 },
        { title: 'Modern Indian\nSilhouettes', eyebrow: 'Fresh arrival', subtitle: 'Easy pieces with a handcrafted finish.', cta: { label: 'Shop Clothing', to: '/shop?category=clothing' }, image: imageUrls['4e3b4b10-503f-4798-ad65-15f4e846386e.JPG'], align: 'left', order: 11 },
        { title: 'Festive Details,\nEveryday Ease', eyebrow: 'Wornora edit', subtitle: 'Made to be noticed, designed to be worn.', cta: { label: 'Shop the Edit', to: '/shop' }, image: imageUrls['113405.jpg'], align: 'right', order: 12 },
    ];
    await Promise.all(heroSlides.map(slide => HeroSlide.findOneAndUpdate(
        { title: slide.title }, { $set: { ...slide, isActive: true } }, { new: true, upsert: true, setDefaultsOnInsert: true }
    )));

    const promoBanners = [
        { title: 'Jewellery That Tells a Story', eyebrow: 'Handcrafted details', subtitle: 'Gold-tone pieces for your next celebration.', cta: { label: 'Shop Jewellery', to: '/shop?category=jewellery' }, image: imageUrls['113404.jpg'], accent: 'gold', order: 10 },
        { title: 'New Season, New Silhouettes', eyebrow: 'Just in', subtitle: 'Statement tops made for easy dressing.', cta: { label: 'Shop Clothing', to: '/shop?category=clothing' }, image: imageUrls['84861e63-176e-4a52-9f21-a46b037ffc8b.JPG'], accent: 'terracotta', order: 11 },
        { title: 'The Festive Ring Edit', eyebrow: 'Made to gift', subtitle: 'A little sparkle for every occasion.', cta: { label: 'View Rings', to: '/shop?category=jewellery&subcategory=rings' }, image: imageUrls['113410.jpg'], accent: 'maroon', order: 12 },
    ];
    await Promise.all(promoBanners.map(banner => PromoBanner.findOneAndUpdate(
        { title: banner.title }, { $set: { ...banner, isActive: true } }, { new: true, upsert: true, setDefaultsOnInsert: true }
    )));

    const categoryTiles = [
        { name: 'Kurtis', slug: 'kurtis-showcase', to: '/shop?category=clothing&subcategory=kurtis', image: imageUrls['375fad87-c544-4b1b-bb84-90c396ecfd3c.JPG'], order: 0 },
        { name: 'Tops', slug: 'tops-showcase', to: '/shop?category=clothing&subcategory=tops', image: imageUrls['84861e63-176e-4a52-9f21-a46b037ffc8b.JPG'], order: 1 },
        { name: 'Earrings', slug: 'earrings-showcase', to: '/shop?category=jewellery&subcategory=earrings', image: imageUrls['113403.jpg'], order: 2 },
        { name: 'Rings', slug: 'rings-showcase', to: '/shop?category=jewellery&subcategory=rings', image: imageUrls['113407.jpg'], order: 3 },
    ];
    await Promise.all(categoryTiles.map(tile => CategoryTile.findOneAndUpdate(
        { slug: tile.slug }, { $set: { ...tile, isActive: true } }, { new: true, upsert: true, setDefaultsOnInsert: true }
    )));

    console.log(`Seed complete: 2 categories, 4 subcategories, ${products.length} products, 3 hero slides, 3 promo banners and 4 category banners.`);
}

main()
    .catch(error => { console.error(error); process.exitCode = 1; })
    .finally(async () => { await mongoose.disconnect(); });
