/**
 * Core document types for the document parsing system
 */

/**
 * Raw document data before parsing
 */
export interface RawDocument {
  /** Raw binary data */
  bytes: ArrayBuffer;
  /** MIME type of the document */
  mimeType: string;
  /** Original file name */
  fileName: string;
  /** Optional metadata extracted during initial processing */
  metadata?: Record<string, string>;
}

/**
 * Document with extracted sections
 */
export interface StructuredDocument {
  /** Document title */
  title?: string;
  /** Document abstract */
  abstract?: string;
  /** Document keywords */
  keywords?: string[];
  /** Introduction section */
  introduction?: string;
  /** Literature review section */
  literatureReview?: string;
  /** Methods section */
  methods?: string;
  /** Results section */
  results?: string;
  /** Discussion section */
  discussion?: string;
  /** Conclusion section */
  conclusion?: string;
  /** Acknowledgments section */
  acknowledgments?: string;
  /** Declaration sections (ethics, conflicts, funding) */
  declarations?: {
    ethics?: string;
    conflictOfInterest?: string;
    funding?: string;
  };
  /** Extracted references */
  references?: string[];
  /** Additional appendices */
  appendices?: string;
  /** Supplementary materials */
  supplementaryMaterial?: string;
  /** Full document content (if section extraction fails) */
  content?: string;
  /** Any error encountered during parsing */
  error?: string;
  /** Any warnings encountered during parsing */
  warnings?: string[];
}

/**
 * Document that has been enhanced with AI processing
 */
export interface EnhancedDocument extends StructuredDocument {
  /** Additional AI-generated summary */
  summary?: string;
  /** AI-enhanced keywords */
  enhancedKeywords?: string[];
  /** AI-identified research questions */
  researchQuestions?: string[];
  /** Indication that AI enhancement was applied */
  aiEnhanced: boolean;
}

/**
 * Options for document parsing
 */
export interface ParserOptions {
  /** Whether to enhance the document with AI */
  enhanceWithAI?: boolean;
  /** Additional parser-specific options */
  [key: string]: any;
}
