// Sample articles for different categories
export interface Article {
  id: number;
  title: string;
  authors: string;
  abstract: string;
  date: string;
  views: number;
  categories: string[];
  imageUrl?: string;
}

// Biology articles
export const BIOLOGY_ARTICLES: Article[] = [
  {
    id: 101,
    title: "CRISPR-Cas9 Mediated Gene Editing in Human Embryonic Stem Cells",
    authors: "Dr. Sarah Chen, Dr. Michael Rodriguez, Prof. James Wilson",
    abstract: "This study demonstrates the successful application of CRISPR-Cas9 gene editing technology in human embryonic stem cells to correct genetic mutations associated with hereditary diseases. Our results show high efficiency and specificity with minimal off-target effects.",
    date: "Feb 12, 2025",
    views: 723,
    categories: ["BIOLOGY", "GENETICS"],
    imageUrl: "https://via.placeholder.com/400x200?text=Biology+Research"
  },
  {
    id: 102,
    title: "Microbiome Diversity in the Human Gut and Its Relationship to Metabolic Health",
    authors: "Prof. Aisha Johnson, Dr. Thomas Lee, Dr. Elena Petrov",
    abstract: "Our comprehensive analysis of gut microbiome composition across diverse human populations reveals significant correlations between bacterial diversity and metabolic health markers. The findings suggest potential therapeutic targets for metabolic disorders.",
    date: "Jan 28, 2025",
    views: 651,
    categories: ["BIOLOGY", "MICROBIOLOGY"],
    imageUrl: "https://via.placeholder.com/400x200?text=Microbiome+Research"
  },
  {
    id: 103,
    title: "Cellular Mechanisms of Neuroplasticity in Adult Mammalian Brains",
    authors: "Dr. Robert Kim, Prof. Lisa Martinez, Dr. David Thompson",
    abstract: "This research explores the molecular and cellular mechanisms underlying neuroplasticity in adult mammalian brains. We identify key signaling pathways that regulate synaptic remodeling and neurogenesis in response to environmental stimuli and learning.",
    date: "Mar 5, 2025",
    views: 589,
    categories: ["BIOLOGY", "NEUROSCIENCE"],
    imageUrl: "https://via.placeholder.com/400x200?text=Neuroscience+Research"
  }
];

// Physics articles
export const PHYSICS_ARTICLES: Article[] = [
  {
    id: 201,
    title: "Quantum Entanglement in Macroscopic Systems: Experimental Verification",
    authors: "Prof. Daniel White, Dr. Sophia Garcia, Dr. Alexander Brown",
    abstract: "We present experimental evidence of quantum entanglement persisting in macroscopic systems at room temperature. Our novel detection method overcomes previous limitations in measuring quantum correlations in complex systems.",
    date: "Feb 20, 2025",
    views: 842,
    categories: ["PHYSICS", "QUANTUM PHYSICS"],
    imageUrl: "https://via.placeholder.com/400x200?text=Physics+Research"
  },
  {
    id: 202,
    title: "Dark Matter Distribution in Ultra-Diffuse Galaxies: New Constraints",
    authors: "Dr. Emily Williams, Prof. Jonathan Taylor, Dr. Maria Rodriguez",
    abstract: "Using deep optical and radio observations, we map the dark matter distribution in ultra-diffuse galaxies. Our findings challenge current cosmological models and suggest alternative dark matter properties.",
    date: "Jan 15, 2025",
    views: 705,
    categories: ["PHYSICS", "ASTROPHYSICS"],
    imageUrl: "https://via.placeholder.com/400x200?text=Astrophysics+Research"
  },
  {
    id: 203,
    title: "Topological Insulators: Novel Properties and Applications in Quantum Computing",
    authors: "Prof. Richard Lee, Dr. Jennifer Adams, Dr. Hiroshi Tanaka",
    abstract: "This study investigates the unique electronic properties of topological insulators and demonstrates their potential applications in quantum computing. We report the successful fabrication of topological qubits with enhanced coherence times.",
    date: "Mar 10, 2025",
    views: 631,
    categories: ["PHYSICS", "CONDENSED MATTER"],
    imageUrl: "https://via.placeholder.com/400x200?text=Condensed+Matter+Research"
  }
];

