import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  ButtonGroup,
  Button,
  Spinner,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge
} from '@chakra-ui/react';
import { collection, query, where, orderBy, getDocs, limit, Timestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from '../../config/firebase';
import { createLogger, LogCategory } from '../../utils/logger';
import { ActivityType } from '../../utils/activityTracker';

const logger = createLogger('user-activity-dashboard');

// Rate limiting for data fetching
const REFRESH_COOLDOWN_MS = 10000; // 10 seconds

interface ActivityMetric {
  type: string;
  count: number;
  uniqueUsers: number;
}

interface ActivityAggregate {
  id: string;
  date: Timestamp;
  metrics: ActivityMetric[];
  totalActivities: number;
  totalUniqueUsers: number;
  timestamp: Timestamp;
}

interface TopArticle {
  id: string;
  title: string;
  viewCount: number;
  commentCount: number;
}

const UserActivityDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [activityData, setActivityData] = useState<ActivityAggregate[]>([]);
  const [topArticles, setTopArticles] = useState<TopArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefresh, setLastRefresh] = useState<number | null>(null);
  const toast = useToast();
  
  // Fetch data based on selected time range
  useEffect(() => {
    fetchActivityData(timeRange);
  }, [timeRange]);
  
  const fetchActivityData = async (range: '7d' | '30d' | '90d') => {
    // Rate limiting
    if (lastRefresh && Date.now() - lastRefresh < REFRESH_COOLDOWN_MS) {
      toast({
        title: 'Please wait',
        description: `You can refresh again in ${Math.ceil((REFRESH_COOLDOWN_MS - (Date.now() - lastRefresh)) / 1000)} seconds`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    setLastRefresh(Date.now());
    
    try {
      const db = getFirebaseFirestore();
      if (!db) throw new Error('Firestore not initialized');
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch(range) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
      }
      
      // Query aggregated data
      const aggregatesQuery = query(
        collection(db, 'activityAggregates'),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      );
      
      const aggregatesSnapshot = await getDocs(aggregatesQuery);
      const aggregatedData = aggregatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ActivityAggregate[];
      
      setActivityData(aggregatedData);
      
      // Fetch top articles (most viewed)
      const topArticlesQuery = query(
        collection(db, 'articles'),
        orderBy('viewCount', 'desc'),
        limit(10)
      );
      
      const topArticlesSnapshot = await getDocs(topArticlesQuery);
      const topArticlesData = topArticlesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TopArticle[];
      
      setTopArticles(topArticlesData);
      
      logger.info('Fetched activity data', {
        context: { 
          timeRange: range,
          aggregatesCount: aggregatedData.length,
          topArticlesCount: topArticlesData.length
        },
        category: LogCategory.DATA
      });
      
    } catch (error) {
      logger.error('Error fetching activity data', {
        context: { timeRange: range, error },
        category: LogCategory.ERROR
      });
      
      toast({
        title: 'Error',
        description: 'Failed to load activity data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate metrics from the data
  const calculateMetrics = () => {
    if (!activityData.length) return null;
    
    // Calculate totals and trends
    let totalViews = 0;
    let totalSignups = 0;
    let totalArticles = 0;
    
    activityData.forEach(day => {
      day.metrics.forEach(metric => {
        if (metric.type === ActivityType.ARTICLE_VIEW) {
          totalViews += metric.count;
        } else if (metric.type === ActivityType.SIGNUP) {
          totalSignups += metric.count;
        } else if (metric.type === ActivityType.ARTICLE_CREATE) {
          totalArticles += metric.count;
        }
      });
    });
    
    // Calculate engagement rate (views per user)
    const totalUniqueUsers = activityData.reduce((sum, day) => sum + day.totalUniqueUsers, 0);
    
    const engagementRate = totalUniqueUsers > 0 
      ? Math.round((totalViews / totalUniqueUsers) * 100) / 100
      : 0;
    
    return {
      totalViews,
      totalSignups,
      totalArticles,
      engagementRate,
      // Calculate trends (compare to previous period)
      viewsTrend: calculateTrend(ActivityType.ARTICLE_VIEW),
      signupsTrend: calculateTrend(ActivityType.SIGNUP),
      articlesTrend: calculateTrend(ActivityType.ARTICLE_CREATE)
    };
  };
  
  // Helper to calculate trend percentage
  const calculateTrend = (activityType: ActivityType) => {
    if (activityData.length < 2) return 0;
    
    const midpoint = Math.floor(activityData.length / 2);
    const recentData = activityData.slice(midpoint);
    const previousData = activityData.slice(0, midpoint);
    
    const recentTotal = recentData.reduce((sum, day) => {
      const metric = day.metrics.find(m => m.type === activityType);
      return sum + (metric ? metric.count : 0);
    }, 0);
    
    const previousTotal = previousData.reduce((sum, day) => {
      const metric = day.metrics.find(m => m.type === activityType);
      return sum + (metric ? metric.count : 0);
    }, 0);
    
    if (previousTotal === 0) return recentTotal > 0 ? 100 : 0;
    
    return Math.round(((recentTotal - previousTotal) / previousTotal) * 100);
  };
  
  const metrics = calculateMetrics();
  
  // Format date for display
  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <Box>
      <Heading size="lg" mb={5}>User Activity Dashboard</Heading>
      
      {/* Time range selector */}
      <Flex mb={5} justify="space-between" align="center">
        <ButtonGroup isAttached>
          <Button 
            colorScheme={timeRange === '7d' ? 'blue' : 'gray'}
            onClick={() => setTimeRange('7d')}
          >
            Last 7 Days
          </Button>
          <Button 
            colorScheme={timeRange === '30d' ? 'blue' : 'gray'}
            onClick={() => setTimeRange('30d')}
          >
            Last 30 Days
          </Button>
          <Button 
            colorScheme={timeRange === '90d' ? 'blue' : 'gray'}
            onClick={() => setTimeRange('90d')}
          >
            Last 90 Days
          </Button>
        </ButtonGroup>
        
        <Button 
          colorScheme="blue" 
          onClick={() => fetchActivityData(timeRange)}
          isLoading={isLoading}
        >
          Refresh
        </Button>
      </Flex>
      
      {isLoading ? (
        <Flex justify="center" align="center" h="400px">
          <Spinner size="xl" />
        </Flex>
      ) : !metrics ? (
        <Box p={5} textAlign="center">
          <Text fontSize="xl">No activity data available for the selected period</Text>
          <Text mt={2} color="gray.600">
            Activity data is aggregated daily. Check back tomorrow or try a different time range.
          </Text>
        </Box>
      ) : (
        <>
          {/* Activity metrics */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={8}>
            <Stat p={5} shadow="md" border="1px" borderColor="gray.200" borderRadius="md">
              <StatLabel>Article Views</StatLabel>
              <StatNumber>{metrics.totalViews.toLocaleString()}</StatNumber>
              <StatHelpText>
                <StatArrow type={metrics.viewsTrend >= 0 ? 'increase' : 'decrease'} />
                {Math.abs(metrics.viewsTrend)}%
              </StatHelpText>
            </Stat>
            
            <Stat p={5} shadow="md" border="1px" borderColor="gray.200" borderRadius="md">
              <StatLabel>New Users</StatLabel>
              <StatNumber>{metrics.totalSignups.toLocaleString()}</StatNumber>
              <StatHelpText>
                <StatArrow type={metrics.signupsTrend >= 0 ? 'increase' : 'decrease'} />
                {Math.abs(metrics.signupsTrend)}%
              </StatHelpText>
            </Stat>
            
            <Stat p={5} shadow="md" border="1px" borderColor="gray.200" borderRadius="md">
              <StatLabel>New Articles</StatLabel>
              <StatNumber>{metrics.totalArticles.toLocaleString()}</StatNumber>
              <StatHelpText>
                <StatArrow type={metrics.articlesTrend >= 0 ? 'increase' : 'decrease'} />
                {Math.abs(metrics.articlesTrend)}%
              </StatHelpText>
            </Stat>
            
            <Stat p={5} shadow="md" border="1px" borderColor="gray.200" borderRadius="md">
              <StatLabel>Engagement Rate</StatLabel>
              <StatNumber>{metrics.engagementRate.toFixed(2)}</StatNumber>
              <StatHelpText>Views per user</StatHelpText>
            </Stat>
          </SimpleGrid>
          
          {/* Top content */}
          <Box p={5} shadow="md" border="1px" borderColor="gray.200" borderRadius="md" mb={8}>
            <Heading size="md" mb={4}>Top Content</Heading>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Title</Th>
                  <Th isNumeric>Views</Th>
                  <Th isNumeric>Comments</Th>
                </Tr>
              </Thead>
              <Tbody>
                {topArticles.length === 0 ? (
                  <Tr>
                    <Td colSpan={3} textAlign="center">No article data available</Td>
                  </Tr>
                ) : (
                  topArticles.map(article => (
                    <Tr key={article.id}>
                      <Td>{article.title || 'Untitled'}</Td>
                      <Td isNumeric>{article.viewCount || 0}</Td>
                      <Td isNumeric>{article.commentCount || 0}</Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
          
          {/* Activity log */}
          <Box p={5} shadow="md" border="1px" borderColor="gray.200" borderRadius="md">
            <Heading size="md" mb={4}>Activity Timeline</Heading>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Total Activities</Th>
                  <Th>Unique Users</Th>
                  <Th>Top Activity</Th>
                </Tr>
              </Thead>
              <Tbody>
                {activityData.length === 0 ? (
                  <Tr>
                    <Td colSpan={4} textAlign="center">No activity data available</Td>
                  </Tr>
                ) : (
                  activityData.map(day => {
                    // Find the activity with the highest count
                    const topActivity = day.metrics.reduce(
                      (max, current) => current.count > max.count ? current : max,
                      { type: 'none', count: 0, uniqueUsers: 0 }
                    );
                    
                    return (
                      <Tr key={day.id}>
                        <Td>{formatDate(day.date)}</Td>
                        <Td>{day.totalActivities}</Td>
                        <Td>{day.totalUniqueUsers}</Td>
                        <Td>
                          <Badge colorScheme="blue">
                            {topActivity.type} ({topActivity.count})
                          </Badge>
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </Tbody>
            </Table>
          </Box>
        </>
      )}
    </Box>
  );
};

export default UserActivityDashboard;
