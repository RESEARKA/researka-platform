import React, { useState } from 'react';
import {
  VStack,
  Input,
  Button,
  Text,
  List,
  ListItem,
  IconButton,
  HStack,
  useToast,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Select,
  Divider,
  Heading,
  Spinner,
} from '@chakra-ui/react';
import { FiPlus, FiTrash, FiLink, FiSearch, FiEdit } from 'react-icons/fi';
import { Citation, CitationFormat } from '../types/citation';

interface CitationPanelProps {
  citations: Citation[];
  onAddCitation: (citation: Citation) => void;
  onRemoveCitation: (id: string) => void;
  onInsertCitation: (citation: Citation) => void;
  fetchCitationByDOI: (doi: string) => Promise<Citation>;
  fetchCitationByURL: (url: string) => Promise<Citation>;
  createCitation: (data: Partial<Citation>) => Citation;
  citationFormat: CitationFormat;
  setCitationFormat: (format: CitationFormat) => void;
}

export const CitationPanel: React.FC<CitationPanelProps> = ({
  citations,
  onAddCitation,
  onRemoveCitation,
  onInsertCitation,
  fetchCitationByDOI,
  fetchCitationByURL,
  createCitation,
  citationFormat,
  setCitationFormat,
}) => {
  const [doiInput, setDoiInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const toast = useToast();

  // Manual citation form state
  const [manualCitation, setManualCitation] = useState<Partial<Citation>>({
    title: '',
    authors: [],
    year: new Date().getFullYear(),
    type: 'other',
  });
  const [authorInput, setAuthorInput] = useState({ given: '', family: '' });

  const handleFetchCitationByDOI = async () => {
    if (!doiInput.trim()) return;
    
    setIsLoading(true);
    try {
      await fetchCitationByDOI(doiInput);
      setDoiInput('');
      toast({
        title: 'Citation added',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Failed to fetch citation',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchCitationByURL = async () => {
    if (!urlInput.trim()) return;
    
    setIsLoading(true);
    try {
      await fetchCitationByURL(urlInput);
      setUrlInput('');
      toast({
        title: 'Citation added',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Failed to fetch citation',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAuthor = () => {
    if (!authorInput.given.trim() && !authorInput.family.trim()) return;
    
    setManualCitation(prev => ({
      ...prev,
      authors: [...(prev.authors || []), authorInput],
    }));
    
    setAuthorInput({ given: '', family: '' });
  };

  const handleRemoveAuthor = (index: number) => {
    setManualCitation(prev => ({
      ...prev,
      authors: prev.authors?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleCreateManualCitation = () => {
    if (!manualCitation.title?.trim()) {
      toast({
        title: 'Title is required',
        status: 'error',
        duration: 2000,
      });
      return;
    }
    
    createCitation(manualCitation);
    
    setManualCitation({
      title: '',
      authors: [],
      year: new Date().getFullYear(),
      type: 'other',
    });
    
    toast({
      title: 'Citation added',
      status: 'success',
      duration: 2000,
    });
  };

  return (
    <VStack 
      width="350px" 
      borderWidth="1px" 
      borderRadius="md" 
      p={4} 
      bg="white" 
      align="stretch"
      spacing={4}
      maxH="600px"
      overflowY="auto"
    >
      <Heading size="md">Citations</Heading>
      
      <HStack>
        <Text>Citation Style:</Text>
        <Select 
          size="sm" 
          value={citationFormat}
          onChange={(e) => setCitationFormat(e.target.value as CitationFormat)}
        >
          <option value="apa">APA</option>
          <option value="mla">MLA</option>
          <option value="chicago">Chicago</option>
          <option value="harvard">Harvard</option>
          <option value="ieee">IEEE</option>
        </Select>
      </HStack>
      
      <Tabs isFitted variant="enclosed" index={activeTab} onChange={setActiveTab}>
        <TabList mb="1em">
          <Tab>Library</Tab>
          <Tab>DOI</Tab>
          <Tab>URL</Tab>
          <Tab>Manual</Tab>
        </TabList>
        
        <TabPanels>
          {/* Library Tab */}
          <TabPanel p={0}>
            <List spacing={2} maxH="300px" overflowY="auto">
              {citations.length === 0 ? (
                <Box p={4} textAlign="center">
                  <Text color="gray.500">No citations added yet</Text>
                </Box>
              ) : (
                citations.map(citation => (
                  <ListItem key={citation.id} p={2} borderWidth="1px" borderRadius="md">
                    <VStack align="start" spacing={1}>
                      <HStack justify="space-between" w="full">
                        <Text fontWeight="semibold" noOfLines={1}>
                          {citation.title}
                        </Text>
                        <HStack spacing={1}>
                          <IconButton
                            aria-label="Insert citation"
                            icon={<FiLink />}
                            size="xs"
                            onClick={() => onInsertCitation(citation)}
                          />
                          <IconButton
                            aria-label="Remove citation"
                            icon={<FiTrash />}
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => onRemoveCitation(citation.id)}
                          />
                        </HStack>
                      </HStack>
                      
                      <Text fontSize="sm" color="gray.600" noOfLines={1}>
                        {citation.authors.map(a => `${a.family}, ${a.given.charAt(0)}.`).join('; ')}
                        {citation.authors.length > 0 ? ' ' : ''}
                        ({citation.year})
                      </Text>
                      
                      {citation.journal && (
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                          {citation.journal}
                          {citation.volume ? `, ${citation.volume}` : ''}
                          {citation.issue ? `(${citation.issue})` : ''}
                          {citation.pages ? `, ${citation.pages}` : ''}
                        </Text>
                      )}
                    </VStack>
                  </ListItem>
                ))
              )}
            </List>
          </TabPanel>
          
          {/* DOI Tab */}
          <TabPanel p={0}>
            <VStack spacing={2}>
              <HStack>
                <Input 
                  placeholder="Enter DOI" 
                  value={doiInput}
                  onChange={(e) => setDoiInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleFetchCitationByDOI()}
                />
                <IconButton
                  aria-label="Add citation by DOI"
                  icon={isLoading ? <Spinner size="sm" /> : <FiSearch />}
                  onClick={handleFetchCitationByDOI}
                  isLoading={isLoading}
                />
              </HStack>
              <Text fontSize="sm" color="gray.500">
                Example: 10.1000/xyz123 or https://doi.org/10.1000/xyz123
              </Text>
            </VStack>
          </TabPanel>
          
          {/* URL Tab */}
          <TabPanel p={0}>
            <VStack spacing={2}>
              <HStack>
                <Input 
                  placeholder="Enter URL" 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleFetchCitationByURL()}
                />
                <IconButton
                  aria-label="Add citation by URL"
                  icon={isLoading ? <Spinner size="sm" /> : <FiSearch />}
                  onClick={handleFetchCitationByURL}
                  isLoading={isLoading}
                />
              </HStack>
              <Text fontSize="sm" color="gray.500">
                Enter the full URL of the webpage or article
              </Text>
            </VStack>
          </TabPanel>
          
          {/* Manual Tab */}
          <TabPanel p={0}>
            <VStack spacing={3} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm">Title</FormLabel>
                <Input 
                  placeholder="Title of the work" 
                  value={manualCitation.title}
                  onChange={(e) => setManualCitation(prev => ({ ...prev, title: e.target.value }))}
                  size="sm"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm">Authors</FormLabel>
                <HStack>
                  <Input 
                    placeholder="First name" 
                    value={authorInput.given}
                    onChange={(e) => setAuthorInput(prev => ({ ...prev, given: e.target.value }))}
                    size="sm"
                  />
                  <Input 
                    placeholder="Last name" 
                    value={authorInput.family}
                    onChange={(e) => setAuthorInput(prev => ({ ...prev, family: e.target.value }))}
                    size="sm"
                  />
                  <IconButton
                    aria-label="Add author"
                    icon={<FiPlus />}
                    onClick={handleAddAuthor}
                    size="sm"
                  />
                </HStack>
                
                {manualCitation.authors && manualCitation.authors.length > 0 && (
                  <List mt={2} spacing={1}>
                    {manualCitation.authors.map((author, index) => (
                      <ListItem key={index}>
                        <HStack>
                          <Text fontSize="sm">
                            {author.given} {author.family}
                          </Text>
                          <IconButton
                            aria-label="Remove author"
                            icon={<FiTrash />}
                            onClick={() => handleRemoveAuthor(index)}
                            size="xs"
                            variant="ghost"
                          />
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                )}
              </FormControl>
              
              <HStack>
                <FormControl>
                  <FormLabel fontSize="sm">Year</FormLabel>
                  <Input 
                    type="number" 
                    value={manualCitation.year}
                    onChange={(e) => setManualCitation(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    size="sm"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel fontSize="sm">Type</FormLabel>
                  <Select 
                    value={manualCitation.type}
                    onChange={(e) => setManualCitation(prev => ({ ...prev, type: e.target.value as Citation['type'] }))}
                    size="sm"
                  >
                    <option value="article">Journal Article</option>
                    <option value="book">Book</option>
                    <option value="chapter">Book Chapter</option>
                    <option value="conference">Conference Paper</option>
                    <option value="website">Website</option>
                    <option value="other">Other</option>
                  </Select>
                </FormControl>
              </HStack>
              
              {(manualCitation.type === 'article' || manualCitation.type === 'conference') && (
                <FormControl>
                  <FormLabel fontSize="sm">Journal/Conference</FormLabel>
                  <Input 
                    placeholder="Journal or conference name" 
                    value={manualCitation.journal || ''}
                    onChange={(e) => setManualCitation(prev => ({ ...prev, journal: e.target.value }))}
                    size="sm"
                  />
                </FormControl>
              )}
              
              <HStack>
                {(manualCitation.type === 'article') && (
                  <>
                    <FormControl>
                      <FormLabel fontSize="sm">Volume</FormLabel>
                      <Input 
                        placeholder="Vol." 
                        value={manualCitation.volume || ''}
                        onChange={(e) => setManualCitation(prev => ({ ...prev, volume: e.target.value }))}
                        size="sm"
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel fontSize="sm">Issue</FormLabel>
                      <Input 
                        placeholder="Issue" 
                        value={manualCitation.issue || ''}
                        onChange={(e) => setManualCitation(prev => ({ ...prev, issue: e.target.value }))}
                        size="sm"
                      />
                    </FormControl>
                  </>
                )}
              </HStack>
              
              {(manualCitation.type === 'article' || manualCitation.type === 'chapter') && (
                <FormControl>
                  <FormLabel fontSize="sm">Pages</FormLabel>
                  <Input 
                    placeholder="e.g., 123-145" 
                    value={manualCitation.pages || ''}
                    onChange={(e) => setManualCitation(prev => ({ ...prev, pages: e.target.value }))}
                    size="sm"
                  />
                </FormControl>
              )}
              
              {(manualCitation.type === 'website' || manualCitation.type === 'other') && (
                <FormControl>
                  <FormLabel fontSize="sm">URL</FormLabel>
                  <Input 
                    placeholder="https://..." 
                    value={manualCitation.url || ''}
                    onChange={(e) => setManualCitation(prev => ({ ...prev, url: e.target.value }))}
                    size="sm"
                  />
                </FormControl>
              )}
              
              <Button 
                colorScheme="blue" 
                onClick={handleCreateManualCitation}
                size="sm"
                mt={2}
              >
                Add Citation
              </Button>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};
