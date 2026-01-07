#!/usr/bin/env node

/**
 * OAuth Helper Script - Gets Admin API Access Token
 * 
 * This script will:
 * 1. Start a local server
 * 2. Open your browser to authorize the app
 * 3. Capture the access token
 * 4. Save it to your .env file
 * 
 * Usage: node get-access-token.js
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuration
// IMPORTANT: Replace these with your actual credentials from Shopify Admin
// Get them from: Settings > Apps > Your App > API Credentials
const STORE_URL = 'byestelledegeyter.myshopify.com';
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE';
const REDIRECT_PORT = 3456;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/callback`;
const SCOPES = 'write_products,read_products';

// Open URL in browser
function openBrowser(url) {
  const command = process.platform === 'darwin' 
    ? `open "${url}"` 
    : process.platform === 'win32' 
      ? `start "${url}"` 
      : `xdg-open "${url}"`;
  exec(command);
}

// Exchange authorization code for access token
function exchangeCodeForToken(code) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code
    });

    const options = {
      hostname: STORE_URL,
      path: '/admin/oauth/access_token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.access_token) {
            resolve(data.access_token);
          } else {
            reject(new Error(`Failed to get token: ${body}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message} - ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Save token to .env file
function saveTokenToEnv(token) {
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    // Update existing token or add new one
    if (envContent.includes('SHOPIFY_ACCESS_TOKEN=')) {
      envContent = envContent.replace(/SHOPIFY_ACCESS_TOKEN=.*/g, `SHOPIFY_ACCESS_TOKEN=${token}`);
    } else {
      envContent += `\nSHOPIFY_ACCESS_TOKEN=${token}\n`;
    }
  } else {
    envContent = `# Shopify Credentials
SHOPIFY_STORE_URL=${STORE_URL}
SHOPIFY_CLIENT_ID=${CLIENT_ID}
SHOPIFY_CLIENT_SECRET=${CLIENT_SECRET}
SHOPIFY_ACCESS_TOKEN=${token}
`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log(`\n✅ Token saved to .env file`);
}

// Main function
async function main() {
  console.log('🔐 Shopify OAuth Helper');
  console.log('========================\n');
  console.log(`Store: ${STORE_URL}`);
  console.log(`Client ID: ${CLIENT_ID}`);
  console.log(`Scopes: ${SCOPES}\n`);

  // Create local server to receive OAuth callback
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${REDIRECT_PORT}`);
    
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const shop = url.searchParams.get('shop');
      
      if (code) {
        console.log('📥 Received authorization code');
        
        try {
          const accessToken = await exchangeCodeForToken(code);
          console.log('\n🎉 SUCCESS! Got access token:');
          console.log(`   ${accessToken.substring(0, 20)}...`);
          
          saveTokenToEnv(accessToken);
          
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head><title>Success!</title></head>
              <body style="font-family: system-ui; text-align: center; padding: 50px;">
                <h1>✅ Authorization Successful!</h1>
                <p>Access token has been saved to your .env file.</p>
                <p>You can now close this window and run:</p>
                <pre style="background: #f0f0f0; padding: 20px; border-radius: 8px;">node create-products.js</pre>
              </body>
            </html>
          `);
          
          console.log('\n📋 Next steps:');
          console.log('   1. Close the browser tab');
          console.log('   2. Run: node create-products.js');
          
          // Close server after a short delay
          setTimeout(() => {
            server.close();
            process.exit(0);
          }, 2000);
          
        } catch (error) {
          console.error('❌ Error exchanging code for token:', error.message);
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head><title>Error</title></head>
              <body style="font-family: system-ui; text-align: center; padding: 50px;">
                <h1>❌ Error</h1>
                <p>${error.message}</p>
              </body>
            </html>
          `);
          server.close();
          process.exit(1);
        }
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Missing authorization code');
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  });

  server.listen(REDIRECT_PORT, () => {
    console.log(`🖥️  Local server running on port ${REDIRECT_PORT}`);
    
    // Build OAuth URL
    const authUrl = `https://${STORE_URL}/admin/oauth/authorize?` +
      `client_id=${CLIENT_ID}` +
      `&scope=${SCOPES}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    
    console.log('\n🌐 Opening browser for authorization...\n');
    console.log(`If browser doesn't open, visit:\n${authUrl}\n`);
    
    openBrowser(authUrl);
  });

  // Handle timeout
  setTimeout(() => {
    console.log('\n⏰ Timeout - no response received after 5 minutes');
    server.close();
    process.exit(1);
  }, 5 * 60 * 1000);
}

main().catch(console.error);

