# Product Creator Setup Guide

This guide will help you set up the product creator script to add products to your Shopify store.

## Quick Start

### Step 1: Get Your Admin API Access Token

1. **Go to Shopify Admin**
   - Navigate to: https://byestelledegeyter.myshopify.com/admin

2. **Access App Settings**
   - Go to **Settings** (bottom left) → **Apps and sales channels**
   - Click **Develop apps** (top right)

3. **Create or Select Your App**
   - If you already have an app, click on it
   - Otherwise, click **Create an app** and name it "Product Creator"

4. **Configure API Scopes**
   - Click **Configuration** in the left sidebar
   - Scroll to **Admin API access scopes**
   - Enable the following scopes:
     - ✅ `write_products`
     - ✅ `read_products`
   - Click **Save**

5. **Install the App**
   - Click **Install app** (you may need to review and accept permissions)
   - After installation, you'll see an **Admin API access token**
   - **Copy this token** - you'll need it in the next step

### Step 2: Configure Your Script

Create a `.env` file in the project root with your credentials:

```bash
# Create the .env file
touch .env
```

Then add the following content to `.env`:

```
SHOPIFY_STORE_URL=byestelledegeyter.myshopify.com
SHOPIFY_CLIENT_ID=YOUR_CLIENT_ID_HERE
SHOPIFY_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
SHOPIFY_ACCESS_TOKEN=PASTE_YOUR_ACCESS_TOKEN_HERE
```

**Replace `PASTE_YOUR_ACCESS_TOKEN_HERE` with the token you copied in Step 1.**

### Step 3: Run the Script

```bash
node create-products.js
```

The script will:
- ✅ Load credentials from your `.env` file
- ✅ Create 20 sample jewelry products
- ✅ Show progress for each product
- ✅ Display the product IDs when created

## Understanding Your Credentials

### Client ID & Client Secret
- These are used for **OAuth authentication** flows
- Useful if you're building a web application that needs user authorization
- For this simple script, you don't need them, but they're stored for future use

### Admin API Access Token
- This is what the script actually uses to authenticate
- It's a **private token** - keep it secret!
- It grants the app permission to create/read products on your behalf
- You get this token **after installing the app** in your Shopify admin

## Troubleshooting

### Error: "Please provide your Admin API access token"
- Make sure your `.env` file exists and contains `SHOPIFY_ACCESS_TOKEN=...`
- Check that the token doesn't have extra spaces or quotes

### Error: "401 Unauthorized" or "403 Forbidden"
- Your access token might be incorrect or expired
- Go back to Shopify Admin → Apps → Your App
- Uninstall and reinstall the app to get a new token
- Make sure the required API scopes are enabled

### Error: "Rate limit exceeded"
- The script includes a 500ms delay between requests
- If you still hit rate limits, increase the delay in the script (line ~319)
- Shopify allows 2 API calls per second per store

## Security Notes

- ✅ The `.env` file is already in `.gitignore` - your credentials won't be committed
- ⚠️ Never share your access token or commit it to version control
- ⚠️ If your token is compromised, revoke it in Shopify Admin and create a new one

## Next Steps

Once your products are created, you can:
- View them in Shopify Admin: https://byestelledegeyter.myshopify.com/admin/products
- Edit product details, add images, or adjust inventory
- Modify the `products` array in `create-products.js` to add custom products

