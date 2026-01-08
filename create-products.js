#!/usr/bin/env node

/**
 * Script to create sample jewelry products in Shopify using the Admin API
 * 
 * Usage:
 * Option 1 (Environment Variables - Recommended):
 *   1. Create a .env file with your credentials (see .env.example)
 *   2. Install dotenv: npm install dotenv
 *   3. Run: node create-products.js
 * 
 * Option 2 (Command Line):
 *   Run: node create-products.js YOUR_ACCESS_TOKEN
 * 
 * Option 3 (Manual):
 *   Set environment variables:
 *   export SHOPIFY_STORE_URL=your-store.myshopify.com
 *   export SHOPIFY_ACCESS_TOKEN=your_access_token
 *   node create-products.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Try to load environment variables from .env file
let envLoaded = false;
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          if (value) {
            process.env[key.trim()] = value;
            envLoaded = true;
          }
        }
      }
    });
  }
} catch (error) {
  // Silently fail if .env can't be loaded
}

const STORE_URL = process.env.SHOPIFY_STORE_URL || 'by-estelledegeyter.myshopify.com';
const ACCESS_TOKEN = process.argv[2] || process.env.SHOPIFY_ACCESS_TOKEN;
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;

if (!ACCESS_TOKEN) {
  console.error('❌ Error: Please provide your Admin API access token');
  console.log('\nUsage Options:');
  console.log('1. Command line: node create-products.js YOUR_ACCESS_TOKEN');
  console.log('2. Environment variable: export SHOPIFY_ACCESS_TOKEN=your_token && node create-products.js');
  console.log('3. .env file: Create .env with SHOPIFY_ACCESS_TOKEN=your_token and run: node create-products.js');
  console.log('\nTo get your access token:');
  console.log('1. Go to https://byestelledegeyter.myshopify.com/admin/settings/apps');
  console.log('2. Click "Develop apps" > Select your app or "Create an app"');
  console.log('3. Go to "Configuration" > "Admin API access scopes"');
  console.log('4. Enable: write_products, read_products');
  console.log('5. Click "Save" > "Install app"');
  console.log('6. Copy the "Admin API access token"');
  if (CLIENT_ID || CLIENT_SECRET) {
    console.log('\n💡 Note: You have CLIENT_ID and CLIENT_SECRET configured in .env');
    console.log('   However, this script requires an Admin API access token.');
    console.log('   Use the client credentials for OAuth flows in other applications.');
  }
  process.exit(1);
}

if (envLoaded) {
  console.log('✓ Loaded credentials from .env file\n');
}

const products = [
  {
    title: 'Silver Diamond Ring',
    body_html: '<p>Elegant sterling silver ring featuring a brilliant cut diamond. Perfect for everyday wear or special occasions.</p>',
    vendor: 'EDG Jewelry',
    product_type: 'Rings',
    tags: ['ring', 'silver', 'diamond', 'elegant'],
    variants: [
      { option1: '7', price: '299.00', compare_at_price: '399.00', sku: 'SKU-RING-001', inventory_quantity: 10 },
      { option1: '8', price: '299.00', compare_at_price: '399.00', sku: 'SKU-RING-002', inventory_quantity: 10 },
      { option1: '9', price: '299.00', compare_at_price: '399.00', sku: 'SKU-RING-003', inventory_quantity: 10 }
    ],
    options: [{ name: 'Size', values: ['7', '8', '9'] }]
  },
  {
    title: 'Gold Pearl Necklace',
    body_html: '<p>Classic 18k gold necklace with cultured pearls. Timeless elegance for any wardrobe.</p>',
    vendor: 'EDG Jewelry',
    product_type: 'Necklaces',
    tags: ['necklace', 'gold', 'pearl', 'classic'],
    variants: [
      { option1: '18 inches', price: '599.00', compare_at_price: '799.00', sku: 'SKU-NECK-001', inventory_quantity: 8 },
      { option1: '20 inches', price: '599.00', compare_at_price: '799.00', sku: 'SKU-NECK-002', inventory_quantity: 8 }
    ],
    options: [{ name: 'Length', values: ['18 inches', '20 inches'] }]
  },
  {
    title: 'Rose Gold Earrings',
    body_html: '<p>Delicate rose gold drop earrings with cubic zirconia stones. Lightweight and comfortable for all-day wear.</p>',
    vendor: 'EDG Jewelry',
    product_type: 'Earrings',
    tags: ['earrings', 'rose gold', 'cz', 'delicate'],
    variants: [
      { option1: 'Stud', price: '149.00', compare_at_price: '199.00', sku: 'SKU-EAR-001', inventory_quantity: 15 },
      { option1: 'Drop', price: '179.00', compare_at_price: '229.00', sku: 'SKU-EAR-002', inventory_quantity: 15 }
    ],
    options: [{ name: 'Style', values: ['Stud', 'Drop'] }]
  },
  {
    title: 'Platinum Wedding Band',
    body_html: '<p>Simple and elegant platinum wedding band. Comfortable fit with a polished finish.</p>',
    vendor: 'EDG Jewelry',
    product_type: 'Rings',
    tags: ['ring', 'platinum', 'wedding', 'band'],
    variants: [
      { option1: '6', price: '899.00', compare_at_price: '1199.00', sku: 'SKU-BAND-001', inventory_quantity: 12 },
      { option1: '7', price: '899.00', compare_at_price: '1199.00', sku: 'SKU-BAND-002', inventory_quantity: 12 },
      { option1: '8', price: '899.00', compare_at_price: '1199.00', sku: 'SKU-BAND-003', inventory_quantity: 12 }
    ],
    options: [{ name: 'Size', values: ['6', '7', '8'] }]
  },
  {
    title: 'Silver Charm Bracelet',
    body_html: '<p>Sterling silver charm bracelet with customizable charms. Add your own personal touch.</p>',
    vendor: 'EDG Jewelry',
    product_type: 'Bracelets',
    tags: ['bracelet', 'silver', 'charm', 'customizable'],
    variants: [
      { option1: '7 inches', price: '199.00', compare_at_price: '249.00', sku: 'SKU-BRACE-001', inventory_quantity: 6 },
      { option1: '8 inches', price: '199.00', compare_at_price: '249.00', sku: 'SKU-BRACE-002', inventory_quantity: 6 }
    ],
    options: [{ name: 'Length', values: ['7 inches', '8 inches'] }]
  },
  {
    title: 'Emerald Pendant Necklace',
    body_html: '<p>Stunning emerald pendant on a delicate gold chain. A statement piece for any occasion.</p>',
    vendor: 'EDG Jewelry',
    product_type: 'Necklaces',
    tags: ['necklace', 'emerald', 'pendant', 'statement'],
    variants: [
      { option1: '16 inches', price: '449.00', compare_at_price: '599.00', sku: 'SKU-PEND-001', inventory_quantity: 5 },
      { option1: '18 inches', price: '449.00', compare_at_price: '599.00', sku: 'SKU-PEND-002', inventory_quantity: 5 }
    ],
    options: [{ name: 'Chain Length', values: ['16 inches', '18 inches'] }]
  },
  {
    title: 'Diamond Tennis Bracelet',
    body_html: '<p>Luxurious tennis bracelet featuring brilliant cut diamonds set in white gold. A true classic.</p>',
    vendor: 'EDG Jewelry',
    product_type: 'Bracelets',
    tags: ['bracelet', 'diamond', 'tennis', 'luxury'],
    variants: [
      { option1: '7 inches', price: '2499.00', compare_at_price: '3499.00', sku: 'SKU-TENNIS-001', inventory_quantity: 3 },
      { option1: '7.5 inches', price: '2499.00', compare_at_price: '3499.00', sku: 'SKU-TENNIS-002', inventory_quantity: 3 }
    ],
    options: [{ name: 'Length', values: ['7 inches', '7.5 inches'] }]
  },
  {
    title: 'Sapphire Solitaire Ring',
    body_html: '<p>Stunning blue sapphire solitaire ring set in white gold. A timeless piece that captures attention.</p>',
    vendor: 'EDG Jewelry',
    product_type: 'Rings',
    tags: ['ring', 'sapphire', 'solitaire', 'white gold', 'elegant'],
    variants: [
      { option1: '5', price: '1299.00', compare_at_price: '1699.00', sku: 'SKU-SAP-001', inventory_quantity: 4 },
      { option1: '6', price: '1299.00', compare_at_price: '1699.00', sku: 'SKU-SAP-002', inventory_quantity: 4 },
      { option1: '7', price: '1299.00', compare_at_price: '1699.00', sku: 'SKU-SAP-003', inventory_quantity: 4 },
      { option1: '8', price: '1299.00', compare_at_price: '1699.00', sku: 'SKU-SAP-004', inventory_quantity: 4 }
    ],
    options: [{ name: 'Size', values: ['5', '6', '7', '8'] }]
  },
  {
    title: 'Ruby Drop Earrings',
    body_html: '<p>Luxurious ruby drop earrings with white gold accents. Perfect for evening events and special occasions.</p>',
    vendor: 'EDG Jewelry',
    product_type: 'Earrings',
    tags: ['earrings', 'ruby', 'drop', 'white gold', 'luxury'],
    variants: [
      { option1: 'One Size', price: '899.00', compare_at_price: '1199.00', sku: 'SKU-RUBY-001', inventory_quantity: 6 }
    ],
    options: [{ name: 'Size', values: ['One Size'] }]
  },
  {
    title: 'Gold Hoop Earrings',
    body_html: '<p>Classic 18k gold hoop earrings. Versatile and elegant, perfect for any outfit.</p>',
    vendor: 'EDG Jewelry',
    product_type: 'Earrings',
    tags: ['earrings', 'gold', 'hoop', 'classic', 'versatile'],
    variants: [
      { option1: 'Small', price: '349.00', compare_at_price: '449.00', sku: 'SKU-HOOP-001', inventory_quantity: 12 },
      { option1: 'Medium', price: '449.00', compare_at_price: '599.00', sku: 'SKU-HOOP-002', inventory_quantity: 12 },
      { option1: 'Large', price: '599.00', compare_at_price: '799.00', sku: 'SKU-HOOP-003', inventory_quantity: 8 }
    ],
    options: [{ name: 'Size', values: ['Small', 'Medium', 'Large'] }]
  },
  {
    title: 'Pearl Stud Earrings',
    body_html: '<p>Timeless cultured pearl stud earrings in white gold settings. A wardrobe essential.</p>',
    vendor: 'EDG Jewelry',
    product_type: 'Earrings',
    tags: ['earrings', 'pearl', 'stud', 'white gold', 'timeless'],
    variants: [
      { option1: '6mm', price: '249.00', compare_at_price: '329.00', sku: 'SKU-PEARL-STUD-001', inventory_quantity: 15 },
      { option1: '8mm', price: '349.00', compare_at_price: '449.00', sku: 'SKU-PEARL-STUD-002', inventory_quantity: 15 },
      { option1: '10mm', price: '499.00', compare_at_price: '649.00', sku: 'SKU-PEARL-STUD-003', inventory_quantity: 10 }
    ],
    options: [{ name: 'Pearl Size', values: ['6mm', '8mm', '10mm'] }]
  },
  {
    title: 'Diamond Eternity Band',
    body_html: '<p>Exquisite diamond eternity band with stones all around. A symbol of eternal love and commitment.</p>',
    vendor: 'EDG Jewelry',
    product_type: 'Rings',
    tags: ['ring', 'diamond', 'eternity', 'white gold', 'wedding'],
    variants: [
      { option1: '5', price: '1899.00', compare_at_price: '2499.00', sku: 'SKU-ETERNITY-001', inventory_quantity: 5 },
      { option1: '6', price: '1899.00', compare_at_price: '2499.00', sku: 'SKU-ETERNITY-002', inventory_quantity: 5 },
      { option1: '7', price: '1899.00', compare_at_price: '2499.00', sku: 'SKU-ETERNITY-003', inventory_quantity: 5 },
      { option1: '8', price: '1899.00', compare_at_price: '2499.00', sku: 'SKU-ETERNITY-004', inventory_quantity: 5 }
    ],
    options: [{ name: 'Size', values: ['5', '6', '7', '8'] }]
  },
  {
    title: 'Silver Infinity Necklace',
    body_html: '<p>Delicate sterling silver infinity symbol pendant on a chain. A meaningful gift for someone special.</p>',
    vendor: 'EDG Jewelry',
    product_type: 'Necklaces',
    tags: ['necklace', 'silver', 'infinity', 'pendant', 'meaningful'],
    variants: [
      { option1: '16 inches', price: '129.00', compare_at_price: '179.00', sku: 'SKU-INFINITY-001', inventory_quantity: 20 },
      { option1: '18 inches', price: '129.00', compare_at_price: '179.00', sku: 'SKU-INFINITY-002', inventory_quantity: 20 },
      { option1: '20 inches', price: '129.00', compare_at_price: '179.00', sku: 'SKU-INFINITY-003', inventory_quantity: 20 }
    ],
    options: [{ name: 'Chain Length', values: ['16 inches', '18 inches', '20 inches'] }]
  },
  {
    title: 'Gold Layered Necklace Set',
    body_html: '<p>Beautiful set of three 18k gold layered necklaces. Mix and match or wear together for a stunning layered look.</p>',
    vendor: 'EDG Jewelry',
    product_type: 'Necklaces',
    tags: ['necklace', 'gold', 'layered', 'set', 'versatile'],
    variants: [
      { option1: 'One Size', price: '799.00', compare_at_price: '1099.00', sku: 'SKU-LAYERED-001', inventory_quantity: 8 }
    ],
    options: [{ name: 'Size', values: ['One Size'] }]
  },
  {
    title: 'Rose Gold Bangle Set',
    body_html: '<p>Elegant set of three rose gold bangles. Stack them together or wear individually for a modern look.</p>',
    vendor: 'EDG Jewelry',
    product_type: 'Bracelets',
    tags: ['bracelet', 'rose gold', 'bangle', 'set', 'stackable'],
    variants: [
      { option1: 'Small', price: '299.00', compare_at_price: '399.00', sku: 'SKU-BANGLE-001', inventory_quantity: 10 },
      { option1: 'Medium', price: '299.00', compare_at_price: '399.00', sku: 'SKU-BANGLE-002', inventory_quantity: 10 },
      { option1: 'Large', price: '299.00', compare_at_price: '399.00', sku: 'SKU-BANGLE-003', inventory_quantity: 10 }
    ],
    options: [{ name: 'Size', values: ['Small', 'Medium', 'Large'] }]
  },
  {
    title: 'Diamond Heart Pendant',
    body_html: '<p>Romantic heart-shaped pendant with brilliant cut diamonds, suspended on a delicate gold chain.</p>',
    vendor: 'EDG Jewelry',
    product_type: 'Necklaces',
    tags: ['necklace', 'diamond', 'heart', 'pendant', 'romantic'],
    variants: [
      { option1: '16 inches', price: '699.00', compare_at_price: '899.00', sku: 'SKU-HEART-001', inventory_quantity: 7 },
      { option1: '18 inches', price: '699.00', compare_at_price: '899.00', sku: 'SKU-HEART-002', inventory_quantity: 7 }
    ],
    options: [{ name: 'Chain Length', values: ['16 inches', '18 inches'] }]
  },
  {
    title: 'White Gold Chain Bracelet',
    body_html: '<p>Sophisticated white gold chain bracelet with a secure clasp. Perfect for everyday elegance.</p>',
    vendor: 'EDG Jewelry',
    product_type: 'Bracelets',
    tags: ['bracelet', 'white gold', 'chain', 'everyday', 'elegant'],
    variants: [
      { option1: '7 inches', price: '449.00', compare_at_price: '599.00', sku: 'SKU-CHAIN-001', inventory_quantity: 9 },
      { option1: '7.5 inches', price: '449.00', compare_at_price: '599.00', sku: 'SKU-CHAIN-002', inventory_quantity: 9 },
      { option1: '8 inches', price: '449.00', compare_at_price: '599.00', sku: 'SKU-CHAIN-003', inventory_quantity: 9 }
    ],
    options: [{ name: 'Length', values: ['7 inches', '7.5 inches', '8 inches'] }]
  },
  {
    title: 'Opal Statement Ring',
    body_html: '<p>Bold opal statement ring set in rose gold. A unique piece that makes a statement.</p>',
    vendor: 'EDG Jewelry',
    product_type: 'Rings',
    tags: ['ring', 'opal', 'statement', 'rose gold', 'unique'],
    variants: [
      { option1: '6', price: '599.00', compare_at_price: '799.00', sku: 'SKU-OPAL-001', inventory_quantity: 6 },
      { option1: '7', price: '599.00', compare_at_price: '799.00', sku: 'SKU-OPAL-002', inventory_quantity: 6 },
      { option1: '8', price: '599.00', compare_at_price: '799.00', sku: 'SKU-OPAL-003', inventory_quantity: 6 }
    ],
    options: [{ name: 'Size', values: ['6', '7', '8'] }]
  }
];

function makeRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    
    const options = {
      hostname: STORE_URL,
      path: `/admin/api/2024-01/products.json`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ACCESS_TOKEN,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API Error: ${res.statusCode} - ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          reject(new Error(`Parse Error: ${e.message} - ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function createProduct(productData) {
  try {
    const response = await makeRequest('/admin/api/2024-01/products.json', 'POST', {
      product: productData
    });
    return response.product;
  } catch (error) {
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting to create products...\n');
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    try {
      console.log(`Creating: ${product.title}...`);
      const created = await createProduct(product);
      console.log(`✅ Created: ${created.title} (ID: ${created.id})\n`);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Failed to create ${product.title}:`, error.message);
      if (error.message.includes('401') || error.message.includes('403')) {
        console.error('\n⚠️  Authentication error. Please check your access token.');
        process.exit(1);
      }
    }
  }
  
  console.log('✨ Done! All products have been created.');
  console.log(`\nView your products at: https://${STORE_URL}/admin/products`);
}

main().catch(console.error);

