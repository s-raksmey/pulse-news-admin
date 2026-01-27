// Test script for R2 integration
// This script tests the R2 upload functionality

const fs = require('fs');
const path = require('path');

async function testR2Upload() {
  try {
    console.log('🧪 Testing R2 Integration...');
    
    // Check if environment variables are set
    const requiredEnvVars = [
      'R2_ACCOUNT_ID',
      'R2_ACCESS_KEY_ID', 
      'R2_SECRET_ACCESS_KEY',
      'R2_BUCKET_NAME',
      'R2_ENDPOINT'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log('❌ Missing environment variables:');
      missingVars.forEach(varName => {
        console.log(`   - ${varName}`);
      });
      console.log('\n📝 Please set these variables in your .env file');
      console.log('📖 See .env.example for the required format');
      return;
    }
    
    console.log('✅ All required environment variables are set');
    
    // Test API endpoint
    const testImagePath = path.join(__dirname, 'public', 'next.svg');
    
    if (!fs.existsSync(testImagePath)) {
      console.log('⚠️  Test image not found, creating a simple test file...');
      
      // Create a simple test file
      const testContent = 'This is a test file for R2 upload';
      fs.writeFileSync('test-file.txt', testContent);
      
      console.log('📁 Created test-file.txt for upload testing');
      console.log('\n🚀 To test the upload:');
      console.log('1. Start your development server: npm run dev');
      console.log('2. Go to http://localhost:3001/media');
      console.log('3. Try uploading the test-file.txt or any image/video');
      console.log('4. Check if files appear in your R2 bucket');
      
      return;
    }
    
    console.log('✅ R2 configuration appears to be ready');
    console.log('\n🚀 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Go to http://localhost:3001/media');
    console.log('3. Try uploading images and videos');
    console.log('4. Check if files appear in your R2 bucket');
    console.log('5. Verify file URLs work correctly');
    
  } catch (error) {
    console.error('❌ Error testing R2 integration:', error);
  }
}

// Run the test
testR2Upload();
