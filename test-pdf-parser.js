// Test script for PDF parser
import * as fs from 'fs';
import * as path from 'path';
import { parsePdfFile } from './utils/documentParser';

async function testPdfParser() {
  try {
    // Path to the PDF file
    const pdfPath = '/Users/dom12/Desktop/biomedicines-10-02887.pdf';
    
    // Create a File object from the PDF
    const fileBuffer = fs.readFileSync(pdfPath);
    const file = new File([fileBuffer], 'biomedicines-10-02887.pdf', { type: 'application/pdf' });
    
    console.log('Starting PDF parsing...');
    const result = await parsePdfFile(file);
    
    console.log('PDF Parsing Result:');
    console.log('Title:', result.title);
    console.log('Abstract:', result.abstract?.substring(0, 150) + '...');
    console.log('Keywords:', result.keywords);
    
    if (result.warnings && result.warnings.length > 0) {
      console.log('\nWarnings:');
      result.warnings.forEach(warning => console.log('- ' + warning));
    }
    
    // Save the full result to a JSON file for inspection
    fs.writeFileSync(
      path.join(process.cwd(), 'pdf-parse-result.json'),
      JSON.stringify(result, null, 2)
    );
    console.log('\nFull result saved to pdf-parse-result.json');
    
  } catch (error) {
    console.error('Error testing PDF parser:', error);
  }
}

// Run the test
testPdfParser();
