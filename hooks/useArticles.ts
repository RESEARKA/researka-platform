import { useQuery, UseQueryResult } from '@tanstack/react-query';

// Types
export interface Article {
  id: number;
  title: string;
  abstract: string;
  status: string;
  date: string;
}

export interface ArticlesResponse {
  articles: Article[];
  totalPages: number;
}

// Mock data function (replace with actual API call later)
const fetchArticles = async (page = 1): Promise<ArticlesResponse> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock data
  const allArticles: Article[] = [
    {
      id: 1,
      title: "Quantum Computing Applications in Cryptography",
      abstract: "This paper explores the potential applications of quantum computing in modern cryptographic systems...",
      status: "published",
      date: "2025-02-15"
    },
    {
      id: 2,
      title: "Neural Networks for Climate Prediction",
      abstract: "We present a novel approach to climate prediction using deep neural networks...",
      status: "published",
      date: "2025-01-28"
    },
    {
      id: 3,
      title: "Blockchain Solutions for Academic Publishing",
      abstract: "This research proposes a blockchain-based framework for academic publishing...",
      status: "published",
      date: "2025-01-10"
    },
    {
      id: 4,
      title: "Advancements in CRISPR Gene Editing",
      abstract: "Recent advancements in CRISPR-Cas9 technology have revolutionized genetic engineering...",
      status: "published",
      date: "2024-12-05"
    },
    {
      id: 5,
      title: "Machine Learning in Healthcare Diagnostics",
      abstract: "This study examines the application of machine learning algorithms in medical diagnostics...",
      status: "published",
      date: "2024-11-22"
    },
    {
      id: 6,
      title: "Sustainable Energy Storage Solutions",
      abstract: "We review recent developments in sustainable energy storage technologies...",
      status: "published",
      date: "2024-10-18"
    },
    {
      id: 7,
      title: "Artificial Intelligence Ethics Framework",
      abstract: "This paper proposes a comprehensive ethical framework for AI development and deployment...",
      status: "published",
      date: "2024-09-30"
    },
    {
      id: 8,
      title: "Quantum Entanglement in Quantum Networks",
      abstract: "We investigate the role of quantum entanglement in the development of quantum networks...",
      status: "published",
      date: "2024-09-12"
    },
    {
      id: 9,
      title: "Neuromorphic Computing Architectures",
      abstract: "This research explores novel neuromorphic computing architectures inspired by the human brain...",
      status: "published",
      date: "2024-08-25"
    }
  ];
  
  // Items per page
  const itemsPerPage = 3;
  const totalPages = Math.ceil(allArticles.length / itemsPerPage);
  
  // Paginate
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedArticles = allArticles.slice(startIndex, endIndex);
  
  // Simulate random error for testing (uncomment to test error handling)
  // if (Math.random() < 0.2) throw new Error("Failed to fetch articles");
  
  return { articles: paginatedArticles, totalPages };
};

// React Query hook
export function useArticles(page = 1): UseQueryResult<ArticlesResponse, Error> {
  return useQuery({
    queryKey: ['articles', page],
    queryFn: () => fetchArticles(page),
    placeholderData: (previousData) => previousData, 
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
