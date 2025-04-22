import React from 'react';
import Layout from '../../components/Layout';
import ArticleDetailPage from './[id]';

/**
 * Wrapper component for article detail page
 * This component is used to wrap the article detail page with the layout component
 * to provide the navigation bar and other layout elements
 */
const ArticleDetailPageWrapper: React.FC = () => {
  return (
    <Layout title="Article | Researka" activePage="articles">
      <ArticleDetailPage />
    </Layout>
  );
};

export default ArticleDetailPageWrapper;
