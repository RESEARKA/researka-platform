import React, { useState } from 'react';
import {
  Box,
  Text,
  Flex,
  Button,
  useToast,
  Heading,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Badge,
  Icon,
  Tooltip
} from '@chakra-ui/react';
import { InfoIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { FaFilePdf, FaFileWord, FaFileAlt, FaFile } from 'react-icons/fa';
import FormFileUpload from './FormFileUpload';
import { parseDocument, ParsedDocument } from '../utils/documentParser';
import { createLogger, LogCategory } from '../utils/logger';

const logger = createLogger('DocumentUploader');

// Supported file types
const SUPPORTED_EXTENSIONS = ['.txt', '.pdf', '.docx', '.doc', '.pages'];
const SUPPORTED_MIME_TYPES = [
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.apple.pages'
];

interface DocumentUploaderProps {
  onDocumentParsed: (document: ParsedDocument) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onDocumentParsed }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const toast = useToast();

  const handleFileSelect = async (files: File[]) => {
    if (!files.length) return;
    
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    
    const file = files[0];
    setUploadedFile(file);
    
    // Validate file type
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const isValidExtension = SUPPORTED_EXTENSIONS.includes(fileExtension);
    const isValidMimeType = SUPPORTED_MIME_TYPES.includes(file.type);
    
    if (!isValidExtension && !isValidMimeType) {
      const errorMessage = `Unsupported file type: ${file.type || fileExtension}. Please use a supported document format (PDF, Word, Pages, or plain text).`;
      setError(errorMessage);
      setIsLoading(false);
      
      logger.warn('Unsupported file type uploaded', {
        category: LogCategory.DOCUMENT,
        context: { fileType: file.type, fileName: file.name }
      });
      
      return;
    }
    
    try {
      logger.info('Processing document upload', {
        category: LogCategory.DOCUMENT,
        context: { fileName: file.name, fileType: file.type, fileSize: file.size }
      });
      
      const result = await parseDocument(file);
      
      if (result.error) {
        setError(result.error);
        toast({
          title: 'Document Upload Error',
          description: result.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        setIsSuccess(true);
        onDocumentParsed(result);
        toast({
          title: 'Document Uploaded Successfully',
          description: 'Your document has been processed and the content has been extracted.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      
      logger.error('Error processing document', {
        category: LogCategory.DOCUMENT,
        context: { error: errorMessage }
      });
      
      toast({
        title: 'Document Processing Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <Icon as={FaFilePdf} color="red.500" boxSize={5} mr={2} />;
    } else if (file.type.includes('word') || file.type.includes('docx') || file.type.includes('doc')) {
      return <Icon as={FaFileWord} color="blue.500" boxSize={5} mr={2} />;
    } else if (file.type === 'text/plain') {
      return <Icon as={FaFileAlt} color="gray.500" boxSize={5} mr={2} />;
    } else {
      return <Icon as={FaFile} color="green.500" boxSize={5} mr={2} />;
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setIsSuccess(false);
    setError(null);
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} mb={6} bg="white">
      <Flex direction="column" align="flex-start">
        <Heading size="md" mb={2}>Upload Document</Heading>
        
        <Flex alignItems="center" mb={2}>
          <Text fontSize="sm" color="gray.600" mr={1}>
            Supported formats:
          </Text>
          <Badge colorScheme="blue" mr={1}>PDF</Badge>
          <Badge colorScheme="green" mr={1}>Word</Badge>
          <Badge colorScheme="purple" mr={1}>Pages</Badge>
          <Badge colorScheme="gray" mr={1}>TXT</Badge>
          <Tooltip label="Your document will be processed and the content will be extracted to fill in the form fields automatically. The document structure should include a title, abstract, and main content.">
            <InfoIcon color="gray.400" />
          </Tooltip>
        </Flex>
        
        {!isSuccess && (
          <FormFileUpload
            id="document-upload"
            name="document"
            onFileSelect={handleFileSelect}
            accept=".txt,.pdf,.docx,.doc,.pages,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain,application/vnd.apple.pages"
            multiple={false}
            buttonText="Select Document"
            helperText="Drag and drop a file or click to browse"
            showPreview={true}
            maxFileSizeInMB={10}
            isDisabled={isLoading}
          />
        )}
        
        {isLoading && (
          <Flex align="center" justify="center" w="100%" py={4}>
            <Spinner size="md" mr={3} />
            <Text>Processing your document...</Text>
          </Flex>
        )}
        
        {error && (
          <Alert status="error" mt={4} borderRadius="md">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle fontSize="md">Error Processing Document</AlertTitle>
              <AlertDescription fontSize="sm">{error}</AlertDescription>
            </Box>
          </Alert>
        )}
        
        {isSuccess && uploadedFile && (
          <Box mt={4} p={3} bg="gray.50" borderRadius="md" w="100%">
            <Flex align="center">
              {getFileIcon(uploadedFile)}
              <Box flex="1">
                <Text fontWeight="bold" fontSize="sm">{uploadedFile.name}</Text>
                <Text fontSize="xs" color="gray.500">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </Text>
              </Box>
              <Icon as={CheckCircleIcon} color="green.500" boxSize={5} />
            </Flex>
            <Text mt={2} fontSize="sm" color="green.600">
              Document processed successfully! The form has been populated with the extracted content.
            </Text>
            <Button size="sm" mt={2} onClick={handleReset} colorScheme="blue" variant="outline">
              Upload a different document
            </Button>
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default DocumentUploader;
