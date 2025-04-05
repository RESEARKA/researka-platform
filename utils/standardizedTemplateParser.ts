import mammoth from 'mammoth';
import { ParsedDocument } from './documentParser';

/**
 * Interface for standardized document sections
 */
interface StandardizedSections {
  title: string;
  abstract: string;
  keywords: string[];
  introduction: string;
  literatureReview?: string;
  methods: string;
  results: string;
  discussion: string;
  conclusion?: string;
  acknowledgments?: string;
  declarations: {
    ethics?: string;
    conflictOfInterest?: string;
    funding?: string;
  };
  references: string[];
  appendices?: string;
  supplementaryMaterial?: string;
}

/**
 * Configuration for the standardized template
 */
const TEMPLATE_CONFIG = {
  sections: {
    title: { label: 'Title', required: true },
    abstract: { label: 'Abstract', required: true, wordLimits: { min: 150, max: 350 } },
    keywords: { label: 'Keywords', required: true, countLimits: { min: 4, max: 8 } },
    introduction: { label: 'Introduction', required: true, wordLimits: { min: 400, max: 750 } },
    literatureReview: { label: 'Literature Review/Background', required: false, wordLimits: { min: 500, max: 1500 } },
    methods: { label: 'Methods', required: true, wordLimits: { min: 700, max: 2000 } },
    results: { label: 'Results', required: true, wordLimits: { min: 500, max: 1500 } },
    discussion: { label: 'Discussion', required: true, wordLimits: { min: 1000, max: 2500 } },
    conclusion: { label: 'Conclusion', required: false, wordLimits: { min: 100, max: 400 } },
    acknowledgments: { label: 'Acknowledgments', required: false, wordLimits: { min: 50, max: 200 } },
    declarations: { 
      label: 'Declarations', 
      required: true,
      subsections: {
        ethics: { label: 'Ethics', required: true },
        conflictOfInterest: { label: 'Conflict of Interest', required: true },
        funding: { label: 'Funding', required: true }
      },
      wordLimits: { min: 50, max: 200 }
    },
    references: { 
      label: 'References', 
      required: true, 
      countLimits: { min: 30, max: 50 },
      format: 'IEEE' // Specify IEEE format as required
    },
    appendices: { label: 'Appendices', required: false, wordLimits: { min: 100, max: 2500 } },
    supplementaryMaterial: { label: 'Supplementary Material', required: false, wordLimits: { min: 100, max: 2500 } }
  },
  referenceFormats: {
    IEEE: {
      description: 'IEEE numeric format',
      examples: [
        '[1] J. A. Smith and M. Doe, "Title of the article," Journal Name, vol. 12, no. 3, pp. 45–67, 2023. doi: xx.xxx/yyyyy.',
        '[2] A. Johnson, Book Title: Subtitle. City, State, Country: Publisher, Year, pp. 15–37.',
        '[3] L. Brown, "Conference Paper Title," in Proceedings of the Conference Name, City, Country, Year, pp. 12–17. doi: zz.zzz/xxxxx.'
      ],
      pattern: /^\[\d+\]\s+.*$/
    }
  }
};

/**
 * Parse a Word document using the standardized template format
 */
