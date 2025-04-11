import { db } from '../firebase/admin';
import fs from 'fs/promises';
import path from 'path';
import { createLogger } from '../utils/logger';

const logger = createLogger('update-plagiarism-corpus');

const config = {
  corpusDir: process.env.CORPUS_DIR || path.join(process.cwd(), 'services/plagiarism-detection/data/corpus'),
  batchSize: parseInt(process.env.CORPUS_UPDATE_BATCH_SIZE || '100')
};

/**
 * Updates the plagiarism detection corpus with published articles
 * Implements batching for efficiency with large article collections
 */
async function updateCorpus() {
  try {
    logger.info('Starting corpus update...');
    
    // Create corpus directory if it doesn't exist
    await fs.mkdir(config.corpusDir, { recursive: true });
    
    // Get existing corpus files
    const existingFiles = await fs.readdir(config.corpusDir);
    const existingIds = new Set(
      existingFiles
        .filter(file => file.endsWith('.txt'))
        .map(file => file.replace('.txt', ''))
    );
    
    logger.info(`Found ${existingIds.size} existing articles in corpus`);
    
    // Get all published articles that aren't in the corpus yet
    let articlesProcessed = 0;
    let lastDocId: string | undefined;
    let added = 0;
    
    // Process in batches to handle large collections
    while (true) {
      let query = db.collection('articles')
        .where('status', '==', 'published')
        .limit(config.batchSize);
        
      if (lastDocId) {
        const lastDoc = await db.collection('articles').doc(lastDocId).get();
        query = query.startAfter(lastDoc);
      }
      
      const articlesSnapshot = await query.get();
      
      if (articlesSnapshot.empty) {
        break; // No more articles to process
      }
      
      // Process this batch
      const promises: Promise<void>[] = [];
      
      articlesSnapshot.forEach(doc => {
        const articleId = doc.id;
        lastDocId = articleId; // For pagination
        
        // Skip if already in corpus
        if (existingIds.has(articleId)) {
          return;
        }
        
        const article = doc.data();
        const content = article.content || '';
        
        if (content.trim()) {
          const promise = fs.writeFile(
            path.join(config.corpusDir, `${articleId}.txt`),
            content
          ).then(() => {
            added++;
          });
          
          promises.push(promise);
        }
      });
      
      await Promise.all(promises);
      articlesProcessed += articlesSnapshot.size;
      logger.info(`Processed ${articlesProcessed} articles so far, added ${added} to corpus`);
    }
    
    logger.info(`Added ${added} new articles to corpus`);
    
    // Update last corpus update timestamp
    await db.collection('system').doc('plagiarism').set({
      lastCorpusUpdate: new Date(),
      corpusSize: existingIds.size + added
    });
    
    logger.info('Corpus update completed successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error updating corpus', { context: { error: errorMessage } });
    process.exit(1);
  }
}

updateCorpus()
  .then(() => process.exit(0))
  .catch(err => {
    logger.error('Unhandled error in corpus update', { context: { error: err.message } });
    process.exit(1);
  });
