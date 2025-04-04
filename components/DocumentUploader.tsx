import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Spinner,
  Badge,
} from '@chakra-ui/react';
import FormFileUpload from './FormFileUpload';
import { parseDocument, ParsedDocument } from '../utils/documentParser';
import { createLogger, LogCategory } from '../utils/logger';

const logger = createLogger('DocumentUploader');

interface DocumentUploaderProps {
  onDocumentParsed: (parsedDocument: ParsedDocument) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onDocumentParsed }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const toast = useToast();

  const handleFileSelect = async (files: File[]) => {
    if (!files.length) return;
    
    const file = files[0]; // Only process the first file
    setUploadedFile(file);
    setError(null);
    setIsLoading(true);
    
    try {
      logger.info(`Processing uploaded file: ${file.name}`, {
        category: LogCategory.DOCUMENT
      });
      
      const result = await parseDocument(file);
      
      if (result.error) {
        setError(result.error);
        toast({
          title: 'Document parsing failed',
          description: result.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Success
        toast({
          title: 'Document parsed successfully',
          description: 'The document content has been extracted and populated into the form.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        onDocumentParsed(result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logger.error(`Error processing file: ${errorMessage}`, {
        category: LogCategory.DOCUMENT
      });
      
      toast({
        title: 'Processing error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetUploader = () => {
    setUploadedFile(null);
    setError(null);
  };

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="md" 
      p={4} 
      mb={6}
      bg="white"
      boxShadow="sm"
    >
      <Text fontWeight="medium" mb={2}>
        Upload Document
      </Text>
      <Text fontSize="sm" color="gray.600" mb={4}>
        Upload your existing document to automatically populate the form fields. 
        Currently supports plain text (.txt) files.
      </Text>
      
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription fontSize="sm">{error}</AlertDescription>
          </Box>
        </Alert>
      )}
      
      {isLoading ? (
        <Flex direction="column" align="center" justify="center" py={4}>
          <Spinner size="md" mb={2} />
          <Text>Processing document...</Text>
        </Flex>
      ) : uploadedFile ? (
        <Box borderWidth="1px" borderRadius="md" p={3} mb={4}>
          <Flex justify="space-between" align="center">
            <Box>
              <Text fontWeight="medium">{uploadedFile.name}</Text>
              <Text fontSize="sm" color="gray.600">
                {(uploadedFile.size / 1024).toFixed(1)} KB
              </Text>
            </Box>
            <Badge colorScheme="green">Processed</Badge>
          </Flex>
          <Button 
            size="sm" 
            mt={2} 
            colorScheme="blue" 
            variant="outline"
            onClick={resetUploader}
          >
            Upload Another
          </Button>
        </Box>
      ) : (
        <FormFileUpload
          id="document-upload"
          name="document"
          accept=".txt,text/plain"
          multiple={false}
          buttonText="Select Document"
          helperText="Drag and drop a file or click to browse"
          showPreview={true}
          maxFileSizeInMB={5}
          onFileSelect={handleFileSelect}
        />
      )}
      
      <Text fontSize="xs" color="gray.500" mt={2}>
        PDF and Word document support coming soon. For now, please use plain text files.
      </Text>
    </Box>
  );
};

export default DocumentUploader;