export async function parseStandardizedWordTemplate(file: File): Promise<ParsedDocument> {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Use mammoth to extract text
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;
    
    // Split content by lines
    const lines = text.split(/\r?\n/).map(line => line.trim());
    
    // Initialize sections object
    const sections: StandardizedSections = {
      title: '',
      abstract: '',
      keywords: [],
      introduction: '',
      methods: '',
      results: '',
      discussion: '',
      declarations: {}, // Initialize declarations to fix the lint error
      references: []
    };
    
    // Initialize warnings array
    const warnings: string[] = [];
    
    // Parse document sections
    const parsedSections = parseStandardizedSections(lines, warnings);
    
    // Log the extracted sections for debugging
    console.log('Extracted standardized sections:', {
      title: parsedSections.title || 'Not found',
      abstractLength: parsedSections.abstract ? parsedSections.abstract.length : 0,
      keywordsCount: parsedSections.keywords ? parsedSections.keywords.length : 0,
      introductionLength: parsedSections.introduction ? parsedSections.introduction.length : 0,
      methodsLength: parsedSections.methods ? parsedSections.methods.length : 0,
      resultsLength: parsedSections.results ? parsedSections.results.length : 0,
      discussionLength: parsedSections.discussion ? parsedSections.discussion.length : 0,
      referencesCount: parsedSections.references ? parsedSections.references.length : 0
    });
    
    // Return the parsed document
    return {
      title: parsedSections.title,
      abstract: parsedSections.abstract,
      keywords: parsedSections.keywords,
      introduction: parsedSections.introduction,
      methods: parsedSections.methods,
      results: parsedSections.results,
      discussion: parsedSections.discussion,
      conclusion: parsedSections.conclusion,
      acknowledgments: parsedSections.acknowledgments,
      declarations: {
        ethics: parsedSections.declarations?.ethics,
        conflictOfInterest: parsedSections.declarations?.conflictOfInterest,
        funding: parsedSections.declarations?.funding
      },
      references: parsedSections.references,
      appendices: parsedSections.appendices,
      supplementaryMaterial: parsedSections.supplementaryMaterial,
      content: text, // Include full content as fallback
      warnings
    };
  } catch (error) {
    console.error('Error parsing standardized Word template:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error parsing Word template',
      content: 'Failed to extract content from Word document'
    };
  }
}

/**
 * Parse a Markdown document using the standardized template format
 */
export async function parseStandardizedMarkdownTemplate(file: File): Promise<ParsedDocument> {
  try {
    // Read file as text
    const text = await file.text();
    
    // Split content by lines
    const lines = text.split(/\r?\n/).map(line => line.trim());
    
    // Initialize warnings array
    const warnings: string[] = [];
    
    // Parse document sections
    const parsedSections = parseStandardizedSections(lines, warnings);
    
    // Log the extracted sections for debugging
    console.log('Extracted standardized sections from Markdown:', {
      title: parsedSections.title || 'Not found',
      abstractLength: parsedSections.abstract ? parsedSections.abstract.length : 0,
      keywordsCount: parsedSections.keywords ? parsedSections.keywords.length : 0,
      introductionLength: parsedSections.introduction ? parsedSections.introduction.length : 0,
      methodsLength: parsedSections.methods ? parsedSections.methods.length : 0,
      resultsLength: parsedSections.results ? parsedSections.results.length : 0,
      discussionLength: parsedSections.discussion ? parsedSections.discussion.length : 0,
      referencesCount: parsedSections.references ? parsedSections.references.length : 0
    });
    
    // Return the parsed document
    return {
      title: parsedSections.title,
      abstract: parsedSections.abstract,
      keywords: parsedSections.keywords,
      introduction: parsedSections.introduction,
      methods: parsedSections.methods,
      results: parsedSections.results,
      discussion: parsedSections.discussion,
      conclusion: parsedSections.conclusion,
      acknowledgments: parsedSections.acknowledgments,
      declarations: {
        ethics: parsedSections.declarations?.ethics,
        conflictOfInterest: parsedSections.declarations?.conflictOfInterest,
        funding: parsedSections.declarations?.funding
      },
      references: parsedSections.references,
      appendices: parsedSections.appendices,
      supplementaryMaterial: parsedSections.supplementaryMaterial,
      content: text, // Include full content as fallback
      warnings
    };
  } catch (error) {
    console.error('Error parsing standardized Markdown template:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error parsing Markdown template',
      content: 'Failed to extract content from Markdown document'
    };
  }
}

/**
 * Parse sections from a standardized template document
 */
