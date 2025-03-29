import React from 'react';
import {
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Card,
  CardBody,
  useColorModeValue,
  Skeleton,
} from '@chakra-ui/react';

interface ProfileStatsProps {
  articlesCount: number;
  reviewsCount: number;
  isLoading?: boolean;
}

/**
 * Component to display user profile statistics
 * Accepts direct count values for better component isolation
 */
const ProfileStats: React.FC<ProfileStatsProps> = ({ 
  articlesCount, 
  reviewsCount, 
  isLoading = false
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
      <Card bg={cardBg}>
        <CardBody>
          <Stat>
            <StatLabel>Articles</StatLabel>
            <Skeleton isLoaded={!isLoading}>
              <StatNumber>{articlesCount}</StatNumber>
            </Skeleton>
          </Stat>
        </CardBody>
      </Card>
      
      <Card bg={cardBg}>
        <CardBody>
          <Stat>
            <StatLabel>Reviews</StatLabel>
            <Skeleton isLoaded={!isLoading}>
              <StatNumber>{reviewsCount}</StatNumber>
            </Skeleton>
          </Stat>
        </CardBody>
      </Card>
    </SimpleGrid>
  );
};

export default ProfileStats;
