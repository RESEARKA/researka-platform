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
  Flex,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Checkbox,
  FormControl,
  FormErrorMessage,
  Progress,
  SimpleGrid,
  useToast
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
    try {
      if (section === 'authorInfo') {
        // Parse the author information JSON
        const authorData = JSON.parse(content);
        
        // Update the article state with author information
        const updatedArticle = {
          ...article,
          authorName: authorData.name?.trim() || '',
          authorEmail: authorData.email?.trim() || '',
          authorAffiliation: authorData.affiliation?.trim() || '',
          isCorrespondingAuthor: authorData.isCorresponding !== false
        };
        
        // Set the updated article state
        setArticle(updatedArticle);
        
        // Run validation immediately to update any error states
        const errors: Record<string, string> = {};
        
        if (!updatedArticle.authorName) {
          errors.authorName = 'Author name is required';
        }
        
        if (!updatedArticle.authorEmail) {
          errors.authorEmail = 'Author email is required';
        }
        
        if (!updatedArticle.authorAffiliation) {
          errors.authorAffiliation = 'Author affiliation is required';
        }
        
        // Update only the author-related validation errors
        setValidationErrors(prev => ({
          ...prev,
          authorName: errors.authorName || '',
          authorEmail: errors.authorEmail || '',
          authorAffiliation: errors.authorAffiliation || ''
        }));
        
      } else if (section === 'title') {
        // Direct handling for title to ensure it's saved properly
        setArticle(prev => ({
          ...prev,
          title: content
        }));
        
        // Clear any title validation errors if content is valid
        if (content && content.split(/\s+/).filter(Boolean).length >= 5) {
          setValidationErrors(prev => ({
            ...prev,
            title: ''
          }));
          
          // Also remove any title-related warnings from document warnings
          setDocumentWarnings(prev => 
            prev.filter(warning => !warning.toLowerCase().includes('title'))
          );
        }
      } else if (section === 'metadata') {
        try {
          // Parse the metadata JSON
          const metaData = JSON.parse(content);
          setArticle(prev => ({
            ...prev,
            category: metaData.category || prev.category || '',
            license: metaData.license || prev.license || ''
          }));
        } catch (e) {
          logger.error('Error parsing metadata:', e);
          toast({
            title: 'Error updating category and license',
            description: 'There was a problem processing the metadata.',
            status: 'error',
            duration: 3000,
            isClosable: true
          });
        }
      } else if (section.includes('.')) {
        // Handle nested properties like declarations.ethics
        const [parent, child] = section.split('.');
        setArticle(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof Article],
            [child]: content
          }
        }));
      } else {
        // Handle regular properties
        setArticle(prev => ({
          ...prev,
          [section]: content
        }));
      }
      
      setCurrentEditingSection(null);
      
      toast({
        title: 'Section updated',
        description: `The ${section} section has been updated.`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      logger.error(`Error saving section ${section}:`, error);
      toast({
        title: 'Error saving changes',
        description: 'There was a problem updating this section. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
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
        
        // Special handling for title to ensure it's not showing an error incorrectly
        if (key === 'title' && wordCount >= config.wordLimits.min) {
          // Title has enough words, don't add an error
          continue;
        }
        
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
      
      try {
        // Import Firebase
        const { getFirebaseFirestore } = await import('../config/firebase');
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        
        // Get Firestore instance
        const firestore = getFirebaseFirestore();
        if (!firestore) {
          throw new Error('Firestore is not initialized');
        }
        
        // Create article document in Firestore
        const articleData = {
          ...article,
          userId: user?.uid || 'anonymous',
          status: 'pending_review',
          submittedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // Save to Firestore
        const articlesCollection = collection(firestore, 'articles');
        const docRef = await addDoc(articlesCollection, articleData);
        
        logger.info(`Article submitted successfully with ID: ${docRef.id}`);
        
        // Store article ID in localStorage for reference
        localStorage.setItem('lastSubmittedArticleId', docRef.id);
        
        toast({
          title: 'Article submitted successfully',
          description: 'Your article has been submitted for review.',
          status: 'success',
          duration: 5000,
          isClosable: true
        });
        
        // Redirect to home page
        router.push('/');
      } catch (error) {
        logger.error('Error submitting article to Firestore:', error);
        
        toast({
          title: 'Error submitting article',
          description: 'There was a problem submitting your article. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      }
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
      
      <VStack spacing={4} align="stretch" mb={6}>
        {/* Author Information Summary */}
        <Box borderWidth={1} borderRadius="md" p={4} bg="gray.50">
          <Heading size="sm" mb={3}>Author Information Summary</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Box>
              <Text fontWeight="bold">Name:</Text>
              <Text>{article.authorName || 'Not provided'}</Text>
              {validationErrors.authorName && (
                <Text color="red.500" fontSize="sm">{validationErrors.authorName}</Text>
              )}
            </Box>
            <Box>
              <Text fontWeight="bold">Email:</Text>
              <Text>{article.authorEmail || 'Not provided'}</Text>
              {validationErrors.authorEmail && (
                <Text color="red.500" fontSize="sm">{validationErrors.authorEmail}</Text>
              )}
            </Box>
            <Box>
              <Text fontWeight="bold">Affiliation:</Text>
              <Text>{article.authorAffiliation || 'Not provided'}</Text>
              {validationErrors.authorAffiliation && (
                <Text color="red.500" fontSize="sm">{validationErrors.authorAffiliation}</Text>
              )}
            </Box>
            <Box>
              <Text fontWeight="bold">Corresponding Author:</Text>
              <Text>{article.isCorrespondingAuthor ? 'Yes' : 'No'}</Text>
            </Box>
          </SimpleGrid>
          
          {(validationErrors.authorName || validationErrors.authorEmail || validationErrors.authorAffiliation) && (
            <Button 
              size="sm" 
              colorScheme="red" 
              variant="outline" 
              mt={3}
              onClick={() => handleSectionEdit('authorInfo')}
            >
              Fix Author Information
            </Button>
          )}
        </Box>
      </VStack>
      
      <FormControl mb={6} isInvalid={!!validationErrors.terms}>
        <Checkbox 
          isChecked={acceptedTerms} 
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          size="lg"
          colorScheme="blue"
        >
          I accept the terms and conditions and confirm this is my original work
        </Checkbox>
        {validationErrors.terms && (
          <FormErrorMessage>{validationErrors.terms}</FormErrorMessage>
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
