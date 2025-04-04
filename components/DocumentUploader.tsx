import React, { useState, useCallback } from 'react';
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
} from '@chakra-ui/react';
import { InfoIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { FaFilePdf, FaFileWord, FaFileAlt, FaFile } from 'react-icons/fa';
import { parseDocument, ParsedDocument } from '../utils/documentParser';
import FormFileUpload from './FormFileUpload';

// Supported file types
const SUPPORTED_EXTENSIONS = ['.txt', '.pdf', '.docx', '.doc', '.pages'];
const SUPPORTED_MIME_TYPES = [
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.apple.pages',
];

interface DocumentUploaderProps {
  onDocumentParsed: (parsedDocument: ParsedDocument) => void;
  isDisabled?: boolean;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onDocumentParsed, isDisabled = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [useAIEnhancement, setUseAIEnhancement] = useState(true);
  const toast = useToast();

  const handleFileSelect = useCallback(async (files: File[]) => {
    if (!files.length) return;

    try {
      setIsUploading(true);
      setUploadedFile(files[0]);
      setUploadSuccess(false);

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

      // Parse the document with AI enhancement if enabled
      const parsedDocument = await parseDocument(files[0], { enhanceWithAI: useAIEnhancement });

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
  }, [onDocumentParsed, toast, useAIEnhancement]);

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
            <Badge colorScheme="blue">PDF</Badge>
            <Badge colorScheme="green">WORD</Badge>
            <Badge colorScheme="purple">PAGES</Badge>
            <Badge colorScheme="gray">TXT</Badge>
            <Tooltip label="Upload a document to automatically extract its content and populate the form fields.">
              <InfoIcon color="gray.400" />
            </Tooltip>
          </HStack>
        </HStack>

        <FormControl display="flex" alignItems="center" justifyContent="flex-end">
          <FormLabel htmlFor="ai-enhancement" mb="0" fontSize="sm" color="gray.600">
            AI Enhancement
          </FormLabel>
          <Tooltip label="Use AI to improve document structure, format references, and enhance content quality">
            <Switch 
              id="ai-enhancement" 
              isChecked={useAIEnhancement} 
              onChange={(e) => setUseAIEnhancement(e.target.checked)}
              colorScheme="teal"
              size="sm"
            />
          </Tooltip>
        </FormControl>

        {!uploadSuccess ? (
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
            isDisabled={isDisabled || isUploading}
          />
        ) : (
          <VStack spacing={3} align="stretch">
            <HStack>
              {uploadedFile && getFileIcon(uploadedFile)}
              <Text fontWeight="medium">{uploadedFile?.name}</Text>
              <Icon as={CheckCircleIcon} color="green.500" />
              {useAIEnhancement && (
                <Badge colorScheme="teal" variant="subtle">
                  AI Enhanced
                </Badge>
              )}
            </HStack>
            <Text fontSize="sm" color="green.600">
              Document processed successfully! The form has been populated with the extracted content.
            </Text>
            <Button
              size="sm"
              leftIcon={<FaFile />}
              variant="outline"
              onClick={handleReset}
            >
              Upload a different document
            </Button>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default DocumentUploader;
