import React from 'react';
import {
  VStack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Flex,
} from '@chakra-ui/react';
import ResponsiveText from '../ResponsiveText';

interface SavedItem {
  id: number;
  title: string;
  abstract: string;
  date: string;
}

interface SavedItemsPanelProps {
  savedItems: SavedItem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  EmptyState: React.FC<{ type: string }>;
  PaginationControl: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }>;
}

const SavedItemsPanel: React.FC<SavedItemsPanelProps> = ({
  savedItems,
  currentPage,
  totalPages,
  onPageChange,
  EmptyState,
  PaginationControl,
}) => {
  return (
    <VStack spacing={4} align="stretch">
      {savedItems.length > 0 ? (
        savedItems.map((item: SavedItem) => (
          <Card key={item.id}>
            <CardHeader>
              <ResponsiveText variant="h3">{item.title}</ResponsiveText>
            </CardHeader>
            <CardBody>
              <ResponsiveText variant="body">{item.abstract}</ResponsiveText>
            </CardBody>
            <CardFooter>
              <Flex justify="space-between" width="100%">
                <Badge>Saved</Badge>
                <ResponsiveText variant="caption">Saved on {item.date}</ResponsiveText>
              </Flex>
            </CardFooter>
          </Card>
        ))
      ) : (
        <EmptyState type="Saved Items" />
      )}
      
      {totalPages > 1 && (
        <PaginationControl 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={onPageChange} 
        />
      )}
    </VStack>
  );
};

export default SavedItemsPanel;