function parseStandardizedSections(lines: string[], warnings: string[]): StandardizedSections {
  // Initialize sections object
  const sections: StandardizedSections = {
    title: '',
    abstract: '',
    keywords: [],
    introduction: '',
    methods: '',
    results: '',
    discussion: '',
    declarations: {}, // Initialize declarations to fix the lint error
    references: []
  };
  
  // Track current section
  let currentSection: keyof StandardizedSections | null = null;
  let currentSubsection: string | null = null;
  let sectionContent: string[] = [];
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines
    if (!line) continue;
    
    // Check for section headers
    if (line.startsWith('#') || line.startsWith('Title') || 
        line.match(/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*\s*$/)) {
      
      // Save content from previous section before moving to new section
      if (currentSection) {
        saveSection(sections, currentSection, currentSubsection, sectionContent, warnings);
        sectionContent = [];
        currentSubsection = null;
      }
      
      // Determine new section
      const sectionHeader = line.replace(/^#+\s*/, '').toLowerCase();
      
      if (sectionHeader.includes('title')) {
        currentSection = 'title';
      } else if (sectionHeader.includes('abstract')) {
        currentSection = 'abstract';
      } else if (sectionHeader.includes('keywords')) {
        currentSection = 'keywords';
      } else if (sectionHeader.includes('introduction')) {
        currentSection = 'introduction';
      } else if (sectionHeader.includes('literature') || sectionHeader.includes('background')) {
        currentSection = 'literatureReview';
      } else if (sectionHeader.includes('method')) {
        currentSection = 'methods';
      } else if (sectionHeader.includes('result')) {
        currentSection = 'results';
      } else if (sectionHeader.includes('discussion')) {
        currentSection = 'discussion';
      } else if (sectionHeader.includes('conclusion')) {
        currentSection = 'conclusion';
      } else if (sectionHeader.includes('acknowledgment')) {
        currentSection = 'acknowledgments';
      } else if (sectionHeader.includes('declaration')) {
        currentSection = 'declarations';
      } else if (sectionHeader.includes('reference')) {
        currentSection = 'references';
      } else if (sectionHeader.includes('appendix') || sectionHeader.includes('appendices')) {
        currentSection = 'appendices';
      } else if (sectionHeader.includes('supplementary')) {
        currentSection = 'supplementaryMaterial';
      } else if (currentSection === 'declarations') {
        // Handle declaration subsections
        if (sectionHeader.includes('ethics')) {
          currentSubsection = 'ethics';
        } else if (sectionHeader.includes('conflict')) {
          currentSubsection = 'conflictOfInterest';
        } else if (sectionHeader.includes('funding')) {
          currentSubsection = 'funding';
        }
      }
      
      continue;
    }
    
    // Add content to current section
    if (currentSection) {
      sectionContent.push(line);
    } else if (i < 5 && !sections.title && line) {
      // If we haven't found a title yet and we're at the beginning of the document,
      // assume this might be the title
      sections.title = line;
    }
  }
  
  // Save the last section
  if (currentSection) {
    saveSection(sections, currentSection, currentSubsection, sectionContent, warnings);
  }
  
  // Validate required sections
  validateRequiredSections(sections, warnings);
  
  return sections;
}

/**
 * Save section content to the appropriate section in the sections object
 */
