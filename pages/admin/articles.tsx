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
  FiEdit
} from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import { collection, query, getDocs, doc, updateDoc, where, orderBy, limit, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { createLogger, LogCategory } from '../../utils/logger';
import Link from 'next/link';

const logger = createLogger('admin-articles');

interface Article {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  status: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  viewCount: number;
  reviewCount: number;
  abstract?: string;
}

const ArticleManagement: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [newStatus, setNewStatus] = useState('');
  
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isFlagOpen, onOpen: onFlagOpen, onClose: onFlagClose } = useDisclosure();
  
  const toast = useToast();
  
  useEffect(() => {
    fetchArticles();
  }, []);
  
  useEffect(() => {
    let filtered = articles;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(article => article.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.author.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredArticles(filtered);
  }, [searchQuery, statusFilter, articles]);
  
  const fetchArticles = async () => {
    try {
      if (!db) {
        logger.error('Firestore not initialized', {
          category: LogCategory.ERROR
        });
        return;
      }
      
      const articlesQuery = query(
        collection(db, 'articles'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      
      const articlesSnapshot = await getDocs(articlesQuery);
      const articlesData: Article[] = [];
      
      for (const docSnapshot of articlesSnapshot.docs) {
        const articleData = docSnapshot.data();
        
        // Fetch author information
        let authorName = 'Unknown';
        let authorEmail = '';
        
        if (articleData.authorId) {
          try {
            const authorDoc = await getDoc(doc(db, 'users', articleData.authorId));
            if (authorDoc.exists()) {
              const authorData = authorDoc.data();
              authorName = authorData.displayName || authorData.email || 'Unknown';
              authorEmail = authorData.email || '';
            }
          } catch (error) {
            logger.error('Error fetching author data', {
              context: { error, articleId: docSnapshot.id, authorId: articleData.authorId },
              category: LogCategory.ERROR
            });
          }
        }
        
        articlesData.push({
          id: docSnapshot.id,
          title: articleData.title || 'Untitled Article',
          author: {
            id: articleData.authorId || '',
            name: authorName,
            email: authorEmail
          },
          status: articleData.status || 'draft',
          createdAt: articleData.createdAt?.toDate() || new Date(),
          updatedAt: articleData.updatedAt?.toDate() || new Date(),
          isActive: articleData.isActive !== false, // Default to true if not specified
          viewCount: articleData.viewCount || 0,
          reviewCount: articleData.reviewCount || 0,
          abstract: articleData.abstract || ''
        });
      }
      
      setArticles(articlesData);
      setFilteredArticles(articlesData);
    } catch (error) {
      logger.error('Error fetching articles', {
        context: { error },
        category: LogCategory.ERROR
      });
      
      toast({
        title: 'Error',
        description: 'Failed to load articles. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewArticle = (article: Article) => {
    setSelectedArticle(article);
    onViewOpen();
  };
  
  const handleEditStatus = (article: Article) => {
    setSelectedArticle(article);
    setNewStatus(article.status);
    onEditOpen();
  };
  
  const handleDeleteArticle = (article: Article) => {
    setSelectedArticle(article);
    setActionReason('');
    onDeleteOpen();
  };
  
  const handleFlagArticle = (article: Article) => {
    setSelectedArticle(article);
    setActionReason('');
    onFlagOpen();
  };
  
  const confirmEditStatus = async () => {
    if (!selectedArticle || !db) return;
    
    try {
      const articleRef = doc(db, 'articles', selectedArticle.id);
      await updateDoc(articleRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Update local state
      setArticles(prevArticles => 
        prevArticles.map(article => 
          article.id === selectedArticle.id ? { ...article, status: newStatus, updatedAt: new Date() } : article
        )
      );
      
      toast({
        title: 'Success',
        description: `Article status updated to ${newStatus}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      logger.info('Article status updated', {
        context: { articleId: selectedArticle.id, newStatus },
        category: LogCategory.DATA
      });
      
      onEditClose();
    } catch (error) {
      logger.error('Error updating article status', {
        context: { error, articleId: selectedArticle.id },
        category: LogCategory.ERROR
      });
      
      toast({
        title: 'Error',
        description: 'Failed to update article status. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const confirmDeleteArticle = async () => {
    if (!selectedArticle || !db) return;
    
    try {
      // In a real application, you might want to:
      // 1. Archive the article data instead of deleting it
      // 2. Remove associated reviews and comments
      // 3. Log the deletion for compliance purposes
      
      // For now, we'll just update the article record to mark it as deleted
      const articleRef = doc(db, 'articles', selectedArticle.id);
      await updateDoc(articleRef, {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
        deletedReason: actionReason,
        updatedAt: new Date()
      });
      
      // Remove from local state
      setArticles(prevArticles => 
        prevArticles.filter(article => article.id !== selectedArticle.id)
      );
      
      toast({
        title: 'Success',
        description: 'Article has been deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      logger.info('Article marked as deleted', {
        context: { articleId: selectedArticle.id, reason: actionReason },
        category: LogCategory.DATA
      });
      
      onDeleteClose();
    } catch (error) {
      logger.error('Error deleting article', {
        context: { error, articleId: selectedArticle.id },
        category: LogCategory.ERROR
      });
      
      toast({
        title: 'Error',
        description: 'Failed to delete article. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const confirmFlagArticle = async () => {
    if (!selectedArticle || !db) return;
    
    try {
      // Create a report for this article
      const reportsCollection = collection(db, 'reports');
      const reportData = {
        targetType: 'article',
        targetId: selectedArticle.id,
        reason: actionReason,
        status: 'pending',
        createdAt: new Date(),
        createdBy: 'admin', // In a real app, use the admin's user ID
        title: selectedArticle.title,
        authorId: selectedArticle.author.id
      };
      
      // Update the article to mark it as flagged
      const articleRef = doc(db, 'articles', selectedArticle.id);
      await updateDoc(articleRef, {
        isFlagged: true,
        flaggedAt: new Date(),
        flaggedReason: actionReason,
        updatedAt: new Date()
      });
      
      // Update local state
      setArticles(prevArticles => 
        prevArticles.map(article => 
          article.id === selectedArticle.id ? { ...article, status: 'flagged', updatedAt: new Date() } : article
        )
      );
      
      toast({
        title: 'Success',
        description: 'Article has been flagged for review',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      logger.info('Article flagged for review', {
        context: { articleId: selectedArticle.id, reason: actionReason },
        category: LogCategory.DATA
      });
      
      onFlagClose();
    } catch (error) {
      logger.error('Error flagging article', {
        context: { error, articleId: selectedArticle.id },
        category: LogCategory.ERROR
      });
      
      toast({
        title: 'Error',
        description: 'Failed to flag article. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    let colorScheme;
    
    switch (status.toLowerCase()) {
      case 'published':
        colorScheme = 'green';
        break;
      case 'draft':
        colorScheme = 'gray';
        break;
      case 'under review':
        colorScheme = 'blue';
        break;
      case 'rejected':
        colorScheme = 'red';
        break;
      case 'flagged':
        colorScheme = 'orange';
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
  
  return (
    <AdminLayout title="Article Management">
      <Box mb={6}>
        <HStack spacing={4}>
          <InputGroup flex="1">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input 
              placeholder="Search articles by title or author" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          
          <Select 
            width="200px"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="under review">Under Review</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
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
                <Th>Title</Th>
                <Th>Author</Th>
                <Th>Status</Th>
                <Th>Created</Th>
                <Th>Updated</Th>
                <Th>Stats</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredArticles.length > 0 ? (
                filteredArticles.map(article => (
                  <Tr key={article.id}>
                    <Td>
                      <Link href={`/article/${article.id}`} passHref legacyBehavior>
                        <ChakraLink fontWeight="medium">
                          {article.title}
                        </ChakraLink>
                      </Link>
                    </Td>
                    <Td>
                      <Box>
                        <Text>{article.author.name}</Text>
                        <Text fontSize="sm" color="gray.500">{article.author.email}</Text>
                      </Box>
                    </Td>
                    <Td>
                      {getStatusBadge(article.status)}
                    </Td>
                    <Td>{article.createdAt.toLocaleDateString()}</Td>
                    <Td>{article.updatedAt.toLocaleDateString()}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Tooltip label="Views">
                          <Badge colorScheme="blue">{article.viewCount}</Badge>
                        </Tooltip>
                        <Tooltip label="Reviews">
                          <Badge colorScheme="green">{article.reviewCount}</Badge>
                        </Tooltip>
                      </HStack>
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
                            onClick={() => handleViewArticle(article)}
                          >
                            View Details
                          </MenuItem>
                          <MenuItem 
                            icon={<FiEdit />} 
                            onClick={() => handleEditStatus(article)}
                          >
                            Change Status
                          </MenuItem>
                          <MenuItem 
                            icon={<FiFlag />} 
                            onClick={() => handleFlagArticle(article)}
                          >
                            Flag Content
                          </MenuItem>
                          <MenuItem 
                            icon={<FiTrash2 />} 
                            color="red.500"
                            onClick={() => handleDeleteArticle(article)}
                          >
                            Delete Article
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={7} textAlign="center">
                    No articles found
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      )}
      
      {/* View Article Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Article Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedArticle && (
              <Box>
                <Heading size="md" mb={2}>{selectedArticle.title}</Heading>
                <Text mb={4}>
                  <Badge colorScheme={
                    selectedArticle.status === 'published' ? 'green' :
                    selectedArticle.status === 'under review' ? 'blue' :
                    selectedArticle.status === 'rejected' ? 'red' :
                    selectedArticle.status === 'flagged' ? 'orange' :
                    'gray'
                  }>
                    {selectedArticle.status}
                  </Badge>
                </Text>
                
                <Text fontWeight="bold" mb={1}>Author</Text>
                <Text mb={4}>{selectedArticle.author.name} ({selectedArticle.author.email})</Text>
                
                <Text fontWeight="bold" mb={1}>Abstract</Text>
                <Text mb={4}>{selectedArticle.abstract || 'No abstract available'}</Text>
                
                <Text fontWeight="bold" mb={1}>Created</Text>
                <Text mb={2}>{selectedArticle.createdAt.toLocaleString()}</Text>
                
                <Text fontWeight="bold" mb={1}>Last Updated</Text>
                <Text mb={4}>{selectedArticle.updatedAt.toLocaleString()}</Text>
                
                <Text fontWeight="bold" mb={1}>Statistics</Text>
                <HStack mb={4}>
                  <Badge colorScheme="blue">{selectedArticle.viewCount} views</Badge>
                  <Badge colorScheme="green">{selectedArticle.reviewCount} reviews</Badge>
                </HStack>
                
                <Link href={`/article/${selectedArticle.id}`} passHref legacyBehavior>
                  <Button as={ChakraLink} colorScheme="blue" mt={4}>
                    View Full Article
                  </Button>
                </Link>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onViewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Edit Status Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Article Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedArticle && (
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="under review">Under Review</option>
                  <option value="published">Published</option>
                  <option value="rejected">Rejected</option>
                  <option value="flagged">Flagged</option>
                </Select>
              </FormControl>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={confirmEditStatus}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Delete Article Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Article</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Are you sure you want to delete this article? This action cannot be undone.
            </Text>
            {selectedArticle && (
              <Box mb={4}>
                <Text fontWeight="bold">{selectedArticle.title}</Text>
                <Text>Author: {selectedArticle.author.name}</Text>
              </Box>
            )}
            <FormControl>
              <FormLabel>Reason for deletion</FormLabel>
              <Textarea 
                value={actionReason} 
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Please provide a reason for this action"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmDeleteArticle}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Flag Article Modal */}
      <Modal isOpen={isFlagOpen} onClose={onFlagClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Flag Article for Review</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Flagging this article will mark it for content moderation review. The article will remain visible but will be tagged as under review.
            </Text>
            {selectedArticle && (
              <Box mb={4}>
                <Text fontWeight="bold">{selectedArticle.title}</Text>
                <Text>Author: {selectedArticle.author.name}</Text>
              </Box>
            )}
            <FormControl>
              <FormLabel>Reason for flagging</FormLabel>
              <Textarea 
                value={actionReason} 
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Please provide a reason for this action"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onFlagClose}>
              Cancel
            </Button>
            <Button colorScheme="orange" onClick={confirmFlagArticle}>
              Flag Article
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdminLayout>
  );
};

export default ArticleManagement;
