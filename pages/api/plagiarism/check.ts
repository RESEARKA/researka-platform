import { NextApiRequest, NextApiResponse } from 'next';
import { execFile } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../../../middleware/auth';
import { PlagiarismService, PlagiarismResult } from '../../../services/plagiarism/plagiarismService';
import { db } from '../../../firebase/admin';
import { createLogger } from '../../../utils/logger';

const logger = createLogger('api-plagiarism-check');

// Load configuration from environment variables
const config = {
  maxTextLength: parseInt(process.env.MAX_TEXT_LENGTH || '50000'),
  timeoutMs: parseInt(process.env.PLAGIARISM_CHECK_TIMEOUT_MS || '60000'),
  tempDir: process.env.TEMP_DIR || path.join(process.cwd(), 'temp'),
  resultsDir: process.env.RESULTS_DIR || path.join(process.cwd(), 'results')
};

export default authMiddleware(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let tempFilePath: string | null = null;

  try {
    const { text, articleId } = req.body;
    
    // Validate input
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Valid text is required' });
    }
    
    if (!articleId || typeof articleId !== 'string') {
      return res.status(400).json({ error: 'Valid articleId is required' });
    }
    
    // Check text length
    if (text.length > config.maxTextLength) {
      return res.status(400).json({ 
        error: `Text exceeds maximum length of ${config.maxTextLength} characters` 
      });
    }
    
    // Create temp directory if it doesn't exist
    await fs.mkdir(config.tempDir, { recursive: true });
    
    // Create a temporary file with the text
    const sessionId = uuidv4();
    tempFilePath = path.join(config.tempDir, `${sessionId}.txt`);
    await fs.writeFile(tempFilePath, text);
    
    logger.info('Starting plagiarism check', {
      context: { articleId, sessionId, textLength: text.length }
    });
    
    // Use the plagiarism service to check for plagiarism
    const plagiarismService = new PlagiarismService();
    const results = await plagiarismService.checkPlagiarism(tempFilePath, sessionId);
    
    // Store results in database
    await storeResults(articleId, results);
    
    logger.info('Plagiarism check completed', {
      context: { 
        articleId, 
        sessionId, 
        similarity: results.overallSimilarity,
        matchCount: results.matches.length
      }
    });
    
    return res.status(200).json({ results });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Plagiarism check failed', {
      context: { error: errorMessage }
    });
    return res.status(500).json({ error: 'Plagiarism check failed' });
  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      await fs.unlink(tempFilePath).catch(err => {
        logger.warn('Failed to delete temporary file', {
          context: { error: err.message, path: tempFilePath }
        });
      });
    }
  }
});

/**
 * Stores plagiarism check results in the database
 * @param articleId ID of the article being checked
 * @param results Plagiarism check results
 */
async function storeResults(articleId: string, results: PlagiarismResult): Promise<void> {
  try {
    await db.collection('articles').doc(articleId).update({
      plagiarismChecks: {
        lastChecked: new Date(),
        overallSimilarity: results.overallSimilarity,
        matches: results.matches,
        status: determineStatus(results.overallSimilarity)
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to store plagiarism results', {
      context: { articleId, error: errorMessage }
    });
    throw new Error('Failed to store plagiarism results');
  }
}

/**
 * Determines the plagiarism status based on similarity percentage
 * @param similarity The overall similarity percentage (0-100)
 * @returns Status string indicating plagiarism level
 */
function determineStatus(similarity: number): 'clean' | 'suspicious' | 'plagiarized' {
  if (similarity < 10) return 'clean';
  if (similarity < 30) return 'suspicious';
  return 'plagiarized';
}
