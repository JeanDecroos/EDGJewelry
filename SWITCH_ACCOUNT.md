# Switching Shopify Accounts

This guide will help you connect this theme repository to your new Shopify account.

## Current Configuration
- **Current Store**: byestelledegeyter.myshopify.com
- **Development Theme ID**: #191178080591

## Steps to Switch Accounts

### Option 1: Using Shopify CLI (Recommended)

1. **Log out of the current account:**
   ```bash
   shopify auth logout
   ```

2. **Log in to your new account:**
   ```bash
   shopify auth login
   ```
   This will open a browser for you to authenticate with your new Shopify account.

3. **Connect the theme to your new store:**
   ```bash
   shopify theme dev
   ```
   When prompted, select your new store from the list.

4. **Or specify the store directly:**
   ```bash
   shopify theme dev --store your-new-store.myshopify.com
   ```

### Option 2: Manual Configuration

If you need to manually configure the connection:

1. **Check your current theme configuration:**
   ```bash
   shopify theme info
   ```

2. **Pull the theme from your new store:**
   ```bash
   shopify theme pull --store your-new-store.myshopify.com
   ```

3. **Or push this theme to your new store:**
   ```bash
   shopify theme push --store your-new-store.myshopify.com
   ```

## After Switching

Once connected to your new account:

1. **Verify the connection:**
   ```bash
   shopify theme info
   ```
   This should show your new store name.

2. **Start development:**
   ```bash
   shopify theme dev
   ```

3. **Test your pages:**
   - Custom page: `http://localhost:9292/pages/custom`
   - About page: `http://localhost:9292/pages/about`

## Notes

- Your theme files are already in this repository, so they'll work with any Shopify store
- You may need to recreate the "Custom" and "About" pages in your new store's admin
- Product data and pages are store-specific, so they won't transfer automatically

