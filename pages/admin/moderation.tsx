import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Spinner,
  Center,
  useToast,
  Flex,
  Link as ChakraLink,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tooltip
} from '@chakra-ui/react';
import { 
  FiSearch, 
  FiMoreVertical, 
  FiEye, 
  FiTrash2, 
  FiFlag,
  FiCheck,
  FiX,
  FiAlertTriangle
} from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import { collection, query, getDocs, doc, updateDoc, where, orderBy, limit, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { createLogger, LogCategory } from '../../utils/logger';
import Link from 'next/link';

const logger = createLogger('admin-moderation');

interface Report {
  id: string;
  targetType: 'article' | 'user' | 'comment' | 'review';
  targetId: string;
  title: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: Date;
  createdBy: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
  authorId?: string;
  authorName?: string;
}

const ContentModeration: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isResolveOpen, onOpen: onResolveOpen, onClose: onResolveClose } = useDisclosure();
  const { isOpen: isDismissOpen, onOpen: onDismissOpen, onClose: onDismissClose } = useDisclosure();
  
  const toast = useToast();
  
  useEffect(() => {
    fetchReports();
  }, []);
  
  useEffect(() => {
    let filtered = reports;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.targetType === typeFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (report.authorName && report.authorName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    setFilteredReports(filtered);
  }, [searchQuery, statusFilter, typeFilter, reports]);
  
  const fetchReports = async () => {
    try {
      if (!db) {
        logger.error('Firestore not initialized', {
          category: LogCategory.ERROR
        });
        return;
      }
      
      const reportsQuery = query(
        collection(db, 'reports'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      
      const reportsSnapshot = await getDocs(reportsQuery);
      const reportsData: Report[] = [];
      
      for (const docSnapshot of reportsSnapshot.docs) {
        const reportData = docSnapshot.data();
        
        // Fetch author information if available
        let authorName = 'Unknown';
        
        if (reportData.authorId) {
          try {
            const authorDoc = await getDoc(doc(db, 'users', reportData.authorId));
            if (authorDoc.exists()) {
              const authorData = authorDoc.data();
              authorName = authorData.displayName || authorData.email || 'Unknown';
            }
          } catch (error) {
            logger.error('Error fetching author data', {
              context: { error, reportId: docSnapshot.id, authorId: reportData.authorId },
              category: LogCategory.ERROR
            });
          }
        }
        
        reportsData.push({
          id: docSnapshot.id,
          targetType: reportData.targetType || 'article',
          targetId: reportData.targetId || '',
          title: reportData.title || 'Untitled Content',
          reason: reportData.reason || '',
          status: reportData.status || 'pending',
          createdAt: reportData.createdAt?.toDate() || new Date(),
          createdBy: reportData.createdBy || '',
          resolvedAt: reportData.resolvedAt?.toDate(),
          resolvedBy: reportData.resolvedBy || '',
          resolution: reportData.resolution || '',
          authorId: reportData.authorId || '',
          authorName: authorName
        });
      }
      
      setReports(reportsData);
      setFilteredReports(reportsData.filter(report => report.status === 'pending'));
    } catch (error) {
      logger.error('Error fetching reports', {
        context: { error },
        category: LogCategory.ERROR
      });
      
      toast({
        title: 'Error',
        description: 'Failed to load reports. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    onViewOpen();
  };
  
  const handleResolveReport = (report: Report) => {
    setSelectedReport(report);
    setResolutionNote('');
    onResolveOpen();
  };
  
  const handleDismissReport = (report: Report) => {
    setSelectedReport(report);
    setResolutionNote('');
    onDismissOpen();
  };
  
  const confirmResolveReport = async () => {
    if (!selectedReport || !db) return;
    
    try {
      // Update the report
      const reportRef = doc(db, 'reports', selectedReport.id);
      await updateDoc(reportRef, {
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: 'admin', // In a real app, use the admin's user ID
        resolution: resolutionNote
      });
      
      // If it's an article, update the article's status
      if (selectedReport.targetType === 'article' && selectedReport.targetId) {
        const articleRef = doc(db, 'articles', selectedReport.targetId);
        await updateDoc(articleRef, {
          isFlagged: false,
          status: 'published', // Or whatever status is appropriate
          updatedAt: new Date(),
          moderationNote: resolutionNote
        });
      }
      
      // Update local state
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === selectedReport.id ? { 
            ...report, 
            status: 'resolved',
            resolvedAt: new Date(),
            resolvedBy: 'admin',
            resolution: resolutionNote
          } : report
        )
      );
      
      toast({
        title: 'Success',
        description: 'Report has been resolved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      logger.info('Report resolved', {
        context: { reportId: selectedReport.id, resolution: resolutionNote },
        category: LogCategory.DATA
      });
      
      onResolveClose();
    } catch (error) {
      logger.error('Error resolving report', {
        context: { error, reportId: selectedReport.id },
        category: LogCategory.ERROR
      });
      
      toast({
        title: 'Error',
        description: 'Failed to resolve report. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const confirmDismissReport = async () => {
    if (!selectedReport || !db) return;
    
    try {
      // Update the report
      const reportRef = doc(db, 'reports', selectedReport.id);
      await updateDoc(reportRef, {
        status: 'dismissed',
        resolvedAt: new Date(),
        resolvedBy: 'admin', // In a real app, use the admin's user ID
        resolution: resolutionNote
      });
      
      // If it's an article, update the article's status
      if (selectedReport.targetType === 'article' && selectedReport.targetId) {
        const articleRef = doc(db, 'articles', selectedReport.targetId);
        await updateDoc(articleRef, {
          isFlagged: false,
          updatedAt: new Date(),
          moderationNote: resolutionNote
        });
      }
      
      // Update local state
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === selectedReport.id ? { 
            ...report, 
            status: 'dismissed',
            resolvedAt: new Date(),
            resolvedBy: 'admin',
            resolution: resolutionNote
          } : report
        )
      );
      
      toast({
        title: 'Success',
        description: 'Report has been dismissed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      logger.info('Report dismissed', {
        context: { reportId: selectedReport.id, resolution: resolutionNote },
        category: LogCategory.DATA
      });
      
      onDismissClose();
    } catch (error) {
      logger.error('Error dismissing report', {
        context: { error, reportId: selectedReport.id },
        category: LogCategory.ERROR
      });
      
      toast({
        title: 'Error',
        description: 'Failed to dismiss report. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    let colorScheme;
    
    switch (status.toLowerCase()) {
      case 'resolved':
        colorScheme = 'green';
        break;
      case 'pending':
        colorScheme = 'yellow';
        break;
      case 'dismissed':
        colorScheme = 'gray';
        break;
      default:
        colorScheme = 'gray';
    }
    
    return (
      <Badge colorScheme={colorScheme}>
        {status}
      </Badge>
    );
  };
  
  const getTypeBadge = (type: string) => {
    let colorScheme;
    
    switch (type.toLowerCase()) {
      case 'article':
        colorScheme = 'blue';
        break;
      case 'user':
        colorScheme = 'purple';
        break;
      case 'comment':
        colorScheme = 'teal';
        break;
      case 'review':
        colorScheme = 'cyan';
        break;
      default:
        colorScheme = 'gray';
    }
    
    return (
      <Badge colorScheme={colorScheme}>
        {type}
      </Badge>
    );
  };
  
  return (
    <AdminLayout title="Content Moderation">
      <Box mb={6}>
        <HStack spacing={4}>
          <InputGroup flex="1">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input 
              placeholder="Search reports by title or reason" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          
          <Select 
            width="180px"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </Select>
          
          <Select 
            width="180px"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="article">Articles</option>
            <option value="user">Users</option>
            <option value="comment">Comments</option>
            <option value="review">Reviews</option>
          </Select>
        </HStack>
      </Box>
      
      {isLoading ? (
        <Center p={8}>
          <Spinner size="xl" />
        </Center>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Content</Th>
                <Th>Type</Th>
                <Th>Reason</Th>
                <Th>Status</Th>
                <Th>Reported</Th>
                <Th>Author</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map(report => (
                  <Tr key={report.id}>
                    <Td>
                      <Text fontWeight="medium" noOfLines={1}>
                        {report.title}
                      </Text>
                    </Td>
                    <Td>
                      {getTypeBadge(report.targetType)}
                    </Td>
                    <Td>
                      <Text noOfLines={1}>{report.reason}</Text>
                    </Td>
                    <Td>
                      {getStatusBadge(report.status)}
                    </Td>
                    <Td>{report.createdAt.toLocaleDateString()}</Td>
                    <Td>
                      <Text noOfLines={1}>{report.authorName}</Text>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem 
                            icon={<FiEye />} 
                            onClick={() => handleViewReport(report)}
                          >
                            View Details
                          </MenuItem>
                          {report.status === 'pending' && (
                            <>
                              <MenuItem 
                                icon={<FiCheck />} 
                                onClick={() => handleResolveReport(report)}
                              >
                                Resolve Report
                              </MenuItem>
                              <MenuItem 
                                icon={<FiX />} 
                                onClick={() => handleDismissReport(report)}
                              >
                                Dismiss Report
                              </MenuItem>
                            </>
                          )}
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={7} textAlign="center">
                    No reports found
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      )}
      
      {/* View Report Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Report Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedReport && (
              <Box>
                <Flex justify="space-between" align="center" mb={4}>
                  <Text fontWeight="bold" fontSize="lg">{selectedReport.title}</Text>
                  {getStatusBadge(selectedReport.status)}
                </Flex>
                
                <Text fontWeight="bold" mb={1}>Content Type</Text>
                <Text mb={4}>{getTypeBadge(selectedReport.targetType)}</Text>
                
                <Text fontWeight="bold" mb={1}>Reason for Report</Text>
                <Text mb={4}>{selectedReport.reason}</Text>
                
                <Text fontWeight="bold" mb={1}>Author</Text>
                <Text mb={4}>{selectedReport.authorName}</Text>
                
                <Text fontWeight="bold" mb={1}>Reported On</Text>
                <Text mb={4}>{selectedReport.createdAt.toLocaleString()}</Text>
                
                {selectedReport.status !== 'pending' && (
                  <>
                    <Text fontWeight="bold" mb={1}>Resolution</Text>
                    <Text mb={2}>{selectedReport.resolution || 'No resolution notes provided'}</Text>
                    
                    <Text fontWeight="bold" mb={1}>Resolved On</Text>
                    <Text mb={4}>{selectedReport.resolvedAt?.toLocaleString()}</Text>
                  </>
                )}
                
                {selectedReport.targetType === 'article' && (
                  <Link href={`/article/${selectedReport.targetId}`} passHref legacyBehavior>
                    <Button as={ChakraLink} colorScheme="blue" mt={4}>
                      View Content
                    </Button>
                  </Link>
                )}
                
                {selectedReport.targetType === 'user' && (
                  <Link href={`/admin/users?id=${selectedReport.targetId}`} passHref legacyBehavior>
                    <Button as={ChakraLink} colorScheme="blue" mt={4}>
                      View User
                    </Button>
                  </Link>
                )}
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            {selectedReport && selectedReport.status === 'pending' && (
              <>
                <Button colorScheme="green" mr={3} onClick={() => {
                  onViewClose();
                  handleResolveReport(selectedReport);
                }}>
                  Resolve
                </Button>
                <Button colorScheme="gray" mr={3} onClick={() => {
                  onViewClose();
                  handleDismissReport(selectedReport);
                }}>
                  Dismiss
                </Button>
              </>
            )}
            <Button onClick={onViewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Resolve Report Modal */}
      <Modal isOpen={isResolveOpen} onClose={onResolveClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Resolve Report</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Resolving this report will mark it as handled and update the content status. This indicates that action has been taken to address the reported issue.
            </Text>
            {selectedReport && (
              <Box mb={4}>
                <Text fontWeight="bold">{selectedReport.title}</Text>
                <Text>Type: {selectedReport.targetType}</Text>
                <Text>Reason: {selectedReport.reason}</Text>
              </Box>
            )}
            <FormControl>
              <FormLabel>Resolution Notes</FormLabel>
              <Textarea 
                value={resolutionNote} 
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Describe what action was taken to resolve this issue"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onResolveClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={confirmResolveReport}>
              Resolve
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Dismiss Report Modal */}
      <Modal isOpen={isDismissOpen} onClose={onDismissClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Dismiss Report</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Dismissing this report will mark it as handled but indicates that no action was needed. The content will remain unchanged.
            </Text>
            {selectedReport && (
              <Box mb={4}>
                <Text fontWeight="bold">{selectedReport.title}</Text>
                <Text>Type: {selectedReport.targetType}</Text>
                <Text>Reason: {selectedReport.reason}</Text>
              </Box>
            )}
            <FormControl>
              <FormLabel>Dismissal Notes</FormLabel>
              <Textarea 
                value={resolutionNote} 
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Explain why no action was needed for this report"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDismissClose}>
              Cancel
            </Button>
            <Button colorScheme="gray" onClick={confirmDismissReport}>
              Dismiss
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdminLayout>
  );
};

export default ContentModeration;
