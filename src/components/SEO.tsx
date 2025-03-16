import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  type?: string;
  // Google Scholar specific props
  isArticle?: boolean;
  authors?: string[];
  publicationDate?: string;
  pdfUrl?: string;
  doi?: string;
  journalName?: string;
  volume?: string;
  issue?: string;
  firstPage?: string;
  lastPage?: string;
}

export function SEO({
  title = 'Researka - Decentralizing Academic Research',
  description = 'Researka is a decentralized academic publishing platform that leverages blockchain technology to create a more transparent, accessible, and equitable scholarly communication system.',
  keywords = 'academic publishing, blockchain, decentralized science, open access, peer review',
  canonical,
  image = '/images/og-image.jpg',
  type = 'website',
  // Google Scholar specific props
  isArticle = false,
  authors = [],
  publicationDate,
  pdfUrl,
  doi,
  journalName = 'Researka',
  volume,
  issue,
  firstPage,
  lastPage
}: SEOProps) {
  const router = useLocation();
  const canonicalUrl = canonical || `https://researka.io${router.pathname}`;
  const siteUrl = window.location.origin;
  
  // Format date for Google Scholar (YYYY/MM/DD)
  const formattedDate = publicationDate ? new Date(publicationDate).toISOString().split('T')[0].replace(/-/g, '/') : '';
  
  return (
    <Helmet>
      {/* Basic metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={`${siteUrl}${image}`} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Researka" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${image}`} />
      
      {/* App metadata */}
      <meta name="application-name" content="Researka" />
      <meta name="apple-mobile-web-app-title" content="Researka" />
      <meta name="theme-color" content="#3B82F6" />
      
      {/* Google Scholar metadata - only added for article pages */}
      {isArticle && (
        <>
          <meta name="citation_title" content={title.replace(' | Researka', '')} />
          {authors.map((author, index) => (
            <meta key={`author-${index}`} name="citation_author" content={author} />
          ))}
          {publicationDate && <meta name="citation_publication_date" content={formattedDate} />}
          <meta name="citation_journal_title" content={journalName} />
          {doi && <meta name="citation_doi" content={doi} />}
          {pdfUrl && <meta name="citation_pdf_url" content={pdfUrl.startsWith('http') ? pdfUrl : `${siteUrl}${pdfUrl}`} />}
          {volume && <meta name="citation_volume" content={volume} />}
          {issue && <meta name="citation_issue" content={issue} />}
          {firstPage && <meta name="citation_firstpage" content={firstPage} />}
          {lastPage && <meta name="citation_lastpage" content={lastPage} />}
          <meta name="citation_fulltext_html_url" content={canonicalUrl} />
          <meta name="citation_abstract_html_url" content={canonicalUrl} />
          <meta name="citation_language" content="en" />
        </>
      )}
    </Helmet>
  );
}

export default SEO;
