import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Text,
  Button,
  useToast,
  Badge,
  Icon,
  Tooltip,
  Switch,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  Progress,
  Spinner,
} from '@chakra-ui/react';
import { InfoIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { FaFilePdf, FaFileWord, FaFileAlt, FaFile } from 'react-icons/fa';
import { parseDocument, ParsedDocument } from '../utils/documentParser';
import { parseStandardizedWordTemplate, parseStandardizedMarkdownTemplate } from '../utils/standardizedTemplateParser';
import FormFileUpload from './FormFileUpload';

// Supported file types
const SUPPORTED_EXTENSIONS = ['.txt', '.pdf', '.docx', '.doc', '.pages', '.md'];
const SUPPORTED_MIME_TYPES = [
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.apple.pages',
  'text/markdown',
];

interface DocumentUploaderProps {
  onDocumentParsed: (parsedDocument: ParsedDocument) => void;
  isDisabled?: boolean;
  useStandardizedTemplate?: boolean;
  onFileSelect?: (file: File) => Promise<void>;
  acceptedFileTypes?: string;
  maxFileSizeMB?: number;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ 
  onDocumentParsed, 
  isDisabled = false,
  useStandardizedTemplate = false,
  onFileSelect,
  acceptedFileTypes = '.docx,.doc,.md',
  maxFileSizeMB = 10
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [useAIEnhancement, setUseAIEnhancement] = useState(true);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStartTime, setProcessingStartTime] = useState<number | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<string | null>(null);
  const toast = useToast();

  // Update progress bar during processing
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    
    if (isUploading && useAIEnhancement) {
      // Start progress timer
      setProcessingStartTime(Date.now());
      setProcessingProgress(0);
      
      // Simulate progress over 30 seconds (typical AI processing time)
      progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          // Cap at 95% until actual completion
          return prev < 95 ? prev + 1 : prev;
        });
        
        // Update estimated time remaining
        if (processingStartTime) {
          const elapsedSeconds = Math.floor((Date.now() - processingStartTime) / 1000);
          const estimatedTotalTime = useAIEnhancement ? 30 : 10; // seconds
          const remainingSeconds = Math.max(0, estimatedTotalTime - elapsedSeconds);
          
          if (remainingSeconds > 0) {
            setEstimatedTimeRemaining(`${remainingSeconds}s remaining`);
          } else {
            setEstimatedTimeRemaining('Finalizing...');
          }
        }
      }, 300);
    } else {
      setProcessingProgress(0);
      setEstimatedTimeRemaining(null);
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isUploading, useAIEnhancement, processingStartTime]);

  const handleFileSelect = useCallback(async (files: File[]) => {
    if (!files.length) return;

    try {
      setIsUploading(true);
      setUploadedFile(files[0]);
      setUploadSuccess(false);
      setProcessingProgress(0);

      // If custom file select handler is provided, use it
      if (onFileSelect) {
        await onFileSelect(files[0]);
        setIsUploading(false);
        return;
      }

      // Validate file type
      const fileExtension = files[0].name.substring(files[0].name.lastIndexOf('.')).toLowerCase();
      const isValidExtension = SUPPORTED_EXTENSIONS.includes(fileExtension);
      const isValidMimeType = SUPPORTED_MIME_TYPES.includes(files[0].type);

      if (!isValidExtension && !isValidMimeType) {
        const errorMessage = `Unsupported file type: ${files[0].type || fileExtension}. Please use a supported document format (PDF, Word, Pages, or plain text).`;
        toast({
          title: 'Unsupported File Type',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsUploading(false);
        return;
      }

      // Display toast for AI processing
      if (useAIEnhancement) {
        toast({
          title: 'AI Document Enhancement',
          description: 'Processing your document with AI. This may take 20-30 seconds depending on document size.',
          status: 'info',
          duration: 10000,
          isClosable: true,
        });
      }

      // Parse the document based on template type
      let parsedDocument: ParsedDocument;
      
      if (useStandardizedTemplate) {
        // Use standardized template parser
        if (fileExtension === '.docx' || fileExtension === '.doc') {
          parsedDocument = await parseStandardizedWordTemplate(files[0]);
        } else if (fileExtension === '.md') {
          parsedDocument = await parseStandardizedMarkdownTemplate(files[0]);
        } else {
          toast({
            title: 'Unsupported File Type for Standardized Template',
            description: 'Please use a DOCX or Markdown file with the standardized template format.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          setIsUploading(false);
          return;
        }
      } else {
        // Use regular document parser
        parsedDocument = await parseDocument(files[0], { enhanceWithAI: useAIEnhancement });
      }

      if (parsedDocument.error) {
        toast({
          title: 'Error parsing document',
          description: parsedDocument.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsUploading(false);
        return;
      }

      // Handle successful parsing
      setUploadSuccess(true);
      setProcessingProgress(100);
      onDocumentParsed(parsedDocument);
      toast({
        title: 'Document processed successfully',
        description: `The content from "${files[0].name}" has been extracted and the form has been populated.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error uploading document',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  }, [onDocumentParsed, toast, useAIEnhancement, useStandardizedTemplate, onFileSelect]);

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <Icon as={FaFilePdf} color="red.500" boxSize={5} mr={2} />;
    } else if (file.type.includes('word') || file.type.includes('docx') || file.type.includes('doc')) {
      return <Icon as={FaFileWord} color="blue.500" boxSize={5} mr={2} />;
    } else if (file.type === 'text/plain' || file.type === 'text/markdown') {
      return <Icon as={FaFileAlt} color="gray.500" boxSize={5} mr={2} />;
    } else {
      return <Icon as={FaFile} color="green.500" boxSize={5} mr={2} />;
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setUploadSuccess(false);
  };

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      borderColor="gray.200"
      bg="white"
      width="100%"
    >
      <VStack spacing={4} align="stretch">
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontWeight="bold" fontSize="lg">Upload Document</Text>
          <HStack spacing={2}>
            <Text fontSize="sm" color="gray.500">Supported formats:</Text>
            {useStandardizedTemplate ? (
              <>
                <Badge colorScheme="green">WORD</Badge>
                <Badge colorScheme="purple">MD</Badge>
              </>
            ) : (
              <>
                <Badge colorScheme="blue">PDF</Badge>
                <Badge colorScheme="green">WORD</Badge>
                <Badge colorScheme="purple">PAGES</Badge>
                <Badge colorScheme="gray">TXT</Badge>
              </>
            )}
            <Tooltip label={useStandardizedTemplate 
              ? "Upload a document using our standardized template format to automatically extract its content."
              : "Upload a document to automatically extract its content and populate the form fields."
            }>
              <InfoIcon color="gray.400" />
            </Tooltip>
          </HStack>
        </HStack>
        
        {!uploadedFile ? (
          <>
            <FormFileUpload
              onFileSelect={handleFileSelect}
              isDisabled={isDisabled || isUploading}
              acceptedFileTypes={acceptedFileTypes}
              maxFileSizeMB={maxFileSizeMB}
            />
            
            {!useStandardizedTemplate && (
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel htmlFor="ai-enhancement" mb="0" fontSize="sm">
                  Use AI to enhance document parsing
                  <Tooltip label="AI helps extract structured content more accurately from your document, especially for complex formats.">
                    <InfoIcon ml={1} color="gray.400" boxSize={3} />
                  </Tooltip>
                </FormLabel>
                <Switch
                  id="ai-enhancement"
                  isChecked={useAIEnhancement}
                  onChange={(e) => setUseAIEnhancement(e.target.checked)}
                  colorScheme="blue"
                />
              </FormControl>
            )}
          </>
        ) : (
          <VStack spacing={3} align="stretch">
            {isUploading ? (
              <>
                <HStack>
                  <Spinner size="sm" />
                  <Text>Processing document...</Text>
                </HStack>
                <Progress
                  value={processingProgress}
                  size="sm"
                  colorScheme="blue"
                  hasStripe
                  isAnimated
                />
                {estimatedTimeRemaining && (
                  <Text fontSize="xs" color="gray.500" textAlign="right">
                    {estimatedTimeRemaining}
                  </Text>
                )}
              </>
            ) : (
              <>
                <HStack>
                  {getFileIcon(uploadedFile)}
                  <Text fontWeight="medium">{uploadedFile.name}</Text>
                  {uploadSuccess && <CheckCircleIcon color="green.500" />}
                </HStack>
                <HStack spacing={2}>
                  <Button size="sm" onClick={handleReset} variant="outline">
                    Change File
                  </Button>
                </HStack>
              </>
            )}
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default DocumentUploader;
