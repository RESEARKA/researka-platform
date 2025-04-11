import { useState, useCallback } from 'react';
import { Citation, CitationFormat } from '../types/citation';
import { 
  fetchCitationFromDOI, 
  fetchCitationFromURL, 
  formatCitation as formatCitationService,
  createManualCitation
} from '../services/citationService';

export interface UseCitationsReturn {
  citations: Citation[];
  addCitation: (citation: Citation) => void;
  removeCitation: (id: string) => void;
  fetchCitationByDOI: (doi: string) => Promise<Citation>;
  fetchCitationByURL: (url: string) => Promise<Citation>;
  createCitation: (data: Partial<Citation>) => Citation;
  formatCitation: (citation: Citation, format?: CitationFormat) => string;
  setCitations: (citations: Citation[]) => void;
  citationFormat: CitationFormat;
  setCitationFormat: (format: CitationFormat) => void;
}

export function useCitations(initialCitations: Citation[] = []): UseCitationsReturn {
  const [citations, setCitations] = useState<Citation[]>(initialCitations);
  const [citationFormat, setCitationFormat] = useState<CitationFormat>('apa');

  const addCitation = useCallback((citation: Citation) => {
    setCitations(prev => {
      // Check if citation with this ID already exists
      const exists = prev.some(c => c.id === citation.id);
      if (exists) {
        return prev.map(c => c.id === citation.id ? citation : c);
      }
      return [...prev, citation];
    });
  }, []);

  const removeCitation = useCallback((id: string) => {
    setCitations(prev => prev.filter(c => c.id !== id));
  }, []);

  const fetchCitationByDOI = useCallback(async (doi: string): Promise<Citation> => {
    const citation = await fetchCitationFromDOI(doi);
    addCitation(citation);
    return citation;
  }, [addCitation]);

  const fetchCitationByURL = useCallback(async (url: string): Promise<Citation> => {
    const citation = await fetchCitationFromURL(url);
    addCitation(citation);
    return citation;
  }, [addCitation]);

  const createCitation = useCallback((data: Partial<Citation>): Citation => {
    const citation = createManualCitation(data);
    addCitation(citation);
    return citation;
  }, [addCitation]);

  const formatCitation = useCallback((citation: Citation, format: CitationFormat = citationFormat): string => {
    return formatCitationService(citation, format);
  }, [citationFormat]);

  return {
    citations,
    addCitation,
    removeCitation,
    fetchCitationByDOI,
    fetchCitationByURL,
    createCitation,
    formatCitation,
    setCitations,
    citationFormat,
    setCitationFormat
  };
}
