import { Timestamp } from 'firebase/firestore';

/**
 * Interface for Article data from Firestore
 */
export interface Article {
  id: string;
  title: string;
  abstract?: string;
  author?: string;
  authorId?: string;
  content?: string;
  category?: string | string[];
  keywords?: string[];
  date?: string;
  views?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  status?: string;
  compensation?: string;
  introduction?: string;
  methods?: string;
  results?: string;
  discussion?: string;
  references?: string;
  funding?: string;
  ethicalApprovals?: string;
  dataAvailability?: string;
  conflicts?: string;
  license?: string;
}