function saveSection(
  sections: StandardizedSections, 
  section: keyof StandardizedSections, 
  subsection: string | null, 
  content: string[],
  warnings: string[]
): void {
  if (!content.length) return;
  
  const contentText = content.join('\n');
  
  if (section === 'title') {
    sections.title = contentText;
  } else if (section === 'abstract') {
    sections.abstract = contentText;
  } else if (section === 'keywords') {
    // Parse keywords from content
    let keywordsText = contentText;
    
    // Handle various keyword formats
    if (keywordsText.includes(',')) {
      sections.keywords = keywordsText.split(',').map(k => k.trim()).filter(Boolean);
    } else if (keywordsText.includes(';')) {
      sections.keywords = keywordsText.split(';').map(k => k.trim()).filter(Boolean);
    } else {
      // Split by spaces as a fallback
      sections.keywords = keywordsText.split(/\s+/).filter(Boolean);
    }
  } else if (section === 'references') {
    // Process references
    const references: string[] = [];
    let currentRef = '';
    
    for (const line of content) {
      if (!line.trim()) continue;
      
      // Check if this is a new reference entry
      // IEEE format: [n] Author, "Title," etc.
      if (line.match(/^\[\d+\]/) || line.match(/^\d+\./) || 
          line.match(/^[A-Z][a-z]+,/) || 
          (references.length > 0 && line.match(/^[A-Z]/))) {
        
        if (currentRef) {
          references.push(currentRef);
        }
        currentRef = line;
      } else if (currentRef) {
        // Append to current reference
        currentRef += ' ' + line;
      } else {
        currentRef = line;
      }
    }
    
    // Add the last reference
    if (currentRef) {
      references.push(currentRef);
    }
    
    sections.references = references;
    
    // Validate IEEE format
    const ieeePattern = TEMPLATE_CONFIG.referenceFormats.IEEE.pattern;
    const nonCompliantRefs = sections.references.filter(ref => !ieeePattern.test(ref));
    
    if (nonCompliantRefs.length > 0) {
      warnings.push(`Some references do not follow the required IEEE numeric format. Example format: [1] J. A. Smith and M. Doe, "Title of the article," Journal Name, vol. 12, no. 3, pp. 45–67, 2023.`);
    }
  } else if (section === 'declarations' && subsection) {
    // Handle declaration subsections
    if (!sections.declarations) {
      sections.declarations = {};
    }
    
    if (subsection === 'ethics') {
      sections.declarations.ethics = contentText;
    } else if (subsection === 'conflictOfInterest') {
      sections.declarations.conflictOfInterest = contentText;
    } else if (subsection === 'funding') {
      sections.declarations.funding = contentText;
    }
  } else if (section === 'declarations' && !subsection) {
    // If no specific subsection is identified, try to parse the declarations section
    if (!sections.declarations) {
      sections.declarations = {};
    }
    
    // Look for subsection markers in the content
    let ethicsContent: string[] = [];
    let conflictContent: string[] = [];
    let fundingContent: string[] = [];
    let currentDeclarationSection: 'ethics' | 'conflict' | 'funding' | null = null;
    
    for (const line of content) {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('ethics') || lowerLine.includes('ethical')) {
        currentDeclarationSection = 'ethics';
        continue;
      } else if (lowerLine.includes('conflict') || lowerLine.includes('competing')) {
        currentDeclarationSection = 'conflict';
        continue;
      } else if (lowerLine.includes('funding') || lowerLine.includes('financial')) {
        currentDeclarationSection = 'funding';
        continue;
      }
      
      if (currentDeclarationSection === 'ethics') {
        ethicsContent.push(line);
      } else if (currentDeclarationSection === 'conflict') {
        conflictContent.push(line);
      } else if (currentDeclarationSection === 'funding') {
        fundingContent.push(line);
      }
    }
    
    if (ethicsContent.length) {
      sections.declarations.ethics = ethicsContent.join('\n');
    }
    
    if (conflictContent.length) {
      sections.declarations.conflictOfInterest = conflictContent.join('\n');
    }
    
    if (fundingContent.length) {
      sections.declarations.funding = fundingContent.join('\n');
    }
  } else {
    // For all other sections, just save the content text
    (sections as any)[section] = contentText;
  }
}

/**
 * Validate that all required sections are present
 */
function validateRequiredSections(sections: StandardizedSections, warnings: string[]): void {
  // Check each required section
  for (const [key, config] of Object.entries(TEMPLATE_CONFIG.sections)) {
    if (config.required) {
      const section = sections[key as keyof StandardizedSections];
      
      if (!section || (Array.isArray(section) && section.length === 0)) {
        warnings.push(`Required section '${config.label}' is missing or empty.`);
      }
    }
    
    // Check word limits for text sections
    if (config.wordLimits && typeof sections[key as keyof StandardizedSections] === 'string') {
      const content = sections[key as keyof StandardizedSections] as string;
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      
      if (wordCount < config.wordLimits.min) {
        warnings.push(`Section '${config.label}' has ${wordCount} words, which is below the minimum of ${config.wordLimits.min} words.`);
      }
      
      if (wordCount > config.wordLimits.max) {
        warnings.push(`Section '${config.label}' has ${wordCount} words, which exceeds the maximum of ${config.wordLimits.max} words.`);
      }
    }
    
    // Check count limits for array sections
    if (config.countLimits && Array.isArray(sections[key as keyof StandardizedSections])) {
      const array = sections[key as keyof StandardizedSections] as any[];
      
      if (array.length < config.countLimits.min) {
        warnings.push(`Section '${config.label}' has ${array.length} items, which is below the minimum of ${config.countLimits.min}.`);
      }
      
      if (array.length > config.countLimits.max) {
        warnings.push(`Section '${config.label}' has ${array.length} items, which exceeds the maximum of ${config.countLimits.max}.`);
      }
    }
  }
}
