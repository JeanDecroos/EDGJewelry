#!/usr/bin/env node

/**
 * Script to create a "Featured" collection and add products to it
 * 
 * Usage: node create-featured-collection.js [ACCESS_TOKEN]
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env file
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
  // Silently fail
}

const STORE_URL = process.env.SHOPIFY_STORE_URL || 'by-estelledegeyter.myshopify.com';
const ACCESS_TOKEN = process.argv[2] || process.env.SHOPIFY_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('❌ Error: Please provide your Admin API access token');
  process.exit(1);
}

if (envLoaded) {
  console.log('✓ Loaded credentials from .env file\n');
}

// Featured products (select a few from each category)
const featuredProductTitles = [
  'Silver Diamond Ring',
  'Gold Pearl Necklace',
  'Rose Gold Earrings',
  'Diamond Tennis Bracelet',
  'Sapphire Solitaire Ring',
  'Diamond Heart Pendant',
  'Platinum Wedding Band',
  'Ruby Drop Earrings'
];

function makeRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    
    const options = {
      hostname: STORE_URL,
      path: path,
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
          if (!body || body.trim() === '') {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({});
            } else {
              reject(new Error(`API Error: ${res.statusCode} - Empty response`));
            }
            return;
          }
          
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

async function getProducts() {
  try {
    const response = await makeRequest('/admin/api/2024-01/products.json?limit=250', 'GET');
    return response.products;
  } catch (error) {
    throw error;
  }
}

async function createOrGetFeaturedCollection() {
  try {
    // First, try to find existing "Featured" collection
    const searchResponse = await makeRequest('/admin/api/2024-01/custom_collections.json?title=Featured', 'GET');
    
    if (searchResponse.custom_collections && searchResponse.custom_collections.length > 0) {
      return searchResponse.custom_collections[0];
    }
    
    // Create new "Featured" collection if it doesn't exist
    const createResponse = await makeRequest('/admin/api/2024-01/custom_collections.json', 'POST', {
      custom_collection: {
        title: 'Featured',
        published: true
      }
    });
    return createResponse.custom_collection;
  } catch (error) {
    throw error;
  }
}

async function addProductToCollection(collectionId, productId) {
  try {
    // Check if product is already in collection
    const existingResponse = await makeRequest(`/admin/api/2024-01/collects.json?collection_id=${collectionId}&product_id=${productId}`, 'GET');
    if (existingResponse.collects && existingResponse.collects.length > 0) {
      return { already_exists: true };
    }
    
    // Add product to collection
    const response = await makeRequest(`/admin/api/2024-01/collects.json`, 'POST', {
      collect: {
        product_id: productId,
        collection_id: collectionId
      }
    });
    return response.collect;
  } catch (error) {
    if (error.message.includes('422') || error.message.includes('Unexpected end')) {
      return { already_exists: true };
    }
    throw error;
  }
}

async function main() {
  console.log('🚀 Creating Featured collection and adding products...\n');
  
  // Step 1: Create or get Featured collection
  console.log('📚 Creating/Getting Featured collection...');
  const collection = await createOrGetFeaturedCollection();
  console.log(`✅ Featured collection ready (ID: ${collection.id})\n`);
  
  // Step 2: Get all products
  console.log('📦 Fetching products...');
  const products = await getProducts();
  console.log(`Found ${products.length} products\n`);
  
  // Step 3: Add featured products to collection
  console.log('⭐ Adding featured products to collection...\n');
  
  let addedCount = 0;
  let skippedCount = 0;
  
  for (const productTitle of featuredProductTitles) {
    const product = products.find(p => p.title === productTitle);
    
    if (product) {
      try {
        const result = await addProductToCollection(collection.id, product.id);
        if (result && !result.already_exists) {
          console.log(`✅ Added: ${product.title}`);
          addedCount++;
        } else {
          console.log(`⏭️  Already in collection: ${product.title}`);
          skippedCount++;
        }
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`❌ Failed to add ${product.title}:`, error.message);
      }
    } else {
      console.log(`⚠️  Product not found: ${productTitle}`);
    }
  }
  
  console.log(`\n✨ Done!`);
  console.log(`   Added: ${addedCount} products`);
  console.log(`   Already in collection: ${skippedCount} products`);
  console.log(`\nView your Featured collection at: https://${STORE_URL}/admin/collections/${collection.id}`);
}

main().catch(console.error);

