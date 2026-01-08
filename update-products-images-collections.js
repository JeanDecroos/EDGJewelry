#!/usr/bin/env node

/**
 * Script to add images and collections to existing products
 * 
 * Usage: node update-products-images-collections.js [ACCESS_TOKEN]
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

// Product images mapping from CSV
const productImages = {
  'Silver Diamond Ring': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
  'Gold Pearl Necklace': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
  'Rose Gold Earrings': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
  'Platinum Wedding Band': 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800',
  'Silver Charm Bracelet': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
  'Emerald Pendant Necklace': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
  'Diamond Tennis Bracelet': 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800',
  'Sapphire Solitaire Ring': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
  'Ruby Drop Earrings': 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=800',
  'Gold Hoop Earrings': 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800',
  'Pearl Stud Earrings': 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=800',
  'Diamond Eternity Band': 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800',
  'Silver Infinity Necklace': 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800',
  'Gold Layered Necklace Set': 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800',
  'Rose Gold Bangle Set': 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800',
  'Diamond Heart Pendant': 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800',
  'White Gold Chain Bracelet': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
  'Opal Statement Ring': 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800'
};

// Product to collection mapping
const productCollections = {
  'Silver Diamond Ring': 'Rings',
  'Platinum Wedding Band': 'Rings',
  'Sapphire Solitaire Ring': 'Rings',
  'Diamond Eternity Band': 'Rings',
  'Opal Statement Ring': 'Rings',
  'Gold Pearl Necklace': 'Necklaces',
  'Emerald Pendant Necklace': 'Necklaces',
  'Silver Infinity Necklace': 'Necklaces',
  'Gold Layered Necklace Set': 'Necklaces',
  'Diamond Heart Pendant': 'Necklaces',
  'Rose Gold Earrings': 'Earrings',
  'Ruby Drop Earrings': 'Earrings',
  'Gold Hoop Earrings': 'Earrings',
  'Pearl Stud Earrings': 'Earrings',
  'Silver Charm Bracelet': 'Bracelets',
  'Diamond Tennis Bracelet': 'Bracelets',
  'Rose Gold Bangle Set': 'Bracelets',
  'White Gold Chain Bracelet': 'Bracelets'
};

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
          // Handle empty responses (204 No Content, etc.)
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

async function createOrGetCollection(title) {
  try {
    // First, try to find existing custom collection
    const searchResponse = await makeRequest(`/admin/api/2024-01/custom_collections.json?title=${encodeURIComponent(title)}`, 'GET');
    
    if (searchResponse.custom_collections && searchResponse.custom_collections.length > 0) {
      return searchResponse.custom_collections[0];
    }
    
    // Create new custom collection if it doesn't exist
    const createResponse = await makeRequest('/admin/api/2024-01/custom_collections.json', 'POST', {
      custom_collection: {
        title: title,
        published: true
      }
    });
    return createResponse.custom_collection;
  } catch (error) {
    throw error;
  }
}

async function addImageToProduct(productId, imageUrl) {
  try {
    const response = await makeRequest(`/admin/api/2024-01/products/${productId}/images.json`, 'POST', {
      image: {
        src: imageUrl
      }
    });
    return response.image;
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
    // If product is already in collection or other error, that's okay
    if (error.message.includes('422') || error.message.includes('Unexpected end')) {
      return { already_exists: true };
    }
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting to update products with images and collections...\n');
  
  // Step 1: Get all products
  console.log('📦 Fetching products...');
  const products = await getProducts();
  console.log(`Found ${products.length} products\n`);
  
  // Step 2: Create collections
  console.log('📚 Creating collections...');
  const collections = {};
  const collectionNames = ['Rings', 'Necklaces', 'Earrings', 'Bracelets'];
  
  for (const collectionName of collectionNames) {
    try {
      const collection = await createOrGetCollection(collectionName);
      collections[collectionName] = collection;
      console.log(`✅ Collection "${collectionName}" ready (ID: ${collection.id})`);
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`❌ Failed to create collection "${collectionName}":`, error.message);
    }
  }
  console.log('');
  
  // Step 3: Update products with images and collections
  console.log('🖼️  Adding images and collections to products...\n');
  
  for (const product of products) {
    try {
      let updated = false;
      
      // Add image if we have one for this product
      if (productImages[product.title]) {
        // Check if product already has images
        if (!product.images || product.images.length === 0) {
          console.log(`Adding image to: ${product.title}...`);
          await addImageToProduct(product.id, productImages[product.title]);
          updated = true;
          await new Promise(resolve => setTimeout(resolve, 300));
        } else {
          console.log(`⏭️  ${product.title} already has images, skipping...`);
        }
      }
      
      // Add to collection if we have a mapping
      if (productCollections[product.title]) {
        const collectionName = productCollections[product.title];
        const collection = collections[collectionName];
        
        if (collection) {
          try {
            console.log(`Adding ${product.title} to collection "${collectionName}"...`);
            const result = await addProductToCollection(collection.id, product.id);
            if (result && !result.already_exists) {
              updated = true;
            }
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (error) {
            console.error(`  ⚠️  Could not add to collection: ${error.message}`);
          }
        }
      }
      
      if (updated) {
        console.log(`✅ Updated: ${product.title}\n`);
      }
    } catch (error) {
      console.error(`❌ Failed to update ${product.title}:`, error.message);
    }
  }
  
  console.log('✨ Done! All products have been updated.');
  console.log(`\nView your products at: https://${STORE_URL}/admin/products`);
  console.log(`View your collections at: https://${STORE_URL}/admin/collections`);
}

main().catch(console.error);

