import { useQuery, UseQueryResult } from '@tanstack/react-query';

// Types
export interface Review {
  id: number;
  title: string;
  content: string;
  date: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  totalPages: number;
}

// Mock data function (replace with actual API call later)
const fetchReviews = async (page = 1): Promise<ReviewsResponse> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Mock data
  const allReviews: Review[] = [
    {
      id: 1,
      title: "Comprehensive Analysis of Quantum Computing Applications",
      content: "This paper provides an excellent overview of quantum computing applications in cryptography...",
      date: "2025-02-20"
    },
    {
      id: 2,
      title: "Innovative Approach to Climate Prediction",
      content: "The authors present a novel neural network architecture for climate prediction...",
      date: "2025-02-05"
    },
    {
      id: 3,
      title: "Blockchain in Academic Publishing",
      content: "This research effectively demonstrates how blockchain technology can transform academic publishing...",
      date: "2025-01-18"
    },
    {
      id: 4,
      title: "CRISPR Technology Review",
      content: "A thorough examination of recent advancements in CRISPR gene editing techniques...",
      date: "2024-12-12"
    },
    {
      id: 5,
      title: "Machine Learning for Medical Diagnostics",
      content: "The application of machine learning in healthcare diagnostics is well-presented in this study...",
      date: "2024-11-30"
    },
    {
      id: 6,
      title: "Energy Storage Technologies",
      content: "A comprehensive review of sustainable energy storage solutions with practical applications...",
      date: "2024-10-25"
    }
  ];
  
  // Items per page
  const itemsPerPage = 3;
  const totalPages = Math.ceil(allReviews.length / itemsPerPage);
  
  // Paginate
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReviews = allReviews.slice(startIndex, endIndex);
  
  return { reviews: paginatedReviews, totalPages };
};

// React Query hook
export function useReviews(page = 1): UseQueryResult<ReviewsResponse, Error> {
  return useQuery({
    queryKey: ['reviews', page],
    queryFn: () => fetchReviews(page),
    placeholderData: (previousData) => previousData, // Replacement for keepPreviousData
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
