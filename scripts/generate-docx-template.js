const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const officegen = require('officegen');

// Create a new DOCX document
const docx = officegen('docx');

// Set document properties
docx.setDocSubject('DecentraJournal Standardized Template');
docx.setDocKeywords('research, academic, journal, template');
docx.setDescription('Standardized article template for DecentraJournal submissions');

// Create the document content
const pObj = docx.createP();
pObj.addText('Title', { bold: true, font_size: 16 });
pObj.addLineBreak();
pObj.addText('[Enter your title here - approximately 15 words, maximum 120 characters]', { italic: true });

// Abstract
docx.createP().addText('Abstract', { bold: true, font_size: 14 });
const abstractP = docx.createP();
abstractP.addText('[150-350 words]', { italic: true });
abstractP.addLineBreak();
abstractP.addText('Enter your abstract here. The abstract should provide a concise summary of your research, including the purpose, methods, key findings, and conclusions.');

// Keywords
docx.createP().addText('Keywords', { bold: true, font_size: 14 });
docx.createP().addText('[4-8 keywords separated by commas]', { italic: true });

// Introduction
docx.createP().addText('Introduction', { bold: true, font_size: 14 });
const introP = docx.createP();
introP.addText('[400-750 words]', { italic: true });
introP.addLineBreak();
introP.addText('Enter your introduction here. The introduction should provide background information, establish the context of your research, identify the research problem or question, and outline the purpose and significance of your study.');

// Literature Review
docx.createP().addText('Literature Review/Background (optional)', { bold: true, font_size: 14 });
const litP = docx.createP();
litP.addText('[500-1,500 words]', { italic: true });
litP.addLineBreak();
litP.addText('Enter your literature review or background information here. This section should synthesize and critically analyze relevant previous research, identify gaps in the literature, and explain how your study addresses these gaps.');

// Methods
docx.createP().addText('Methods', { bold: true, font_size: 14 });
const methodsP = docx.createP();
methodsP.addText('[700-2,000 words]', { italic: true });
methodsP.addLineBreak();
methodsP.addText('Enter your methods here. The methods section should describe in detail how the research was conducted, including research design, participants, materials, procedures, and data analysis techniques.');

// Results
docx.createP().addText('Results', { bold: true, font_size: 14 });
const resultsP = docx.createP();
resultsP.addText('[500-1,500 words]', { italic: true });
resultsP.addLineBreak();
resultsP.addText('Enter your results here. The results section should present the findings of your research without interpretation, using clear and concise language, tables, and figures as appropriate.');

// Discussion
docx.createP().addText('Discussion', { bold: true, font_size: 14 });
const discussionP = docx.createP();
discussionP.addText('[1,000-2,500 words]', { italic: true });
discussionP.addLineBreak();
discussionP.addText('Enter your discussion here. The discussion section should interpret your results, explain their significance, relate them to previous research, acknowledge limitations, and suggest implications and directions for future research.');

// Conclusion
docx.createP().addText('Conclusion (optional)', { bold: true, font_size: 14 });
const conclusionP = docx.createP();
conclusionP.addText('[100-400 words]', { italic: true });
conclusionP.addLineBreak();
conclusionP.addText('Enter your conclusion here. The conclusion should summarize the key findings and their implications, and emphasize the contribution of your research to the field.');

// Acknowledgments
docx.createP().addText('Acknowledgments (optional)', { bold: true, font_size: 14 });
const ackP = docx.createP();
ackP.addText('[50-200 words]', { italic: true });
ackP.addLineBreak();
ackP.addText('Enter your acknowledgments here. Acknowledge individuals, organizations, or funding sources that contributed to your research.');

// Declarations
docx.createP().addText('Declarations', { bold: true, font_size: 14 });
docx.createP().addText('[50-200 words total]', { italic: true });

// Ethics
docx.createP().addText('Ethics', { bold: true, font_size: 12 });
docx.createP().addText('"All ethical guidelines have been followed, and necessary ethical approvals were obtained for this research. Relevant ethical approval numbers and approving bodies are noted within the article where applicable."');

// Conflict of Interest
docx.createP().addText('Conflict of Interest', { bold: true, font_size: 12 });
docx.createP().addText('"The authors declare no conflicts of interest associated with this research."');

// Funding
docx.createP().addText('Funding', { bold: true, font_size: 12 });
docx.createP().addText('"This research received no specific external funding. Any funding received or supporting institutions are acknowledged within the article."');

// References
docx.createP().addText('References', { bold: true, font_size: 14 });
const refsP = docx.createP();
refsP.addText('[30-50 references]', { italic: true });
refsP.addLineBreak();
refsP.addText('Use IEEE numeric reference format. Examples:');
refsP.addLineBreak();
refsP.addLineBreak();
refsP.addText('[1] J. A. Smith and M. Doe, "Title of the article," Journal Name, vol. 12, no. 3, pp. 45–67, 2023. doi: xx.xxx/yyyyy.');
refsP.addLineBreak();
refsP.addLineBreak();
refsP.addText('[2] A. Johnson, Book Title: Subtitle. City, State, Country: Publisher, Year, pp. 15–37.');
refsP.addLineBreak();
refsP.addLineBreak();
refsP.addText('[3] L. Brown, "Conference Paper Title," in Proceedings of the Conference Name, City, Country, Year, pp. 12–17. doi: zz.zzz/xxxxx.');
refsP.addLineBreak();
refsP.addLineBreak();
refsP.addText('[Add your references here, numbered sequentially in the order they appear in your text]');

// Appendices
docx.createP().addText('Appendices (optional)', { bold: true, font_size: 14 });
const appendicesP = docx.createP();
appendicesP.addText('[100-2,500 words]', { italic: true });
appendicesP.addLineBreak();
appendicesP.addText('Enter any supplementary details here.');

// Supplementary Material
docx.createP().addText('Supplementary Material (optional)', { bold: true, font_size: 14 });
const suppP = docx.createP();
suppP.addText('[100-2,500 words]', { italic: true });
suppP.addLineBreak();
suppP.addText('Describe any external files or datasets here.');

// Output file path
const outputPath = path.join(__dirname, '../public/templates/standardized-article-template.docx');

// Create output stream
const out = fs.createWriteStream(outputPath);

// Generate the document
docx.generate(out);

console.log(`DOCX template generated at: ${outputPath}`);
