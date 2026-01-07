#!/usr/bin/env node

/**
 * Create products using Shopify CLI authentication
 * 
 * This script uses the Shopify CLI's built-in authentication
 * to create products via the Admin GraphQL API.
 * 
 * Prerequisites:
 * - Shopify CLI installed (npm install -g @shopify/cli)
 * - Authenticated: shopify auth login
 * - Connected to store: shopify theme info (should show your store)
 * 
 * Usage: node create-products-cli.js
 */

const { execSync, spawn } = require('child_process');
const readline = require('readline');

const STORE_URL = 'byestelledegeyter.myshopify.com';

const products = [
  {
    title: 'Silver Diamond Ring',
    descriptionHtml: '<p>Elegant sterling silver ring featuring a brilliant cut diamond. Perfect for everyday wear or special occasions.</p>',
    vendor: 'EDG Jewelry',
    productType: 'Rings',
    tags: ['ring', 'silver', 'diamond', 'elegant'],
    variants: [
      { price: '299.00', compareAtPrice: '399.00', sku: 'SKU-RING-001', options: ['7'] },
      { price: '299.00', compareAtPrice: '399.00', sku: 'SKU-RING-002', options: ['8'] },
      { price: '299.00', compareAtPrice: '399.00', sku: 'SKU-RING-003', options: ['9'] }
    ],
    options: ['Size']
  },
  {
    title: 'Gold Pearl Necklace',
    descriptionHtml: '<p>Classic 18k gold necklace with cultured pearls. Timeless elegance for any wardrobe.</p>',
    vendor: 'EDG Jewelry',
    productType: 'Necklaces',
    tags: ['necklace', 'gold', 'pearl', 'classic'],
    variants: [
      { price: '599.00', compareAtPrice: '799.00', sku: 'SKU-NECK-001', options: ['18 inches'] },
      { price: '599.00', compareAtPrice: '799.00', sku: 'SKU-NECK-002', options: ['20 inches'] }
    ],
    options: ['Length']
  },
  {
    title: 'Rose Gold Earrings',
    descriptionHtml: '<p>Delicate rose gold drop earrings with cubic zirconia stones. Lightweight and comfortable for all-day wear.</p>',
    vendor: 'EDG Jewelry',
    productType: 'Earrings',
    tags: ['earrings', 'rose gold', 'cz', 'delicate'],
    variants: [
      { price: '149.00', compareAtPrice: '199.00', sku: 'SKU-EAR-001', options: ['Stud'] },
      { price: '179.00', compareAtPrice: '229.00', sku: 'SKU-EAR-002', options: ['Drop'] }
    ],
    options: ['Style']
  },
  {
    title: 'Platinum Wedding Band',
    descriptionHtml: '<p>Simple and elegant platinum wedding band. Comfortable fit with a polished finish.</p>',
    vendor: 'EDG Jewelry',
    productType: 'Rings',
    tags: ['ring', 'platinum', 'wedding', 'band'],
    variants: [
      { price: '899.00', compareAtPrice: '1199.00', sku: 'SKU-BAND-001', options: ['6'] },
      { price: '899.00', compareAtPrice: '1199.00', sku: 'SKU-BAND-002', options: ['7'] },
      { price: '899.00', compareAtPrice: '1199.00', sku: 'SKU-BAND-003', options: ['8'] }
    ],
    options: ['Size']
  },
  {
    title: 'Silver Charm Bracelet',
    descriptionHtml: '<p>Sterling silver charm bracelet with customizable charms. Add your own personal touch.</p>',
    vendor: 'EDG Jewelry',
    productType: 'Bracelets',
    tags: ['bracelet', 'silver', 'charm', 'customizable'],
    variants: [
      { price: '199.00', compareAtPrice: '249.00', sku: 'SKU-BRACE-001', options: ['7 inches'] },
      { price: '199.00', compareAtPrice: '249.00', sku: 'SKU-BRACE-002', options: ['8 inches'] }
    ],
    options: ['Length']
  }
];

// Build GraphQL mutation for creating a product
function buildProductMutation(product) {
  const variantsInput = product.variants.map(v => `{
    price: "${v.price}"
    ${v.compareAtPrice ? `compareAtPrice: "${v.compareAtPrice}"` : ''}
    ${v.sku ? `sku: "${v.sku}"` : ''}
    optionValues: [${v.options.map(o => `{name: "${o}", optionName: "${product.options[0]}"}`).join(', ')}]
  }`).join(',\n    ');

  return `mutation {
  productCreate(input: {
    title: "${product.title}"
    descriptionHtml: "${product.descriptionHtml.replace(/"/g, '\\"')}"
    vendor: "${product.vendor}"
    productType: "${product.productType}"
    tags: [${product.tags.map(t => `"${t}"`).join(', ')}]
    productOptions: [{name: "${product.options[0]}", values: [${product.variants.map(v => `{name: "${v.options[0]}"}`).join(', ')}]}]
    variants: [
    ${variantsInput}
    ]
  }) {
    product {
      id
      title
    }
    userErrors {
      field
      message
    }
  }
}`;
}

// Execute GraphQL via Shopify CLI
async function executeGraphQL(query) {
  return new Promise((resolve, reject) => {
    const escaped = query.replace(/\n/g, ' ').replace(/"/g, '\\"');
    const cmd = `shopify theme console --store ${STORE_URL} --command "puts ShopifyAPI::GraphQL.query('${escaped}')"`;
    
    try {
      const result = execSync(cmd, { encoding: 'utf8', timeout: 30000 });
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

async function main() {
  console.log('🚀 Shopify Product Creator (CLI Version)');
  console.log('=========================================\n');
  
  // Check if Shopify CLI is available
  try {
    execSync('shopify version', { encoding: 'utf8' });
    console.log('✓ Shopify CLI is installed\n');
  } catch (error) {
    console.error('❌ Shopify CLI is not installed or not in PATH');
    console.log('\nInstall it with: npm install -g @shopify/cli @shopify/theme');
    process.exit(1);
  }

  // Check connection to store
  try {
    const info = execSync('shopify theme info', { encoding: 'utf8' });
    if (!info.includes(STORE_URL)) {
      console.log('⚠️  Not connected to the correct store');
      console.log(`Expected: ${STORE_URL}`);
      console.log('\nRun: shopify theme dev --store ' + STORE_URL);
      process.exit(1);
    }
    console.log(`✓ Connected to ${STORE_URL}\n`);
  } catch (error) {
    console.error('❌ Could not verify store connection');
    console.log('\nRun: shopify auth login');
    process.exit(1);
  }

  console.log(`Creating ${products.length} products...\n`);

  // Note: The Shopify CLI doesn't have a direct GraphQL execution command for Admin API
  // So we need to use a different approach - create products via the REST API using curl
  
  console.log('⚠️  Note: Direct CLI product creation requires an access token.');
  console.log('\n📋 Alternative: Import products via CSV');
  console.log('   1. Go to: https://admin.shopify.com/store/byestelledegeyter/products');
  console.log('   2. Click "Import" button');
  console.log('   3. Upload the sample-jewelry-products.csv file\n');
  
  console.log('Or get your Admin API access token from:');
  console.log('   https://dev.shopify.com/dashboard/199720426/apps/309089894401');
  console.log('   → Look for API credentials or reinstall the app\n');
}

main().catch(console.error);

