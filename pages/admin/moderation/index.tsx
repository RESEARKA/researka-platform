"use client";

import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Badge,
  Flex,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react';
import { FiSearch, FiEye, FiCheckCircle, FiXCircle, FiAlertTriangle } from 'react-icons/fi';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useAuth } from '../../../hooks/useAuth';
import { collection, query, where, orderBy, limit, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from '../../../config/firebase';
import { FlaggedArticle, Flag, ModerationStatus } from '../../../types/moderation';
import { formatDistanceToNow } from 'date-fns';
import ModerationActionModal from '../../../components/moderation/ModerationActionModal';

const ModerationQueue = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [flaggedArticles, setFlaggedArticles] = useState<FlaggedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ModerationStatus | 'all'>('under_review');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<FlaggedArticle | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch flagged articles
  useEffect(() => {
    fetchFlaggedArticles();
  }, [statusFilter]);

  const fetchFlaggedArticles = async () => {
    try {
      setIsLoading(true);
      const db = getFirebaseFirestore();
      
      if (!db) {
        throw new Error('Firestore is not initialized');
      }

      // Query articles based on moderation status
      const articlesRef = collection(db, 'articles');
      let articlesQuery;
      
      if (statusFilter === 'all') {
        articlesQuery = query(
          articlesRef,
          where('flagCount', '>', 0),
          orderBy('flagCount', 'desc'),
          orderBy('lastFlaggedAt', 'desc'),
          limit(50)
        );
      } else {
        articlesQuery = query(
          articlesRef,
          where('moderationStatus', '==', statusFilter),
          orderBy('lastFlaggedAt', 'desc'),
          limit(50)
        );
      }

      const articlesSnapshot = await getDocs(articlesQuery);
      const articles: FlaggedArticle[] = [];

      // For each flagged article, get its flags
      for (const articleDoc of articlesSnapshot.docs) {
        const articleData = articleDoc.data();
        
        // Skip deleted articles
        if (articleData.isDeleted) continue;
        
        // Get flags for this article
        const flagsRef = collection(db, 'flags');
        const flagsQuery = query(
          flagsRef,
          where('articleId', '==', articleDoc.id),
          orderBy('timestamp', 'desc')
        );
        
        const flagsSnapshot = await getDocs(flagsQuery);
        const flags: Flag[] = flagsSnapshot.docs.map(flagDoc => {
          const flagData = flagDoc.data() as Omit<Flag, 'id'>;
          return {
            id: flagDoc.id,
            articleId: flagData.articleId,
            reportedBy: flagData.reportedBy,
            reason: flagData.reason,
            category: flagData.category,
            timestamp: flagData.timestamp,
            status: flagData.status,
            resolvedBy: flagData.resolvedBy,
            resolvedAt: flagData.resolvedAt,
            reviewedBy: flagData.reviewedBy,
            reviewNotes: flagData.reviewNotes
          };
        });
        
        articles.push({
          id: articleDoc.id,
          title: articleData.title,
          author: articleData.author || articleData.authorId,
          authorId: articleData.authorId,
          flagCount: articleData.flagCount || 0,
          moderationStatus: articleData.moderationStatus || 'active',
          lastFlaggedAt: articleData.lastFlaggedAt?.toDate() || new Date(),
          flags
        });
      }

      setFlaggedArticles(articles);
    } catch (error) {
      console.error('Error fetching flagged articles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load moderation queue',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerationAction = async (action: 'approve' | 'reject', notes: string) => {
    if (!selectedArticle) return;
    
    try {
      const db = getFirebaseFirestore();
      
      if (!db) {
        throw new Error('Firestore is not initialized');
      }
      
      const articleRef = doc(db, 'articles', selectedArticle.id);
      const articleSnap = await getDoc(articleRef);
      
      if (!articleSnap.exists()) {
        throw new Error('Article not found');
      }
      
      const newStatus: ModerationStatus = action === 'approve' ? 'active' : 'removed';
      
      await updateDoc(articleRef, {
        moderationStatus: newStatus,
        moderationNotes: notes,
        moderatedBy: user?.uid,
        moderatedAt: new Date()
      });
      
      // Update flags status
      if (selectedArticle.flags) {
        for (const flag of selectedArticle.flags) {
          const flagRef = doc(db, 'flags', flag.id);
          await updateDoc(flagRef, {
            status: action === 'approve' ? 'rejected' : 'accepted',
            resolvedBy: user?.uid,
            resolvedAt: new Date()
          });
        }
      }
      
      toast({
        title: action === 'approve' ? 'Article Approved' : 'Article Removed',
        description: action === 'approve' 
          ? 'The article has been approved and is now active' 
          : 'The article has been removed from the platform',
        status: action === 'approve' ? 'success' : 'info',
        duration: 5000,
        isClosable: true
      });
      
      // Refresh the list
      fetchFlaggedArticles();
      onClose();
    } catch (error) {
      console.error('Error updating article:', error);
      toast({
        title: 'Error',
        description: 'Failed to update article status',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleViewArticle = (article: FlaggedArticle) => {
    setSelectedArticle(article);
    onOpen();
  };

  // Filter articles by search query
  const filteredArticles = flaggedArticles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout title="Moderation Queue">
      <Box p={4}>
        <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
          <Heading as="h1" size="xl">Content Moderation</Heading>
          
          <Flex gap={4} align="center" wrap="wrap">
            <Select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ModerationStatus | 'all')}
              width="auto"
              minW="200px"
            >
              <option value="all">All Flagged Content</option>
              <option value="under_review">Under Review</option>
              <option value="active">Approved</option>
              <option value="removed">Removed</option>
            </Select>
            
            <InputGroup width="auto" minW="250px">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input 
                placeholder="Search by title or ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </Flex>
        </Flex>
        
        {isLoading ? (
          <Flex justify="center" align="center" minH="300px" direction="column" gap={4}>
            <Spinner size="xl" />
            <Text>Loading moderation queue...</Text>
          </Flex>
        ) : filteredArticles.length > 0 ? (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Status</Th>
                <Th isNumeric>Flags</Th>
                <Th>Last Flagged</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredArticles.map(article => (
                <Tr key={article.id}>
                  <Td maxW="300px" isTruncated title={article.title}>
                    {article.title}
                  </Td>
                  <Td>
                    <Badge colorScheme={
                      article.moderationStatus === 'active' ? 'green' : 
                      article.moderationStatus === 'under_review' ? 'yellow' : 
                      'red'
                    }>
                      {article.moderationStatus.replace('_', ' ')}
                    </Badge>
                  </Td>
                  <Td isNumeric>{article.flagCount}</Td>
                  <Td>
                    {formatDistanceToNow(new Date(article.lastFlaggedAt), { addSuffix: true })}
                  </Td>
                  <Td>
                    <Flex gap={2}>
                      <Tooltip label="View Details">
                        <IconButton
                          aria-label="View article details"
                          icon={<FiEye />}
                          size="sm"
                          onClick={() => window.open(`/admin/moderation/article/${article.id}`, '_blank')}
                        />
                      </Tooltip>
                      
                      {article.moderationStatus === 'under_review' && (
                        <>
                          <Tooltip label="Approve Article">
                            <IconButton
                              aria-label="Approve article"
                              icon={<FiCheckCircle />}
                              size="sm"
                              colorScheme="green"
                              onClick={() => handleViewArticle(article)}
                            />
                          </Tooltip>
                          
                          <Tooltip label="Remove Article">
                            <IconButton
                              aria-label="Remove article"
                              icon={<FiXCircle />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleViewArticle(article)}
                            />
                          </Tooltip>
                        </>
                      )}
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Flex 
            justify="center" 
            align="center" 
            minH="300px" 
            direction="column" 
            gap={4}
            p={8}
            borderWidth="1px"
            borderRadius="lg"
            bg="gray.50"
          >
            <FiAlertTriangle size={40} />
            <Heading as="h3" size="md">No Flagged Content</Heading>
            <Text align="center">
              {searchQuery 
                ? 'No articles match your search criteria' 
                : statusFilter === 'all' 
                  ? 'There are no flagged articles in the system' 
                  : `There are no articles with status "${statusFilter.replace('_', ' ')}"`
              }
            </Text>
          </Flex>
        )}
      </Box>
      
      {selectedArticle && (
        <ModerationActionModal
          isOpen={isOpen}
          onClose={onClose}
          article={selectedArticle}
          onAction={handleModerationAction}
        />
      )}
    </AdminLayout>
  );
};

export default ModerationQueue;
