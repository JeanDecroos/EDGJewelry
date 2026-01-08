/**
 * Create About Page in Shopify
 * 
 * This script creates an "About" page with the "about" template suffix
 * 
 * Usage:
 *   node create-about-page.js
 * 
 * Requires:
 *   - .env file with SHOPIFY_STORE_URL and SHOPIFY_ACCESS_TOKEN
 */

require('dotenv').config();

const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL || 'by-estelledegeyter.myshopify.com';
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

if (!SHOPIFY_ACCESS_TOKEN) {
  console.error('❌ Error: SHOPIFY_ACCESS_TOKEN not found in .env file');
  console.error('   Please add your Admin API access token to .env');
  process.exit(1);
}

const API_VERSION = '2025-01';
const API_URL = `https://${SHOPIFY_STORE_URL}/admin/api/${API_VERSION}/graphql.json`;

/**
 * GraphQL mutation to create a page
 */
const CREATE_PAGE_MUTATION = `
  mutation CreatePage($page: PageCreateInput!) {
    pageCreate(page: $page) {
      page {
        id
        title
        handle
        templateSuffix
        url
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

/**
 * GraphQL query to check if About page already exists
 */
const CHECK_PAGE_QUERY = `
  query CheckPages($query: String!) {
    pages(first: 10, query: $query) {
      edges {
        node {
          id
          title
          handle
          templateSuffix
        }
      }
    }
  }
`;

async function checkExistingPage() {
  const variables = {
    query: 'title:About OR handle:about'
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
    },
    body: JSON.stringify({
      query: CHECK_PAGE_QUERY,
      variables,
    }),
  });

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return data.data.pages.edges;
}

async function createAboutPage() {
  console.log('🔍 Checking if About page already exists...\n');

  try {
    const existingPages = await checkExistingPage();
    
    if (existingPages.length > 0) {
      const existingPage = existingPages[0].node;
      console.log('✅ About page already exists:');
      console.log(`   Title: ${existingPage.title}`);
      console.log(`   Handle: ${existingPage.handle}`);
      console.log(`   Template: ${existingPage.templateSuffix || 'default'}`);
      console.log(`   ID: ${existingPage.id}\n`);
      
      // Check if it has the right template
      if (existingPage.templateSuffix === 'about') {
        console.log('✅ Page already has the "about" template suffix!');
        return;
      } else {
        console.log('⚠️  Page exists but doesn\'t have "about" template suffix.');
        console.log('   You can update it manually in Shopify Admin:\n');
        console.log('   1. Go to Online Store > Pages');
        console.log('   2. Click on "About" page');
        console.log('   3. In the template dropdown, select "page.about"');
        return;
      }
    }

    console.log('📝 Creating About page with "about" template...\n');

    const variables = {
      page: {
        title: 'About',
        handle: 'about',
        body: '<p>Learn more about us and our passion for creating beautiful jewelry.</p>',
        isPublished: true,
        templateSuffix: 'about'
      }
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: CREATE_PAGE_MUTATION,
        variables,
      }),
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    if (data.data.pageCreate.userErrors.length > 0) {
      const errors = data.data.pageCreate.userErrors;
      console.error('❌ Errors creating page:');
      errors.forEach(error => {
        console.error(`   ${error.field}: ${error.message}`);
      });
      return;
    }

    const page = data.data.pageCreate.page;
    
    console.log('✅ About page created successfully!');
    console.log(`   Title: ${page.title}`);
    console.log(`   Handle: ${page.handle}`);
    console.log(`   Template: ${page.templateSuffix}`);
    console.log(`   URL: https://${SHOPIFY_STORE_URL}${page.url}`);
    console.log(`   ID: ${page.id}\n`);
    console.log('📝 Next steps:');
    console.log('   1. Go to Shopify Admin > Online Store > Pages');
    console.log('   2. Click on "About" page');
    console.log('   3. Edit the content and customize the page settings');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('fetch')) {
      console.error('\n💡 Tip: Make sure your SHOPIFY_STORE_URL is correct');
      console.error('   It should be: by-estelledegeyter.myshopify.com (without https://)');
    }
    process.exit(1);
  }
}

// Run the script
createAboutPage();

