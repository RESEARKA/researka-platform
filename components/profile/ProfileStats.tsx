import React from 'react';
import {
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Card,
  CardBody,
  useColorModeValue,
} from '@chakra-ui/react';

interface ProfileStatsProps {
  articlesCount: number;
  reviewsCount: number;
  reputation: number;
}

/**
 * Component to display user profile statistics
 * Accepts direct count values for better component isolation
 */
const ProfileStats: React.FC<ProfileStatsProps> = ({ 
  articlesCount, 
  reviewsCount, 
  reputation 
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  
  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
      <Card bg={cardBg}>
        <CardBody>
          <Stat>
            <StatLabel>Articles</StatLabel>
            <StatNumber>{articlesCount}</StatNumber>
          </Stat>
        </CardBody>
      </Card>
      
      <Card bg={cardBg}>
        <CardBody>
          <Stat>
            <StatLabel>Reviews</StatLabel>
            <StatNumber>{reviewsCount}</StatNumber>
          </Stat>
        </CardBody>
      </Card>
      
      <Card bg={cardBg}>
        <CardBody>
          <Stat>
            <StatLabel>Reputation</StatLabel>
            <StatNumber>{reputation}</StatNumber>
          </Stat>
        </CardBody>
      </Card>
    </SimpleGrid>
  );
};

export default ProfileStats;
