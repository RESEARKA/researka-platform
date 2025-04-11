// pages/api/plagiarism/check.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../../../middleware/auth';

export default authMiddleware(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, articleId } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Valid text is required' });
    }
    
    // Create a temporary file with the text
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const sessionId = uuidv4();
    const filePath = path.join(tempDir, `${sessionId}.txt`);
    fs.writeFileSync(filePath, text);
    
    // Call JPlag service
    const command = `docker exec jplag_container java -jar /app/jplag-3.0.0.jar --language text -r /results/${sessionId} /data/${sessionId}.txt /data/corpus`;
    
    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.error(`JPlag error: ${error.message}`);
        return res.status(500).json({ error: 'Plagiarism check failed' });
      }
      
      // Parse results
      const resultsPath = path.join(process.cwd(), 'results', sessionId, 'index.html');
      if (fs.existsSync(resultsPath)) {
        const results = parseJPlagResults(resultsPath);
        
        // Store results in database
        await storeResults(articleId, results);
        
        return res.status(200).json({ results });
      } else {
        return res.status(404).json({ error: 'No results found' });
      }
    });
  } catch (error) {
    console.error('Plagiarism check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

function parseJPlagResults(resultsPath: string): any {
  // Implementation to parse JPlag HTML results
  // This would extract similarity scores and matched sections
}

async function storeResults(articleId: string, results: any): Promise<void> {
  // Store results in your Firestore database
}
