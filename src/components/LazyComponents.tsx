import React, { lazy, Suspense } from 'react';

// Loading component
const LoadingFallback = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
  </div>
);

// Lazy load components
export const LazyArticleCard = lazy(() => import('./ArticleCard'));
export const LazyReviewForm = lazy(() => import('./ReviewForm'));
export const LazyCommentSection = lazy(() => import('./CommentSection'));
export const LazyPdfViewer = lazy(() => import('./PdfViewer'));
export const LazyMarkdownEditor = lazy(() => import('./MarkdownEditor'));
export const LazyArticleSubmissionForm = lazy(() => import('./ArticleSubmissionForm'));

// Wrapper component with Suspense
interface LazyComponentProps {
  component: React.LazyExoticComponent<any>;
  props?: any;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({ component: Component, props }) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
};

// Usage example:
// <LazyComponent component={LazyArticleCard} props={{ article: article }} />
