// Mock Articles Data
import { Article, categoryStructure } from './articleTypes';
import { biologyArticles } from './articles/biologyArticles';
import { chemistryArticles } from './articles/chemistryArticles';
import { generalScienceArticles } from './articles/generalScienceArticles';
import { physicsArticles } from './articles/physicsArticles';
import { categoryArticles } from './articles/categoryArticles';

// Function to get all articles
export function getAllArticles(): Article[] {
  // Combine legacy articles with new category articles
  const legacyArticles = [
    ...biologyArticles.map(article => ({
      ...article,
      mainCategory: 'Life Sciences & Biomedicine',
      subCategory: 'Biology'
    })),
    ...chemistryArticles.map(article => ({
      ...article,
      mainCategory: 'Physical Sciences',
      subCategory: 'Chemistry'
    })),
    ...generalScienceArticles.map(article => ({
      ...article,
      mainCategory: 'Multidisciplinary',
      subCategory: 'Data Science'
    })),
    ...physicsArticles.map(article => ({
      ...article,
      mainCategory: 'Physical Sciences',
      subCategory: 'Physics'
    })),
  ];
  
  // Return combined articles
  return [...legacyArticles, ...categoryArticles];
}

// Function to get articles by category
export function getArticlesByCategory(category: string): Article[] {
  const allArticles = getAllArticles();
  return allArticles.filter(article => 
    article.category?.toLowerCase() === category.toLowerCase() ||
    article.mainCategory?.toLowerCase() === category.toLowerCase() ||
    article.subCategory?.toLowerCase() === category.toLowerCase()
  );
}

// Function to get articles by main category
export function getArticlesByMainCategory(mainCategory: string): Article[] {
  const allArticles = getAllArticles();
  return allArticles.filter(article => 
    article.mainCategory?.toLowerCase() === mainCategory.toLowerCase()
  );
}

// Function to get articles by subcategory
export function getArticlesBySubCategory(subCategory: string): Article[] {
  const allArticles = getAllArticles();
  return allArticles.filter(article => 
    article.subCategory?.toLowerCase() === subCategory.toLowerCase()
  );
}

// Function to get article by ID
export function getArticleById(id: string): Article | undefined {
  const allArticles = getAllArticles();
  return allArticles.find(article => article.id === id);
}

// Function to search articles
export function searchArticles(query: string): Article[] {
  if (!query) return [];
  
  const allArticles = getAllArticles();
  const lowerCaseQuery = query.toLowerCase();
  
  return allArticles.filter(article => {
    // Search in title, abstract, and keywords
    return (
      article.title.toLowerCase().includes(lowerCaseQuery) ||
      article.abstract.toLowerCase().includes(lowerCaseQuery) ||
      article.keywords.some(keyword => keyword.toLowerCase().includes(lowerCaseQuery)) ||
      article.category?.toLowerCase().includes(lowerCaseQuery) ||
      article.mainCategory?.toLowerCase().includes(lowerCaseQuery) ||
      article.subCategory?.toLowerCase().includes(lowerCaseQuery) ||
      article.authors.some(author => author.name.toLowerCase().includes(lowerCaseQuery))
    );
  });
}

// Function to get all main categories
export function getAllMainCategories(): string[] {
  return Object.keys(categoryStructure);
}

// Function to get subcategories for a main category
export function getSubCategories(mainCategory: string): string[] {
  return categoryStructure[mainCategory] || [];
}