// Computer Science articles
export const COMPUTER_SCIENCE_ARTICLES: Article[] = [
  {
    id: 301,
    title: "Self-Supervised Learning for Computer Vision: Bridging the Labeled Data Gap",
    authors: "Dr. James Chen, Prof. Olivia Martinez, Dr. Samuel Johnson",
    abstract: "We present a novel self-supervised learning framework that significantly reduces the need for labeled data in computer vision tasks. Our approach achieves state-of-the-art performance on benchmark datasets with only 10% of the typically required labeled examples.",
    date: "Feb 28, 2025",
    views: 912,
    categories: ["COMPUTER SCIENCE", "MACHINE LEARNING"],
    imageUrl: "https://via.placeholder.com/400x200?text=Machine+Learning+Research"
  },
  {
    id: 302,
    title: "Quantum-Resistant Cryptographic Protocols for Secure Communication",
    authors: "Prof. Michelle Wang, Dr. Robert Davis, Dr. Amir Hassan",
    abstract: "This research introduces new cryptographic protocols designed to withstand attacks from quantum computers. We provide security proofs and performance evaluations showing practical implementation feasibility on current hardware.",
    date: "Jan 20, 2025",
    views: 783,
    categories: ["COMPUTER SCIENCE", "CYBERSECURITY"],
    imageUrl: "https://via.placeholder.com/400x200?text=Cybersecurity+Research"
  },
  {
    id: 303,
    title: "Federated Learning for Privacy-Preserving Healthcare Analytics",
    authors: "Dr. Elizabeth Brown, Prof. David Kim, Dr. Sarah Thompson",
    abstract: "We demonstrate the application of federated learning techniques to healthcare data analysis, enabling collaborative model training without sharing sensitive patient information. Our approach maintains diagnostic accuracy while ensuring regulatory compliance.",
    date: "Mar 8, 2025",
    views: 675,
    categories: ["COMPUTER SCIENCE", "HEALTHCARE INFORMATICS"],
    imageUrl: "https://via.placeholder.com/400x200?text=Healthcare+Informatics+Research"
  }
];

// Chemistry articles
export const CHEMISTRY_ARTICLES: Article[] = [
  {
    id: 401,
    title: "Novel Catalytic Materials for Efficient Carbon Dioxide Reduction",
    authors: "Prof. Thomas Wilson, Dr. Rebecca Lee, Dr. Carlos Rodriguez",
    abstract: "This study reports the synthesis and characterization of novel nanostructured catalysts that efficiently convert carbon dioxide to value-added chemicals. Our materials show unprecedented selectivity and stability under industrial conditions.",
    date: "Feb 15, 2025",
    views: 621,
    categories: ["CHEMISTRY", "CATALYSIS"],
    imageUrl: "https://via.placeholder.com/400x200?text=Catalysis+Research"
  },
  {
    id: 402,
    title: "Sustainable Synthesis of Biodegradable Polymers from Agricultural Waste",
    authors: "Dr. Sarah Johnson, Prof. Michael Zhang, Dr. Laura Martinez",
    abstract: "We present an environmentally friendly method for synthesizing biodegradable polymers using agricultural waste as feedstock. The resulting materials exhibit mechanical properties comparable to conventional plastics while being fully compostable.",
    date: "Jan 25, 2025",
    views: 574,
    categories: ["CHEMISTRY", "POLYMER SCIENCE"],
    imageUrl: "https://via.placeholder.com/400x200?text=Polymer+Science+Research"
  },
  {
    id: 403,
    title: "Molecular Dynamics Simulations of Protein-Drug Interactions: Implications for Drug Design",
    authors: "Prof. Jennifer Adams, Dr. David Thompson, Dr. Elena Kim",
    abstract: "Using advanced molecular dynamics simulations, we investigate the binding mechanisms of small-molecule drugs to therapeutic protein targets. Our findings reveal previously unknown interaction patterns that can guide structure-based drug design efforts.",
    date: "Mar 12, 2025",
    views: 542,
    categories: ["CHEMISTRY", "MEDICINAL CHEMISTRY"],
    imageUrl: "https://via.placeholder.com/400x200?text=Medicinal+Chemistry+Research"
  }
];

