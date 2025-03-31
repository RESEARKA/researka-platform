const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

// Load service account key from your Firebase SDK config
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('Service account key not found at:', serviceAccountPath);
  console.error('Please ensure your Firebase service account key is placed at this location.');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

// Initialize the app with admin privileges
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// The article ID to update
const articleId = '3y9AZG3bwSqZeExaBdr4';

// Update the article
async function updateArticle() {
  try {
    const articleRef = db.collection('articles').doc(articleId);
    
    await articleRef.update({
      status: 'published',
      reviewCount: 2
    });
    
    console.log(`✅ Successfully updated article ${articleId}`);
    console.log('  - status: "published"');
    console.log('  - reviewCount: 2');
    console.log('\nThe article should now appear on the /articles page.');
  } catch (error) {
    console.error('❌ Error updating article:', error);
  }
}

// Run the update
updateArticle().catch(console.error);