// Function to get a detailed article for the article detail page
export function getDetailedArticleById(id: string): Article | undefined {
  const baseArticle = getArticleById(id);
  
  if (!baseArticle) return undefined;
  
  // Enhanced article with detailed content
  return {
    ...baseArticle,
    sections: [
      {
        id: 'introduction',
        title: 'Introduction',
        content: `The field of ${baseArticle.subCategory} has seen significant advancements in recent years, particularly in the context of ${baseArticle.keywords[0]}. This study builds upon previous work by examining the relationship between ${baseArticle.keywords[1]} and ${baseArticle.keywords[2]}.\n\nPrevious research has established that ${baseArticle.title.split(' ').slice(0, 3).join(' ')} plays a crucial role in understanding ${baseArticle.mainCategory}. However, gaps remain in our knowledge of how these processes interact with ${baseArticle.subCategory} systems.\n\nIn this paper, we present a novel approach to address these challenges, combining theoretical frameworks with empirical data to provide new insights into ${baseArticle.title}.`,
        order: 1
      },
      {
        id: 'methodology',
        title: 'Methodology',
        content: `Our research methodology combines qualitative and quantitative approaches to investigate ${baseArticle.title}.\n\n**Data Collection**\nWe collected data from multiple sources, including laboratory experiments, field observations, and survey responses from participants (n=127) across different demographic groups. The data collection period spanned 18 months, from January 2023 to June 2024.\n\n**Analytical Framework**\nThe analytical framework employed in this study integrates statistical analysis with theoretical modeling. We used a mixed-methods approach, combining:\n\n1. Statistical analysis of quantitative data using R (version 4.2.1)\n2. Thematic analysis of qualitative interviews\n3. Computational modeling using Python (version 3.9)\n\nThis integrated approach allowed us to triangulate findings and ensure robust conclusions.\n\n**Ethical Considerations**\nAll research protocols were approved by the institutional review board (IRB #2023-056), and informed consent was obtained from all participants. Data anonymization procedures were implemented to protect participant privacy.`,
        order: 2
      },
      {
        id: 'results',
        title: 'Results',
        content: `Our analysis revealed several key findings related to ${baseArticle.title}.\n\n**Primary Outcomes**\nThe primary outcome measures showed statistically significant improvements in the experimental group compared to controls (p < 0.01, Cohen's d = 0.78). Figure 1 illustrates the distribution of outcomes across different experimental conditions.\n\n**Secondary Analysis**\nSecondary analyses revealed interesting patterns in the relationship between ${baseArticle.keywords[0]} and ${baseArticle.keywords[1]}. Specifically, we found that:\n\n- Variable A showed a positive correlation with outcome measures (r = 0.67, p < 0.001)\n- Variable B demonstrated a non-linear relationship with the dependent variable\n- Interaction effects between variables C and D were significant in the multivariate model\n\n**Subgroup Analysis**\nWhen examining results by demographic subgroups, we observed differential effects based on age and prior experience with ${baseArticle.subCategory} systems. Younger participants (18-34 years) showed stronger effects compared to older participants (p = 0.023 for interaction).`,
        order: 3
      },
      {
        id: 'discussion',
        title: 'Discussion',
        content: `The findings of this study have several important implications for both theory and practice in ${baseArticle.mainCategory}, particularly within the domain of ${baseArticle.subCategory}.\n\n**Theoretical Implications**\nOur results extend existing theoretical frameworks by demonstrating how ${baseArticle.keywords[0]} interacts with ${baseArticle.keywords[1]} in complex systems. This challenges previous assumptions about linear relationships between these variables and suggests a more nuanced understanding is needed.\n\n**Practical Applications**\nFrom a practical standpoint, our findings suggest several potential applications:\n\n1. Development of improved protocols for ${baseArticle.subCategory} systems\n2. Enhanced training methodologies for practitioners in the field\n3. Policy recommendations for regulatory frameworks\n\n**Limitations**\nDespite the strengths of our approach, several limitations should be acknowledged. First, the sample size, while adequate for our primary analyses, limited the statistical power for some subgroup comparisons. Second, the cross-sectional nature of the data prevents strong causal inferences. Future longitudinal studies could address this limitation.`,
        order: 4
      },
      {
        id: 'conclusion',
        title: 'Conclusion',
        content: `In conclusion, this study provides important new insights into ${baseArticle.title}. By integrating theoretical perspectives with empirical data, we have demonstrated the complex interactions between ${baseArticle.keywords[0]} and ${baseArticle.keywords[1]} in the context of ${baseArticle.subCategory}.\n\nOur findings suggest several promising directions for future research, including:\n\n1. Longitudinal studies to examine temporal dynamics\n2. Cross-cultural comparisons to assess generalizability\n3. Intervention studies to test practical applications\n\nUltimately, this work contributes to the growing body of knowledge in ${baseArticle.mainCategory} and offers both theoretical and practical insights for researchers and practitioners in the field.`,
        order: 5
      }
    ],
    references: [
      {
        id: 'ref1',
        authors: ['Smith, J.', 'Johnson, A.', 'Williams, B.'],
        title: `Advances in ${baseArticle.subCategory}: A Comprehensive Review`,
        journal: 'Journal of Advanced Research',
        year: '2022',
        doi: '10.1234/jar.2022.001',
        citationText: `Smith, J., Johnson, A., & Williams, B. (2022). Advances in ${baseArticle.subCategory}: A Comprehensive Review. Journal of Advanced Research, 15(2), 112-128. https://doi.org/10.1234/jar.2022.001`
      },
      {
        id: 'ref2',
        authors: ['Chen, L.', 'Garcia, M.'],
        title: `Theoretical Frameworks for Understanding ${baseArticle.keywords[0]}`,
        journal: 'Theoretical Studies Quarterly',
        year: '2021',
        doi: '10.5678/tsq.2021.045',
        citationText: `Chen, L., & Garcia, M. (2021). Theoretical Frameworks for Understanding ${baseArticle.keywords[0]}. Theoretical Studies Quarterly, 42(3), 289-304. https://doi.org/10.5678/tsq.2021.045`
      },
      {
        id: 'ref3',
        authors: ['Patel, R.', 'Kim, S.', 'Nguyen, T.', 'Brown, E.'],
        title: `Empirical Evidence on ${baseArticle.keywords[1]} in Diverse Contexts`,
        journal: 'International Journal of Empirical Studies',
        year: '2023',
        doi: '10.9012/ijes.2023.078',
        citationText: `Patel, R., Kim, S., Nguyen, T., & Brown, E. (2023). Empirical Evidence on ${baseArticle.keywords[1]} in Diverse Contexts. International Journal of Empirical Studies, 8(4), 412-430. https://doi.org/10.9012/ijes.2023.078`
      },
      {
        id: 'ref4',
        authors: ['Taylor, D.', 'Martinez, J.'],
        title: `Methodological Approaches to Studying ${baseArticle.subCategory}`,
        journal: 'Research Methods Today',
        year: '2020',
        doi: '10.3456/rmt.2020.012',
        citationText: `Taylor, D., & Martinez, J. (2020). Methodological Approaches to Studying ${baseArticle.subCategory}. Research Methods Today, 28(1), 67-85. https://doi.org/10.3456/rmt.2020.012`
      },
      {
        id: 'ref5',
        authors: ['Wilson, H.'],
        title: `The Future of ${baseArticle.mainCategory}: Emerging Trends and Challenges`,
        journal: 'Future Perspectives',
        year: '2024',
        doi: '10.7890/fp.2024.003',
        citationText: `Wilson, H. (2024). The Future of ${baseArticle.mainCategory}: Emerging Trends and Challenges. Future Perspectives, 5(2), 145-162. https://doi.org/10.7890/fp.2024.003`
      }
    ],
    figures: [
      {
        id: 'fig1',
        caption: `Figure 1: Relationship between ${baseArticle.keywords[0]} and ${baseArticle.keywords[1]} across different experimental conditions.`,
        url: 'https://via.placeholder.com/800x500?text=Figure+1:+Data+Visualization',
        altText: `Bar chart showing the relationship between ${baseArticle.keywords[0]} and ${baseArticle.keywords[1]}`
      },
      {
        id: 'fig2',
        caption: `Figure 2: Conceptual framework for understanding ${baseArticle.title}.`,
        url: 'https://via.placeholder.com/800x600?text=Figure+2:+Conceptual+Framework',
        altText: `Diagram illustrating the conceptual framework for ${baseArticle.title}`
      },
      {
        id: 'fig3',
        caption: 'Figure 3: Statistical analysis of key variables.',
        url: 'https://via.placeholder.com/750x450?text=Figure+3:+Statistical+Analysis',
        altText: 'Scatter plot with regression line showing statistical relationships between key variables'
      }
    ],
    metrics: {
      downloads: Math.floor(50 + Math.random() * 450),
      shares: Math.floor(10 + Math.random() * 90),
      altmetric: Math.floor(1 + Math.random() * 49),
      impactFactor: Number((1 + Math.random() * 9).toFixed(2))
    },
    supplementaryMaterials: [
      {
        id: 'supp1',
        title: 'Dataset',
        description: 'Complete anonymized dataset used for the analysis in this study',
        fileType: 'CSV',
        url: '#dataset',
        size: '2.4 MB'
      },
      {
        id: 'supp2',
        title: 'Analysis Code',
        description: 'R and Python scripts used for data analysis and visualization',
        fileType: 'ZIP',
        url: '#code',
        size: '1.8 MB'
      },
      {
        id: 'supp3',
        title: 'Survey Instrument',
        description: 'Questionnaire and interview protocol used for data collection',
        fileType: 'PDF',
        url: '#survey',
        size: '420 KB'
      }
    ]
  };
}
