/**
 * Local test script for upload API
 * Tests file upload with FormData (simulating React Native)
 */

const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

async function testUpload() {
  console.log('🧪 Testing Upload API Locally\n');
  console.log('================================\n');

  // Create test files
  const testDir = path.join(__dirname, 'test-files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }

  // Create dummy PDF file
  const pdfPath = path.join(testDir, 'test.pdf');
  const pdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF');
  fs.writeFileSync(pdfPath, pdfContent);
  console.log('✅ Created test PDF:', pdfPath);

  // Create dummy image file
  const imagePath = path.join(testDir, 'test.jpg');
  // Create a minimal JPEG header (not a real image, but enough for testing)
  const jpegHeader = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
    0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
    0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
    0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
    0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
    0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
    0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x3F, 0xFF, 0xD9
  ]);
  fs.writeFileSync(imagePath, jpegHeader);
  console.log('✅ Created test image:', imagePath);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://admin-orcin-omega.vercel.app';
  const testAuthorId = 'test-author-123';
  
  console.log('🌐 Testing against:', baseUrl);

  // Test 1: Upload PDF
  console.log('\n📄 Test 1: Uploading PDF...');
  try {
    const pdfFormData = new FormData();
    pdfFormData.append('file', fs.createReadStream(pdfPath), {
      filename: 'test.pdf',
      contentType: 'application/pdf',
    });
    pdfFormData.append('fileName', 'test.pdf');
    pdfFormData.append('fileType', 'application/pdf');
    pdfFormData.append('bucket', 'books');
    pdfFormData.append('folder', 'pdfs');
    pdfFormData.append('author_id', testAuthorId);

    const pdfResponse = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: pdfFormData,
      headers: pdfFormData.getHeaders(),
    });

    const pdfResult = await pdfResponse.text();
    console.log('PDF Upload Status:', pdfResponse.status);
    console.log('PDF Upload Response:', pdfResult.substring(0, 500));
    
    if (pdfResponse.ok) {
      const pdfJson = JSON.parse(pdfResult);
      console.log('✅ PDF Upload Success!');
      console.log('   URL:', pdfJson.url);
      console.log('   Path:', pdfJson.path);
    } else {
      console.log('❌ PDF Upload Failed');
    }
  } catch (error) {
    console.error('❌ PDF Upload Error:', error.message);
  }

  // Test 2: Upload Image using test-upload API
  console.log('\n🖼️  Test 2: Uploading Image via /api/test-upload...');
  try {
    const imageFormData = new FormData();
    imageFormData.append('file', fs.createReadStream(imagePath), {
      filename: 'test.jpg',
      contentType: 'image/jpeg',
    });
    imageFormData.append('fileType', 'image/jpeg');

    const imageResponse = await fetch(`${baseUrl}/api/test-upload`, {
      method: 'POST',
      body: imageFormData,
      headers: imageFormData.getHeaders(),
    });

    const imageResult = await imageResponse.text();
    console.log('Image Upload Status:', imageResponse.status);
    console.log('Image Upload Response:', imageResult.substring(0, 500));
    
    if (imageResponse.ok) {
      const imageJson = JSON.parse(imageResult);
      console.log('✅ Image Upload Success!');
      console.log('   URL:', imageJson.url);
      console.log('   Path:', imageJson.upload?.path);
      console.log('   Size:', imageJson.file?.size, 'bytes');
    } else {
      console.log('❌ Image Upload Failed');
      try {
        const errorJson = JSON.parse(imageResult);
        console.log('   Error:', errorJson.error);
      } catch (e) {
        console.log('   Raw error:', imageResult);
      }
    }
  } catch (error) {
    console.error('❌ Image Upload Error:', error.message);
  }
  
  // Test 2b: Upload Image using original upload API
  console.log('\n🖼️  Test 2b: Uploading Image via /api/upload (original)...');
  try {
    const imageFormData = new FormData();
    imageFormData.append('file', fs.createReadStream(imagePath), {
      filename: 'test.jpg',
      contentType: 'image/jpeg',
    });
    imageFormData.append('fileName', 'test.jpg');
    imageFormData.append('fileType', 'image/jpeg');
    imageFormData.append('bucket', 'books');
    imageFormData.append('folder', 'covers');
    imageFormData.append('author_id', testAuthorId);

    const imageResponse = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: imageFormData,
      headers: imageFormData.getHeaders(),
    });

    const imageResult = await imageResponse.text();
    console.log('Image Upload Status:', imageResponse.status);
    console.log('Image Upload Response:', imageResult.substring(0, 500));
    
    if (imageResponse.ok) {
      const imageJson = JSON.parse(imageResult);
      console.log('✅ Image Upload Success!');
      console.log('   URL:', imageJson.url);
      console.log('   Path:', imageJson.path);
    } else {
      console.log('❌ Image Upload Failed');
      try {
        const errorJson = JSON.parse(imageResult);
        console.log('   Error:', errorJson.error);
      } catch (e) {
        console.log('   Raw error:', imageResult);
      }
    }
  } catch (error) {
    console.error('❌ Image Upload Error:', error.message);
  }

  console.log('\n✅ Test Complete!');
}

// Run test
testUpload().catch(console.error);