// Mathematics articles
export const MATHEMATICS_ARTICLES: Article[] = [
  {
    id: 501,
    title: "New Approaches to the Riemann Hypothesis: Analytical and Computational Insights",
    authors: "Prof. Alan Zhang, Dr. Rebecca Johnson, Dr. Carlos Mendez",
    abstract: "We present novel analytical approaches to the Riemann Hypothesis, complemented by high-performance computing simulations. Our results provide new evidence supporting the hypothesis and identify promising directions for future proof attempts.",
    date: "Feb 22, 2025",
    views: 498,
    categories: ["MATHEMATICS", "NUMBER THEORY"],
    imageUrl: "https://via.placeholder.com/400x200?text=Number+Theory+Research"
  },
  {
    id: 502,
    title: "Topological Data Analysis: Applications in Complex Systems Modeling",
    authors: "Dr. Lisa Park, Prof. Michael Brown, Dr. Sophia Wilson",
    abstract: "This research applies topological data analysis techniques to extract meaningful patterns from high-dimensional data in complex systems. We demonstrate successful applications in climate modeling, financial markets, and biological networks.",
    date: "Jan 18, 2025",
    views: 463,
    categories: ["MATHEMATICS", "DATA SCIENCE"],
    imageUrl: "https://via.placeholder.com/400x200?text=Data+Science+Research"
  },
  {
    id: 503,
    title: "Advances in Non-Euclidean Geometry and Their Implications for Cosmology",
    authors: "Prof. David Lee, Dr. Jennifer Martinez, Dr. Ahmed Hassan",
    abstract: "We develop new mathematical frameworks based on non-Euclidean geometry that provide insights into the large-scale structure of the universe. Our models reconcile observational data with theoretical predictions from general relativity.",
    date: "Mar 3, 2025",
    views: 429,
    categories: ["MATHEMATICS", "GEOMETRY"],
    imageUrl: "https://via.placeholder.com/400x200?text=Geometry+Research"
  }
];

// Get random articles with a stable seed for SSR
export function getRandomArticles(count: number = 3): Article[] {
  // Use a stable set of articles for SSR to avoid hydration errors
  return [
    PHYSICS_ARTICLES[1],  // Dark Matter Distribution article
    BIOLOGY_ARTICLES[1],  // Microbiome Diversity article
    COMPUTER_SCIENCE_ARTICLES[1]  // Quantum-Resistant Cryptographic Protocols article
  ].slice(0, count);
}

// Combine all articles into a single array for easy access
export const ALL_ARTICLES: Article[] = [
  ...BIOLOGY_ARTICLES,
  ...PHYSICS_ARTICLES,
  ...COMPUTER_SCIENCE_ARTICLES,
  ...CHEMISTRY_ARTICLES,
  ...MATHEMATICS_ARTICLES
];

// Featured article for the homepage
export const FEATURED_ARTICLE: Article = {
  id: 999,
  title: "Epigenetic Regulation of Neural Stem Cell Differentiation in Alzheimer's Disease Models",
  authors: "Dr. Eliza J. Thornfield, Prof. Hiroshi Nakamura, Dr. Sophia Menendez Rodriguez",
  abstract: "Recent advances in understanding epigenetic mechanisms have revealed their crucial role in neural stem cell fate determination. This study investigates how DNA methylation patterns and histone modifications influence neural stem cell differentiation in transgenic mouse models of Alzheimer's disease, providing insights into potential therapeutic targets for neurodegenerative disorders.",
  date: "Jan 15, 2025",
  views: 842,
  categories: ["BIOLOGY", "NEUROSCIENCE"],
  imageUrl: "https://images.unsplash.com/photo-1559757175-7cb057fba3c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80"
};
