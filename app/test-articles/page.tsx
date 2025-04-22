import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the ArticleTestComponent with no SSR
const ArticleTestComponent = dynamic(
  () => import('../../components/articles/ArticleTestComponent'),
  { ssr: false }
);

export default function TestArticlesPage() {
  return (
    <div className="container mx-auto py-8 bg-white min-h-screen">
      <h1 className="text-4xl font-bold text-green-700 mb-8 text-center">RESEARKA Article Test</h1>
      
      <Suspense fallback={
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-700"></div>
          <span className="sr-only">Loading...</span>
        </div>
      }>
        <ArticleTestComponent />
      </Suspense>
    </div>
  );
}
