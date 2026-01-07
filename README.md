# EDG Jewelry - Minimalist Luxury Shopify Theme

A minimalist luxury jewelry storefront inspired by bobby-world.com, built with Shopify Liquid, HTML, CSS, and vanilla JavaScript.

## 🚀 Local Development

### Option 1: Shopify CLI (Recommended - Full Liquid Support)

To preview this theme with full Shopify Liquid functionality, you need a Shopify store:

1. **Create a free Shopify development store** (if you don't have one):
   - Go to https://partners.shopify.com
   - Sign up for a Partner account
   - Create a development store

2. **Authenticate Shopify CLI**:
   ```bash
   shopify auth login
   ```

3. **Start the development server**:
   ```bash
   shopify theme dev
   ```
   
   This will:
   - Connect to your store
   - Create a development theme
   - Start a local server (usually at http://127.0.0.1:9292)
   - Hot reload on file changes

4. **Push theme to store** (optional):
   ```bash
   shopify theme push
   ```

### Option 2: Static HTML Preview (Design Only)

If you want to preview the design without a Shopify store, see `preview/index.html` for a static mockup.

## 📁 Project Structure

```
EDGJewelry/
├── assets/
│   ├── base.css          # All styling
│   └── theme.js          # Minimal vanilla JS
├── config/
│   ├── settings_data.json
│   └── settings_schema.json
├── layout/
│   └── theme.liquid      # Main layout
├── locales/
│   └── en.default.json
├── sections/
│   ├── header.liquid
│   ├── footer.liquid
│   ├── hero.liquid
│   ├── featured-collection.liquid
│   ├── main-collection.liquid
│   ├── main-product.liquid
│   ├── product-recommendations.liquid
│   ├── list-collections.liquid
│   ├── main-page.liquid
│   └── custom-piece.liquid
├── snippets/
│   ├── product-card.liquid
│   ├── cart-drawer.liquid
│   └── meta-tags.liquid
└── templates/
    ├── index.json
    ├── collection.json
    ├── product.json
    ├── list-collections.json
    ├── page.json
    └── page.custom.json
```

## 🎨 Design Features

- **Editorial aesthetic** - Generous whitespace, minimal UI
- **Product hover animation** - CSS-only opacity crossfade (400ms)
- **Scroll reveal** - Subtle fade-in on viewport entry
- **Header compression** - Reduces height on scroll
- **Typography** - Lowercase product names, light font weights
- **No visual noise** - No borders, shadows, or accent colors

## 🛠️ Tech Stack

- **Shopify Liquid** - Template engine
- **Vanilla CSS** - No frameworks
- **Vanilla JavaScript** - Minimal, no libraries
- **Inter Font** - Modern grotesk sans-serif

## 📝 Notes

- Product cards use a single `<a>` element (Shopify best practice)
- All animations respect `prefers-reduced-motion`
- Mobile-responsive with breakpoints at 1024px and 600px
- Cart drawer slides in from right with overlay

## 🛍️ Product Management

### Adding Sample Products

This project includes a script to create sample jewelry products in your Shopify store:

```bash
node create-products.js
```

**Before running:**
1. See `SETUP.md` for detailed instructions on getting your Admin API access token
2. Create a `.env` file with your Shopify credentials (see `env.example`)
3. Install the app in Shopify Admin with `write_products` and `read_products` scopes

The script will create 20 sample jewelry products including rings, necklaces, earrings, and bracelets.

