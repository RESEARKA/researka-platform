import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Checkbox,
  FormControl,
  FormHelperText,
  Progress
} from '@chakra-ui/react';
import { FiDownload, FiCheck } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import DocumentUploader from '../components/DocumentUploader';
import logger from '../utils/logger';
import { parseStandardizedWordTemplate, parseStandardizedMarkdownTemplate } from '../utils/standardizedTemplateParser';
import { ParsedDocument } from '../utils/documentParser';
import { ArticlePreview } from '../components/ArticlePreview';
import { SectionEditor } from '../components/SectionEditor';
import { ReferenceFormatGuide } from '../components/ReferenceFormatGuide';
import NavBar from '../components/NavBar';
import PlagiarismReportModal from '../components/PlagiarismReportModal';

// Define the Article interface based on our standardized template
interface Article {
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
  authorName: string;
  authorEmail: string;
  authorAffiliation: string;
  isCorrespondingAuthor: boolean;
  category: string;
  license: string;
}

// Define the template structure for validation and display
const TEMPLATE_STRUCTURE = {
  title: { label: 'Title', required: true, wordLimits: { min: 5, max: 20 } },
  abstract: { label: 'Abstract', required: true, wordLimits: { min: 150, max: 350 } },
  keywords: { label: 'Keywords', required: true, countLimits: { min: 4, max: 8 } },
  introduction: { label: 'Introduction', required: true, wordLimits: { min: 400, max: 750 } },
  literatureReview: { label: 'Literature Review/Background', required: false, wordLimits: { min: 500, max: 1500 } },
  methods: { label: 'Methods', required: true, wordLimits: { min: 700, max: 2000 } },
  results: { label: 'Results', required: true, wordLimits: { min: 500, max: 1500 } },
  discussion: { label: 'Discussion', required: true, wordLimits: { min: 1000, max: 2500 } },
  conclusion: { label: 'Conclusion', required: false, wordLimits: { min: 100, max: 400 } },
  acknowledgments: { label: 'Acknowledgments', required: false, wordLimits: { min: 50, max: 200 } },
  references: { 
    label: 'References', 
    required: true, 
    countLimits: { min: 30, max: 50 },
    format: 'IEEE' // Specify IEEE format as required
  },
  appendices: { label: 'Appendices', required: false, wordLimits: { min: 100, max: 2500 } },
  supplementaryMaterial: { label: 'Supplementary Material', required: false, wordLimits: { min: 100, max: 2500 } }
};

// License options
const LICENSE_OPTIONS = [
  { value: 'cc-by-4.0', label: 'CC BY 4.0 - Attribution' },
  { value: 'cc-by-sa-4.0', label: 'CC BY-SA 4.0 - Attribution-ShareAlike' },
  { value: 'cc-by-nc-4.0', label: 'CC BY-NC 4.0 - Attribution-NonCommercial' },
  { value: 'cc-by-nc-sa-4.0', label: 'CC BY-NC-SA 4.0 - Attribution-NonCommercial-ShareAlike' }
];

// Category options
const CATEGORY_OPTIONS = [
  'Computer Science',
  'Biology',
  'Chemistry',
  'Physics',
  'Mathematics',
  'Medicine',
  'Economics',
  'Psychology',
  'Sociology',
  'Other'
];

/**
 * Standardized Template Submission Page
 */
