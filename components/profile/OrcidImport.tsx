import React, { useState } from 'react';
import { 
  Button, Box, Text, useToast, 
  Modal, ModalOverlay, ModalContent, 
  ModalHeader, ModalBody, ModalFooter,
  Spinner
} from '@chakra-ui/react';
import { FiDownload } from 'react-icons/fi';

// Define types for ORCID data
interface OrcidData {
  name?: string;
  affiliation?: string;
}

interface OrcidImportProps {
  orcidId: string;
  onImportComplete: (data: OrcidData) => void;
}

/**
 * A component that allows users to import basic information from ORCID
 * Shows a button that fetches data and displays a confirmation modal
 */
export const OrcidImport: React.FC<OrcidImportProps> = ({ 
  orcidId, 
  onImportComplete 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [importData, setImportData] = useState<OrcidData | null>(null);
  const toast = useToast();
  
  // Fetch basic data from ORCID API
  const fetchOrcidData = async () => {
    if (!orcidId) {
      toast({
        title: 'ORCID ID missing',
        description: 'Please add your ORCID ID to your profile first',
        status: 'warning',
        duration: 5000,
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Fetch basic data from ORCID API
      const response = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/person`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch ORCID data');
      
      const data = await response.json();
      
      // Extract relevant information
      const importData = {
        name: data.name?.['given-names']?.value && data.name?.['family-name']?.value 
          ? `${data.name['given-names'].value} ${data.name['family-name'].value}`
          : undefined,
        affiliation: data.employments?.['affiliation-group']?.[0]?.summaries?.[0]?.['employment-summary']?.organization?.name
      };
      
      setImportData(importData);
      setIsOpen(true);
    } catch (error) {
      console.error('ORCID import error:', error);
      toast({
        title: 'Import failed',
        description: 'Could not import data from ORCID',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Confirm import and update profile
  const confirmImport = () => {
    if (importData) {
      onImportComplete(importData);
      setIsOpen(false);
      toast({
        title: 'Import successful',
        description: 'Your ORCID data has been imported',
        status: 'success',
        duration: 5000,
      });
    }
  };
  
  return (
    <>
      <Button
        leftIcon={<FiDownload />}
        colorScheme="green"
        variant="outline"
        onClick={fetchOrcidData}
        isLoading={isLoading}
        isDisabled={!orcidId}
        aria-label="Import data from ORCID"
      >
        Import from ORCID
      </Button>
      
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Import ORCID Data</ModalHeader>
          <ModalBody>
            <Text mb={4}>The following information will be imported:</Text>
            <Box p={3} bg="gray.50" borderRadius="md">
              <Text><strong>Name:</strong> {importData?.name || 'Not available'}</Text>
              <Text><strong>Affiliation:</strong> {importData?.affiliation || 'Not available'}</Text>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={confirmImport}>
              Confirm Import
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default OrcidImport;
