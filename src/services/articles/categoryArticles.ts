import { Article } from '../articleTypes';
import { v4 as uuidv4 } from 'uuid';

// Helper function to create an article
function createArticle(
  title: string,
  mainCategory: string,
  subCategory: string,
  abstract: string
): Article {
  return {
    id: uuidv4(),
    title,
    abstract,
    fullText: `This is a sample full text for the article "${title}" in the category ${mainCategory} > ${subCategory}.`,
    authors: [
      {
        id: uuidv4(),
        name: `Dr. ${subCategory.split(' ')[0]} Researcher`,
        institution: `${mainCategory} University`,
        email: `researcher@${subCategory.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu`,
        orcid: `0000-0001-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
      }
    ],
    publishedDate: new Date(
      2024, 
      Math.floor(Math.random() * 3), 
      Math.floor(1 + Math.random() * 28)
    ).toISOString(),
    category: subCategory, // For backward compatibility
    mainCategory,
    subCategory,
    keywords: [mainCategory, subCategory, ...abstract.split(' ').slice(0, 3)],
    citations: Math.floor(Math.random() * 100),
    views: Math.floor(100 + Math.random() * 900),
    doi: `10.1234/journal.${subCategory.toLowerCase().replace(/[^a-z0-9]/g, '')}.${Math.floor(1000 + Math.random() * 9000)}`,
    reviews: [],
    relatedArticles: []
  };
}

// Physical Sciences Articles
export const physicalSciencesArticles: Article[] = [
  createArticle(
    "Quantum Entanglement in Superconducting Qubits",
    "Physical Sciences",
    "Physics",
    "This study explores recent advances in quantum entanglement between superconducting qubits, demonstrating record-breaking coherence times and fidelity measurements that surpass the threshold required for fault-tolerant quantum computing."
  ),
  createArticle(
    "Novel Catalysts for Carbon Dioxide Reduction",
    "Physical Sciences",
    "Chemistry",
    "We report the synthesis and characterization of a new class of metal-organic framework catalysts that efficiently convert carbon dioxide to methanol under ambient conditions, offering promising pathways for carbon capture and utilization."
  ),
  createArticle(
    "Topological Data Analysis for Complex Networks",
    "Physical Sciences",
    "Mathematics",
    "This paper introduces novel applications of persistent homology and other topological data analysis techniques to extract meaningful patterns from high-dimensional network data, with applications in social network analysis and biological systems."
  ),
  createArticle(
    "Climate Feedback Mechanisms in Arctic Permafrost",
    "Physical Sciences",
    "Earth & Environmental Sciences",
    "Our research quantifies the positive feedback loops between permafrost thawing, methane release, and global warming, providing updated models that better predict the rate and impact of Arctic climate change."
  ),
  createArticle(
    "Gravitational Wave Detection from Neutron Star Mergers",
    "Physical Sciences",
    "Astronomy & Astrophysics",
    "This study presents new data from the LIGO-Virgo-KAGRA collaboration, analyzing gravitational wave signals from neutron star mergers and their implications for understanding nuclear matter under extreme conditions."
  )
];

// Life Sciences & Biomedicine Articles
export const lifeSciencesArticles: Article[] = [
  createArticle(
    "CRISPR-Cas9 Mediated Gene Therapy for Cystic Fibrosis",
    "Life Sciences & Biomedicine",
    "Biology",
    "We demonstrate successful correction of the CFTR gene mutation in human airway epithelial cells using an optimized CRISPR-Cas9 delivery system, showing restoration of chloride channel function in vitro and in mouse models."
  ),
  createArticle(
    "Artificial Intelligence in Early Cancer Detection",
    "Life Sciences & Biomedicine",
    "Medicine & Health Sciences",
    "This research evaluates a deep learning algorithm for detecting early-stage cancers from liquid biopsy samples, achieving 94% sensitivity and 96% specificity across multiple cancer types using cell-free DNA methylation patterns."
  ),
  createArticle(
    "Neural Circuits Underlying Working Memory",
    "Life Sciences & Biomedicine",
    "Neuroscience",
    "Using optogenetic techniques and high-density electrophysiological recordings, we map the dynamic neural circuits in the prefrontal cortex that maintain working memory representations during cognitive tasks."
  ),
  createArticle(
    "Epigenetic Inheritance Patterns in Multigenerational Studies",
    "Life Sciences & Biomedicine",
    "Genetics",
    "Our longitudinal study tracks epigenetic modifications across four generations, providing evidence for transgenerational inheritance of environmentally-induced epigenetic marks and their association with metabolic phenotypes."
  ),
  createArticle(
    "Biodiversity Loss Impact on Ecosystem Resilience",
    "Life Sciences & Biomedicine",
    "Ecology & Conservation",
    "This research quantifies how species diversity affects ecosystem resilience to environmental stressors, demonstrating threshold effects where biodiversity loss dramatically reduces ecosystem recovery capacity after disturbances."
  )
];

// Technology & Engineering Articles
export const technologyArticles: Article[] = [
  createArticle(
    "Quantum-Resistant Cryptographic Algorithms",
    "Technology & Engineering",
    "Computer Science",
    "We present a comparative analysis of post-quantum cryptographic algorithms, evaluating their security guarantees, computational efficiency, and implementation challenges for securing digital infrastructure against quantum computing threats."
  ),
  createArticle(
    "Neuromorphic Computing Architectures",
    "Technology & Engineering",
    "Electrical & Electronic Engineering",
    "This paper introduces a novel neuromorphic chip design that mimics brain-like processing with memristive synapses and spiking neurons, achieving 100x energy efficiency improvements for machine learning tasks compared to conventional GPUs."
  ),
  createArticle(
    "Self-Healing Materials for Aerospace Applications",
    "Technology & Engineering",
    "Mechanical Engineering",
    "Our research develops and characterizes self-healing polymer composites that automatically repair microcracks in aircraft structures, extending service life and improving safety through autonomous damage detection and repair mechanisms."
  ),
  createArticle(
    "2D Materials for Next-Generation Electronics",
    "Technology & Engineering",
    "Materials Science",
    "This study explores the electronic and optical properties of novel 2D materials beyond graphene, demonstrating their potential for flexible electronics, high-frequency transistors, and optoelectronic applications."
  ),
  createArticle(
    "Explainable AI for Medical Diagnosis",
    "Technology & Engineering",
    "Artificial Intelligence",
    "We present a framework for explainable artificial intelligence in medical diagnosis that provides transparent reasoning for its predictions, addressing the black-box problem while maintaining high diagnostic accuracy across multiple conditions."
  ),
  createArticle(
    "Decentralized Finance Security Vulnerabilities",
    "Technology & Engineering",
    "Blockchain & Distributed Systems",
    "This comprehensive analysis identifies and classifies security vulnerabilities in decentralized finance protocols, proposing formal verification methods and security best practices to prevent financial exploits in blockchain applications."
  )
];

// Social Sciences Articles
export const socialSciencesArticles: Article[] = [
  createArticle(
    "Behavioral Economics of Climate Change Mitigation",
    "Social Sciences",
    "Economics",
    "Our research applies behavioral economics principles to design and test interventions that overcome psychological barriers to climate-friendly behaviors, demonstrating significant increases in sustainable consumption patterns."
  ),
  createArticle(
    "Digital Media Impact on Adolescent Mental Health",
    "Social Sciences",
    "Psychology",
    "This longitudinal study tracks the relationship between social media use patterns and mental health outcomes in adolescents, identifying specific usage patterns associated with increased depression and anxiety risk factors."
  ),
  createArticle(
    "Changing Family Structures in Post-Industrial Societies",
    "Social Sciences",
    "Sociology",
    "We analyze demographic data from 24 countries to identify emerging patterns in family formation, household composition, and intergenerational relationships, revealing new social norms that challenge traditional family policy frameworks."
  ),
  createArticle(
    "Algorithmic Governance and Democratic Accountability",
    "Social Sciences",
    "Political Science",
    "This research examines how algorithmic decision-making in public institutions affects democratic processes, proposing new frameworks for algorithmic transparency, accountability, and citizen participation in automated governance."
  ),
  createArticle(
    "Effectiveness of Project-Based Learning in STEM Education",
    "Social Sciences",
    "Education",
    "Our controlled study compares traditional instruction with project-based learning approaches in secondary STEM education, showing significant improvements in student engagement, concept retention, and application skills."
  ),
  createArticle(
    "Sustainable Supply Chain Management Strategies",
    "Social Sciences",
    "Business & Management",
    "This research evaluates how companies implement sustainable practices throughout their supply chains, identifying key success factors and measuring their impact on environmental outcomes, operational efficiency, and financial performance."
  )
];

// Arts & Humanities Articles
export const artsHumanitiesArticles: Article[] = [
  createArticle(
    "Ethical Frameworks for Artificial General Intelligence",
    "Arts & Humanities",
    "Philosophy",
    "We propose a comprehensive ethical framework for the development and deployment of artificial general intelligence, addressing issues of autonomy, responsibility, transparency, and the alignment of machine values with human welfare."
  ),
  createArticle(
    "Digital Humanities Approaches to Medieval Manuscripts",
    "Arts & Humanities",
    "Literature",
    "This study applies computational text analysis and digital imaging techniques to a corpus of medieval manuscripts, revealing previously unrecognized patterns of textual transmission and scribal practices across European literary traditions."
  ),
  createArticle(
    "Reinterpreting Colonial Archives Through Indigenous Perspectives",
    "Arts & Humanities",
    "History",
    "Our research combines colonial archival materials with indigenous oral histories to construct more complete narratives of colonial encounters, challenging Eurocentric historical accounts and recovering marginalized historical voices."
  ),
  createArticle(
    "Global Hip-Hop as Cultural Resistance",
    "Arts & Humanities",
    "Cultural Studies",
    "This comparative analysis examines how hip-hop functions as a form of cultural resistance in five different national contexts, tracing how local artists adapt global musical forms to address specific social and political struggles."
  ),
  createArticle(
    "Computational Models of Semantic Change",
    "Arts & Humanities",
    "Linguistics",
    "We present new computational methods for tracking semantic change in large historical corpora, demonstrating how word meanings evolve through processes of metaphorical extension, specialization, and cultural diffusion."
  ),
  createArticle(
    "Virtual Reality as an Artistic Medium",
    "Arts & Humanities",
    "Visual & Performing Arts",
    "This practice-based research explores the aesthetic possibilities of virtual reality as an artistic medium, analyzing how immersion, embodiment, and interactivity create new forms of artistic expression and audience experience."
  )
];

// Multidisciplinary Articles
export const multidisciplinaryArticles: Article[] = [
  createArticle(
    "Circular Economy Models for Urban Development",
    "Multidisciplinary",
    "Sustainability",
    "This interdisciplinary research integrates urban planning, materials science, and economic modeling to develop circular economy frameworks for cities, demonstrating pathways to reduce waste, conserve resources, and create sustainable urban systems."
  ),
  createArticle(
    "Machine Learning for Climate Model Downscaling",
    "Multidisciplinary",
    "Data Science",
    "We present a novel machine learning approach that improves the spatial resolution of global climate models, enabling more accurate local climate predictions while maintaining computational efficiency and physical consistency."
  ),
  createArticle(
    "Neuroeconomics of Decision-Making Under Uncertainty",
    "Multidisciplinary",
    "Cognitive Science",
    "This study combines neuroimaging, behavioral economics, and computational modeling to investigate how the brain evaluates risk and uncertainty, revealing distinct neural mechanisms for different types of uncertain decision-making."
  ),
  createArticle(
    "Evidence-Based Policy for Pandemic Preparedness",
    "Multidisciplinary",
    "Public Policy",
    "Our research synthesizes epidemiological models, economic impact assessments, and public health data to develop evidence-based policy frameworks for pandemic preparedness that balance health outcomes with socioeconomic considerations."
  ),
  createArticle(
    "Ethical Implications of Human Genome Editing",
    "Multidisciplinary",
    "Ethics",
    "This interdisciplinary analysis examines the ethical, legal, and social implications of human germline genome editing, proposing governance frameworks that address issues of safety, equity, autonomy, and intergenerational justice."
  )
];

// Combine all category articles
export const categoryArticles: Article[] = [
  ...physicalSciencesArticles,
  ...lifeSciencesArticles,
  ...technologyArticles,
  ...socialSciencesArticles,
  ...artsHumanitiesArticles,
  ...multidisciplinaryArticles
];