export default function StandardizedSubmitPage() {
  // Router for navigation
  const router = useRouter();
  
  // Authentication hook
  const { user, loading: authLoading } = useAuth();
  
  // Toast for notifications
  const toast = useToast();
  
  // State for article data
  const [article, setArticle] = useState<Partial<Article>>({
    keywords: [],
    references: [],
    declarations: {},
    license: 'cc-by-4.0',
    category: 'Computer Science',
    isCorrespondingAuthor: true
  });
  
  // State for document parsing
  const [parsedDocument, setParsedDocument] = useState<ParsedDocument | null>(null);
  const [documentWarnings, setDocumentWarnings] = useState<string[]>([]);
  
  // State for UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDocumentUploaded, setIsDocumentUploaded] = useState(false);
  const [currentEditingSection, setCurrentEditingSection] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [plagiarismResults, setPlagiarismResults] = useState<any>(null);
  const [showPlagiarismModal, setShowPlagiarismModal] = useState(false);
  
  // Effect to populate author information from user profile
  useEffect(() => {
    if (user && !authLoading) {
      setArticle(prev => ({
        ...prev,
        authorName: user.displayName || '',
        authorEmail: user.email || '',
        authorAffiliation: user.profile?.affiliation || ''
      }));
    }
  }, [user, authLoading]);
  
  /**
   * Handle document parsing
   */
  const handleDocumentParsed = (parsedDoc: ParsedDocument) => {
    logger.info('Document parsed:', { title: parsedDoc.title });
    
    if (parsedDoc.error) {
      toast({
        title: 'Error parsing document',
        description: parsedDoc.error,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }
    
    // Set parsed document
    setParsedDocument(parsedDoc);
    
    // Set document warnings
    setDocumentWarnings(parsedDoc.warnings || []);
    
    // Update article state with parsed content
    setArticle(prev => ({
      ...prev,
      title: parsedDoc.title || prev.title || '',
      abstract: parsedDoc.abstract || prev.abstract || '',
      keywords: parsedDoc.keywords || prev.keywords || [],
      introduction: parsedDoc.introduction || prev.introduction || '',
      literatureReview: parsedDoc.literatureReview || prev.literatureReview || '',
      methods: parsedDoc.methods || prev.methods || '',
      results: parsedDoc.results || prev.results || '',
      discussion: parsedDoc.discussion || prev.discussion || '',
      conclusion: parsedDoc.conclusion || prev.conclusion || '',
      acknowledgments: parsedDoc.acknowledgments || prev.acknowledgments || '',
      declarations: {
        ...prev.declarations,
        ethics: parsedDoc.declarations?.ethics || prev.declarations?.ethics || '',
        conflictOfInterest: parsedDoc.declarations?.conflictOfInterest || prev.declarations?.conflictOfInterest || '',
        funding: parsedDoc.declarations?.funding || prev.declarations?.funding || ''
      },
      references: parsedDoc.references || prev.references || []
    }));
    
    setIsDocumentUploaded(true);
    
    toast({
      title: 'Document uploaded successfully',
      description: 'Your document has been parsed and is ready for review.',
      status: 'success',
      duration: 5000,
      isClosable: true
    });
  };
  
  /**
   * Handle file selection
   */
  const handleFileSelect = async (file: File) => {
    try {
      let parsedDoc: ParsedDocument;
      
      // Parse based on file type
      if (file.name.endsWith('.docx')) {
        parsedDoc = await parseStandardizedWordTemplate(file);
      } else if (file.name.endsWith('.md')) {
        parsedDoc = await parseStandardizedMarkdownTemplate(file);
      } else {
        toast({
          title: 'Unsupported file format',
          description: 'Please upload a DOCX or Markdown file using our standardized template.',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
        return;
      }
      
      handleDocumentParsed(parsedDoc);
    } catch (error) {
      logger.error('Error handling file selection:', error);
      toast({
        title: 'Error processing document',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };
  
  /**
   * Handle section edit
   */
  const handleSectionEdit = (section: string) => {
    setCurrentEditingSection(section);
  };
  
  /**
   * Handle section save
   */
  const handleSectionSave = (section: string, content: string) => {
    setArticle(prev => {
      if (section.includes('.')) {
        // Handle nested properties like declarations.ethics
        const [parent, child] = section.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof Article],
            [child]: content
          }
        };
      } else {
        // Handle regular properties
        return {
          ...prev,
          [section]: content
        };
      }
    });
    
    setCurrentEditingSection(null);
    
    toast({
      title: 'Section updated',
      description: `The ${section} section has been updated.`,
      status: 'success',
      duration: 3000,
      isClosable: true
    });
  };
  
  /**
   * Validate the article before submission
   */
  const validateArticle = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate required fields
    for (const [key, config] of Object.entries(TEMPLATE_STRUCTURE)) {
      if (config.required) {
        const value = article[key as keyof Article];
        
        if (!value || (Array.isArray(value) && value.length === 0)) {
          errors[key] = `${config.label} is required`;
        }
      }
      
      // Validate word limits for text fields
      if (config.wordLimits && typeof article[key as keyof Article] === 'string') {
        const content = article[key as keyof Article] as string;
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        
        if (wordCount < config.wordLimits.min) {
          errors[key] = `${config.label} should have at least ${config.wordLimits.min} words (currently ${wordCount})`;
        }
        
        if (wordCount > config.wordLimits.max) {
          errors[key] = `${config.label} should have at most ${config.wordLimits.max} words (currently ${wordCount})`;
        }
      }
      
      // Validate count limits for array fields
      if (config.countLimits && Array.isArray(article[key as keyof Article])) {
        const array = article[key as keyof Article] as any[];
        
        if (array.length < config.countLimits.min) {
          errors[key] = `${config.label} should have at least ${config.countLimits.min} items (currently ${array.length})`;
        }
        
        if (array.length > config.countLimits.max) {
          errors[key] = `${config.label} should have at most ${config.countLimits.max} items (currently ${array.length})`;
        }
      }
    }
    
    // Validate author information
    if (!article.authorName) {
      errors.authorName = 'Author name is required';
    }
    
    if (!article.authorEmail) {
      errors.authorEmail = 'Author email is required';
    }
    
    if (!article.authorAffiliation) {
      errors.authorAffiliation = 'Author affiliation is required';
    }
    
    // Validate terms acceptance
    if (!acceptedTerms) {
      errors.terms = 'You must accept the terms and conditions';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  /**
   * Handle article submission
   */
  const handleSubmit = async () => {
    try {
      // Validate the article
      if (!validateArticle()) {
        toast({
          title: 'Validation Error',
          description: 'Please fix the errors before submitting.',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
        return;
      }
      
      setIsSubmitting(true);
      
      // Run plagiarism check before submission
      setSubmissionStatus('Checking for plagiarism...');
      
      // Combine all text content for plagiarism check
      const fullContent = [
        article.title,
        article.abstract,
        article.introduction,
        article.literatureReview,
        article.methods,
        article.results,
        article.discussion,
        article.conclusion,
        article.acknowledgments
      ].filter(Boolean).join('\n\n');
      
      try {
        const plagiarismResponse = await fetch('/api/plagiarism/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await user?.getIdToken()}`
          },
          body: JSON.stringify({
            text: fullContent,
            articleId: 'temp-' + Date.now() // Temporary ID for checking
          })
        });
        
        if (!plagiarismResponse.ok) {
          throw new Error('Plagiarism check failed');
        }
        
        const plagiarismData = await plagiarismResponse.json();
        
        // Check if plagiarism was detected
        if (plagiarismData.results.overallSimilarity > 30) {
          // High similarity - reject submission
          setIsSubmitting(false);
          setSubmissionStatus('');
          
          toast({
            title: 'Plagiarism Detected',
            description: `Your submission contains ${plagiarismData.results.overallSimilarity.toFixed(1)}% similarity with existing content. Please revise your article.`,
            status: 'error',
            duration: 10000,
            isClosable: true
          });
          
          // Show plagiarism details
          setPlagiarismResults(plagiarismData.results);
          setShowPlagiarismModal(true);
          return;
        } else if (plagiarismData.results.overallSimilarity > 10) {
          // Moderate similarity - warn but allow
          toast({
            title: 'Potential Similarity Detected',
            description: `Your submission contains ${plagiarismData.results.overallSimilarity.toFixed(1)}% similarity with existing content. You may proceed, but consider reviewing the highlighted sections.`,
            status: 'warning',
            duration: 10000,
            isClosable: true
          });
          
          // Show plagiarism details
          setPlagiarismResults(plagiarismData.results);
          setShowPlagiarismModal(true);
        } else {
          // Low similarity - proceed normally
          toast({
            title: 'Plagiarism Check Passed',
            description: 'Your submission passed the plagiarism check.',
            status: 'success',
            duration: 3000,
            isClosable: true
          });
        }
      } catch (error) {
        logger.error('Plagiarism check error:', error);
        toast({
          title: 'Plagiarism Check Error',
          description: 'Could not complete plagiarism check. Proceeding with submission.',
          status: 'warning',
          duration: 5000,
          isClosable: true
        });
      }
      
      // Proceed with submission
      setSubmissionStatus('Submitting article...');
      
      // TODO: Implement actual submission logic here
      // This would typically involve an API call to your backend
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Article submitted successfully',
        description: 'Your article has been submitted for review.',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      
      // Redirect to dashboard or confirmation page
      router.push('/dashboard');
    } catch (error) {
      logger.error('Error submitting article:', error);
      toast({
        title: 'Error submitting article',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsSubmitting(false);
      setSubmissionStatus('');
    }
  };
  
  // Render template download section
  const renderTemplateDownload = () => (
    <Box p={6} borderWidth={1} borderRadius="md" bg="white" shadow="sm">
      <Heading size="md" mb={4}>Step 1: Download Template</Heading>
      <Text mb={4}>
        Please download our standardized article template in your preferred format.
        Fill out all required sections following the guidelines provided in the template.
      </Text>
      <HStack spacing={4}>
        <Button 
          leftIcon={<FiDownload />} 
          colorScheme="blue" 
          onClick={() => window.open('/templates/standardized-article-template.docx')}
        >
          Download DOCX Template
        </Button>
        <Button 
          leftIcon={<FiDownload />} 
          colorScheme="teal" 
          onClick={() => window.open('/templates/standardized-article-template.md')}
        >
          Download Markdown Template
        </Button>
      </HStack>
    </Box>
  );
  
  // Render document upload section
  const renderDocumentUpload = () => (
    <Box p={6} borderWidth={1} borderRadius="md" bg="white" shadow="sm">
      <Heading size="md" mb={4}>Step 2: Upload Your Document</Heading>
      <Text mb={4}>
        Upload your completed document in DOCX or Markdown format.
        The system will automatically extract and display the content for your review.
      </Text>
      <ReferenceFormatGuide />
      <DocumentUploader 
        onFileSelect={handleFileSelect}
        acceptedFileTypes=".docx,.md"
        maxFileSizeMB={10}
        useStandardizedTemplate={true}
        onDocumentParsed={handleDocumentParsed}
      />
      {documentWarnings.length > 0 && (
        <Alert status="warning" mt={4}>
          <AlertIcon />
          <Box>
            <AlertTitle>Document Warnings</AlertTitle>
            <AlertDescription>
              <VStack align="start" spacing={1} mt={2}>
                {documentWarnings.map((warning, index) => (
                  <Text key={index}>{warning}</Text>
                ))}
              </VStack>
            </AlertDescription>
          </Box>
        </Alert>
      )}
    </Box>
  );
  
  // Render article preview and editing section
  const renderArticlePreview = () => (
    <Box p={6} borderWidth={1} borderRadius="md" bg="white" shadow="sm">
      <Heading size="md" mb={4}>Step 3: Review and Edit Your Article</Heading>
      <Text mb={4}>
        Review your article content below. Click the edit button next to any section to make changes.
      </Text>
      
      {/* Article Preview Component would be implemented separately */}
      {currentEditingSection ? (
        <SectionEditor 
          section={currentEditingSection}
          content={
            currentEditingSection.includes('.') 
              ? article[currentEditingSection.split('.')[0] as keyof Article]?.[currentEditingSection.split('.')[1]]
              : article[currentEditingSection as keyof Article]
          }
          onSave={handleSectionSave}
          onCancel={() => setCurrentEditingSection(null)}
        />
      ) : (
        <ArticlePreview 
          article={article as Article}
          onSectionEdit={handleSectionEdit}
          validationErrors={validationErrors}
        />
      )}
    </Box>
  );
  
  // Render submission section
  const renderSubmission = () => (
    <Box p={6} borderWidth={1} borderRadius="md" bg="white" shadow="sm">
      <Heading size="md" mb={4}>Step 4: Submit Article</Heading>
      
      <Text mb={4}>
        Please review your article before submission. Once submitted, your article will be checked for plagiarism and then reviewed by our editorial team.
      </Text>
      
      <FormControl mb={4}>
        <Checkbox 
          isChecked={acceptedTerms} 
          onChange={(e) => setAcceptedTerms(e.target.checked)}
        >
          I accept the terms and conditions and confirm this is my original work
        </Checkbox>
        {validationErrors.terms && (
          <FormHelperText color="red.500">{validationErrors.terms}</FormHelperText>
        )}
      </FormControl>
      
      <Button
        colorScheme="blue"
        size="lg"
        rightIcon={<FiCheck />}
        onClick={handleSubmit}
        isLoading={isSubmitting}
        loadingText={submissionStatus || "Submitting..."}
        isDisabled={!acceptedTerms}
      >
        Submit Article
      </Button>
      {submissionStatus && (
        <Box mt={4}>
          <Text mb={2}>{submissionStatus}</Text>
          <Progress value={50} isIndeterminate />
        </Box>
      )}
    </Box>
  );
  
  // Main render
  return (
    <>
      <NavBar activePage="submit-standardized" />
      <Container maxW="container.xl" py={8}>
        <Heading as="h1" size="xl" mb={2}>Submit Your Article</Heading>
        <Text mb={8} color="gray.600">
          Use our standardized template to submit your article for publication.
        </Text>
        
        <VStack spacing={8} align="stretch">
          {renderTemplateDownload()}
          {renderDocumentUpload()}
          {isDocumentUploaded && renderArticlePreview()}
          {isDocumentUploaded && renderSubmission()}
          <PlagiarismReportModal 
            isOpen={showPlagiarismModal}
            onClose={() => setShowPlagiarismModal(false)}
            results={plagiarismResults}
          />
        </VStack>
      </Container>
    </>
  );
}
