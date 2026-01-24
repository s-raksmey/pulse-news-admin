// Test script to verify article category/topic functionality
// Run this in your browser console or as a Node.js script

const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';
const JWT_TOKEN = 'your-jwt-token-here'; // Replace with your actual token

// Test queries and mutations
const TEST_QUERIES = {
  // Test 1: Get all categories
  getCategories: `
    query GetCategories {
      categories {
        id
        name
        slug
        topics {
          id
          slug
          title
        }
      }
    }
  `,
  
  // Test 2: Get all articles with category/topic
  getArticles: `
    query GetArticles {
      articles(take: 10) {
        id
        title
        slug
        topic
        category {
          id
          name
          slug
        }
      }
    }
  `,
  
  // Test 3: Create test article
  createArticle: `
    mutation CreateTestArticle($input: UpsertArticleInput!) {
      upsertArticle(input: $input) {
        id
        title
        slug
        topic
        category {
          id
          name
          slug
        }
      }
    }
  `
};

// Test data
const TEST_ARTICLE = {
  title: "Test Article - Category/Topic Functionality",
  slug: "test-article-category-topic-" + Date.now(),
  excerpt: "This is a test article to verify category and topic functionality.",
  categorySlug: "tech", // Change this to match your categories
  topic: "artificial-intelligence", // Change this to match your topics
  status: "DRAFT",
  contentJson: {
    time: Date.now(),
    blocks: [
      {
        type: "paragraph",
        data: {
          text: "This is a test article created to verify that category and topic assignment is working correctly."
        }
      }
    ],
    version: "2.x"
  }
};

// Helper function to make GraphQL requests
async function graphqlRequest(query, variables = {}) {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JWT_TOKEN}`
      },
      body: JSON.stringify({
        query,
        variables
      })
    });
    
    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ GraphQL Errors:', result.errors);
      return null;
    }
    
    return result.data;
  } catch (error) {
    console.error('❌ Request Error:', error);
    return null;
  }
}

// Test functions
async function testCategories() {
  console.log('\n🧪 Test 1: Fetching Categories and Topics');
  console.log('=' .repeat(50));
  
  const data = await graphqlRequest(TEST_QUERIES.getCategories);
  
  if (!data || !data.categories) {
    console.log('❌ Failed to fetch categories');
    return false;
  }
  
  console.log(`✅ Found ${data.categories.length} categories:`);
  
  data.categories.forEach(category => {
    console.log(`  📁 ${category.name} (${category.slug})`);
    if (category.topics && category.topics.length > 0) {
      category.topics.forEach(topic => {
        console.log(`    📄 ${topic.title} (${topic.slug})`);
      });
    } else {
      console.log('    ⚠️  No topics found');
    }
  });
  
  return data.categories.length > 0;
}

async function testExistingArticles() {
  console.log('\n🧪 Test 2: Checking Existing Articles');
  console.log('=' .repeat(50));
  
  const data = await graphqlRequest(TEST_QUERIES.getArticles);
  
  if (!data || !data.articles) {
    console.log('❌ Failed to fetch articles');
    return false;
  }
  
  console.log(`✅ Found ${data.articles.length} articles:`);
  
  data.articles.forEach(article => {
    const categoryName = article.category ? article.category.name : '❌ No Category';
    const topic = article.topic || '❌ No Topic';
    
    console.log(`  📰 ${article.title}`);
    console.log(`    📁 Category: ${categoryName}`);
    console.log(`    📄 Topic: ${topic}`);
    console.log(`    🔗 Slug: ${article.slug}`);
    console.log('');
  });
  
  return true;
}

async function testArticleCreation() {
  console.log('\n🧪 Test 3: Creating Test Article');
  console.log('=' .repeat(50));
  
  console.log('📝 Creating article with:');
  console.log(`  Title: ${TEST_ARTICLE.title}`);
  console.log(`  Category: ${TEST_ARTICLE.categorySlug}`);
  console.log(`  Topic: ${TEST_ARTICLE.topic}`);
  
  const data = await graphqlRequest(TEST_QUERIES.createArticle, {
    input: TEST_ARTICLE
  });
  
  if (!data || !data.upsertArticle) {
    console.log('❌ Failed to create article');
    return false;
  }
  
  const article = data.upsertArticle;
  
  console.log('✅ Article created successfully:');
  console.log(`  ID: ${article.id}`);
  console.log(`  Title: ${article.title}`);
  console.log(`  Category: ${article.category ? article.category.name : '❌ Missing'}`);
  console.log(`  Topic: ${article.topic || '❌ Missing'}`);
  
  // Verify category and topic were saved
  const categoryOk = article.category && article.category.slug === TEST_ARTICLE.categorySlug;
  const topicOk = article.topic === TEST_ARTICLE.topic;
  
  if (categoryOk && topicOk) {
    console.log('🎉 Category and topic assignment working correctly!');
    return true;
  } else {
    console.log('⚠️  Issues found:');
    if (!categoryOk) console.log('  ❌ Category not assigned correctly');
    if (!topicOk) console.log('  ❌ Topic not assigned correctly');
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Article Category/Topic Functionality Tests');
  console.log('=' .repeat(60));
  
  // Check if JWT token is set
  if (JWT_TOKEN === 'your-jwt-token-here') {
    console.log('❌ Please set your JWT token in the script');
    console.log('   1. Go to http://localhost:3000');
    console.log('   2. Open Developer Tools (F12)');
    console.log('   3. Go to Application/Storage → localStorage');
    console.log('   4. Copy the token value');
    console.log('   5. Replace JWT_TOKEN in this script');
    return;
  }
  
  const results = {
    categories: false,
    existingArticles: false,
    articleCreation: false
  };
  
  // Run tests
  results.categories = await testCategories();
  results.existingArticles = await testExistingArticles();
  results.articleCreation = await testArticleCreation();
  
  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=' .repeat(50));
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(`Categories Test: ${results.categories ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Existing Articles Test: ${results.existingArticles ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Article Creation Test: ${results.articleCreation ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Article category/topic functionality is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Ensure your database is seeded with categories');
    console.log('2. Check that your GraphQL server is running');
    console.log('3. Verify your JWT token is valid');
    console.log('4. Review the server logs for errors');
  }
}

// Instructions for manual execution
console.log(`
🔧 ARTICLE FUNCTIONALITY TEST INSTRUCTIONS:

1. Open your browser and go to: http://localhost:3000
2. Open Developer Tools (F12)
3. Go to Application/Storage tab and find your JWT token in localStorage
4. Replace 'your-jwt-token-here' in this script with your actual token
5. Copy and paste this entire script into the browser console
6. Run: runAllTests()

OR use these individual test functions:
- testCategories()
- testExistingArticles()
- testArticleCreation()
`);

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    testCategories,
    testExistingArticles,
    testArticleCreation,
    TEST_QUERIES,
    TEST_ARTICLE
  };
}

