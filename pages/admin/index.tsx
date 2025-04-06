import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Heading,
  Text,
  Flex,
  Icon,
  Divider,
  Card,
  CardBody,
  Stack,
  StackDivider,
  Badge,
  Spinner,
  Center,
  useColorModeValue
} from '@chakra-ui/react';
import { FiUsers, FiFileText, FiAlertTriangle, FiCheckSquare } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { createLogger, LogCategory } from '../../utils/logger';

const logger = createLogger('admin-dashboard');

interface StatCardProps {
  title: string;
  stat: string | number;
  icon: React.ReactElement;
  helpText?: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, stat, icon, helpText, isLoading = false }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  
  return (
    <Stat
      px={4}
      py={5}
      bg={bgColor}
      shadow="base"
      rounded="lg"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <Flex justifyContent="space-between">
        <Box pl={2}>
          <StatLabel fontWeight="medium" isTruncated>
            {title}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="medium">
            {isLoading ? <Spinner size="sm" /> : stat}
          </StatNumber>
          {helpText && (
            <StatHelpText fontSize="sm">
              {helpText}
            </StatHelpText>
          )}
        </Box>
        <Box
          my="auto"
          color={useColorModeValue('gray.800', 'gray.200')}
          alignContent="center"
        >
          {icon}
        </Box>
      </Flex>
    </Stat>
  );
};

interface RecentActivityItem {
  id: string;
  type: 'user' | 'article' | 'review';
  title: string;
  timestamp: Date;
  status?: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArticles: 0,
    pendingReviews: 0,
    flaggedContent: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!db) {
          logger.error('Firestore not initialized', {
            category: LogCategory.ERROR
          });
          return;
        }
        
        // Get total users count
        const usersSnapshot = await getCountFromServer(collection(db, 'users'));
        const totalUsers = usersSnapshot.data().count;
        
        // Get total articles count
        const articlesSnapshot = await getCountFromServer(collection(db, 'articles'));
        const totalArticles = articlesSnapshot.data().count;
        
        // Get pending reviews count
        const pendingReviewsQuery = query(
          collection(db, 'reviews'),
          where('status', '==', 'pending')
        );
        const pendingReviewsSnapshot = await getCountFromServer(pendingReviewsQuery);
        const pendingReviews = pendingReviewsSnapshot.data().count;
        
        // Get flagged content count
        const flaggedContentQuery = query(
          collection(db, 'reports'),
          where('status', '==', 'pending')
        );
        const flaggedContentSnapshot = await getCountFromServer(flaggedContentQuery);
        const flaggedContent = flaggedContentSnapshot.data().count;
        
        setStats({
          totalUsers,
          totalArticles,
          pendingReviews,
          flaggedContent
        });
        
        // Fetch recent activity
        const recentActivityItems: RecentActivityItem[] = [];
        
        // Recent users
        const recentUsersQuery = query(
          collection(db, 'users'),
          // Order by creation date, limit to 3
          where('createdAt', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
        );
        const recentUsersSnapshot = await getDocs(recentUsersQuery);
        recentUsersSnapshot.forEach(doc => {
          const userData = doc.data();
          recentActivityItems.push({
            id: doc.id,
            type: 'user',
            title: userData.displayName || userData.email || 'Unknown User',
            timestamp: userData.createdAt?.toDate() || new Date(),
            status: 'New Registration'
          });
        });
        
        // Recent articles
        const recentArticlesQuery = query(
          collection(db, 'articles'),
          // Order by creation date, limit to 3
          where('createdAt', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
        );
        const recentArticlesSnapshot = await getDocs(recentArticlesQuery);
        recentArticlesSnapshot.forEach(doc => {
          const articleData = doc.data();
          recentActivityItems.push({
            id: doc.id,
            type: 'article',
            title: articleData.title || 'Untitled Article',
            timestamp: articleData.createdAt?.toDate() || new Date(),
            status: articleData.status || 'Submitted'
          });
        });
        
        // Sort by timestamp (newest first) and limit to 5
        recentActivityItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setRecentActivity(recentActivityItems.slice(0, 5));
        
      } catch (error) {
        logger.error('Error fetching admin dashboard stats', {
          context: { error },
          category: LogCategory.ERROR
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  return (
    <AdminLayout title="Admin Dashboard">
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard
          title="Total Users"
          stat={stats.totalUsers}
          icon={<Icon as={FiUsers} w={8} h={8} />}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Articles"
          stat={stats.totalArticles}
          icon={<Icon as={FiFileText} w={8} h={8} />}
          isLoading={isLoading}
        />
        <StatCard
          title="Pending Reviews"
          stat={stats.pendingReviews}
          icon={<Icon as={FiCheckSquare} w={8} h={8} />}
          isLoading={isLoading}
        />
        <StatCard
          title="Flagged Content"
          stat={stats.flaggedContent}
          icon={<Icon as={FiAlertTriangle} w={8} h={8} />}
          isLoading={isLoading}
        />
      </SimpleGrid>
      
      <Divider my={8} />
      
      <Box>
        <Heading size="md" mb={4}>Recent Activity</Heading>
        
        {isLoading ? (
          <Center p={8}>
            <Spinner size="lg" />
          </Center>
        ) : recentActivity.length > 0 ? (
          <Card>
            <CardBody>
              <Stack divider={<StackDivider />} spacing={4}>
                {recentActivity.map(item => (
                  <Box key={item.id}>
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Heading size="xs" textTransform="uppercase">
                          {item.type === 'user' ? 'New User' : 
                           item.type === 'article' ? 'Article' : 'Review'}
                        </Heading>
                        <Text pt={2} fontSize="sm">
                          {item.title}
                        </Text>
                      </Box>
                      <Flex direction="column" align="flex-end">
                        <Badge colorScheme={
                          item.status === 'New Registration' ? 'green' :
                          item.status === 'Submitted' ? 'blue' :
                          item.status === 'pending' ? 'yellow' :
                          'gray'
                        }>
                          {item.status}
                        </Badge>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
                        </Text>
                      </Flex>
                    </Flex>
                  </Box>
                ))}
              </Stack>
            </CardBody>
          </Card>
        ) : (
          <Text>No recent activity found.</Text>
        )}
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboard;
