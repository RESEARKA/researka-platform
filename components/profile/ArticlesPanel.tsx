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
import { Article, ArticlesResponse } from '../../hooks/useArticles';

interface ArticlesPanelProps {
  articlesData: ArticlesResponse | undefined;
  currentPage: number;
  onPageChange: (page: number) => void;
  EmptyState: React.FC<{ type: string }>;
  PaginationControl: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }>;
}

const ArticlesPanel: React.FC<ArticlesPanelProps> = ({
  articlesData,
  currentPage,
  onPageChange,
  EmptyState,
  PaginationControl,
}) => {
  return (
    <VStack spacing={4} align="stretch">
      {articlesData && articlesData.articles && articlesData.articles.length > 0 ? (
        articlesData.articles.map((article: Article) => (
          <Card key={article.id}>
            <CardHeader>
              <ResponsiveText variant="h3">{article.title}</ResponsiveText>
            </CardHeader>
            <CardBody>
              <ResponsiveText variant="body">{article.abstract}</ResponsiveText>
            </CardBody>
            <CardFooter>
              <Flex justify="space-between" width="100%">
                <Badge colorScheme="green">{article.status}</Badge>
                <ResponsiveText variant="caption">{article.date}</ResponsiveText>
              </Flex>
            </CardFooter>
          </Card>
        ))
      ) : (
        <EmptyState type="Articles" />
      )}
      
      {articlesData && articlesData.totalPages > 1 && (
        <PaginationControl 
          currentPage={currentPage} 
          totalPages={articlesData.totalPages} 
          onPageChange={onPageChange} 
        />
      )}
    </VStack>
  );
};

export default ArticlesPanel;
