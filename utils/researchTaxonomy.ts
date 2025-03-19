/**
 * Standardized Research Taxonomy
 * 
 * This file contains a hierarchical taxonomy of academic research fields.
 * Each field has a unique ID, name, and may contain subfields.
 * This taxonomy is used for research interest selection and article categorization.
 */

export interface ResearchField {
  id: string;
  name: string;
  description?: string;
  fields?: ResearchField[];
  subfields?: ResearchField[];
  path?: string;
  keywords?: string[];
}

export interface ResearchCategory {
  id: string;
  name: string;
  fields: ResearchField[];
}

/**
 * Main research categories and their fields
 */
export const researchTaxonomy: ResearchCategory[] = [
  {
    id: "natural-sciences",
    name: "Natural Sciences",
    fields: [
      {
        id: "physics",
        name: "Physics",
        subfields: [
          { id: "quantum-physics", name: "Quantum Physics" },
          { id: "astrophysics", name: "Astrophysics" },
          { id: "particle-physics", name: "Particle Physics" },
          { id: "condensed-matter", name: "Condensed Matter Physics" },
          { id: "nuclear-physics", name: "Nuclear Physics" },
          { id: "optics", name: "Optics" },
          { id: "thermodynamics", name: "Thermodynamics" }
        ]
      },
      {
        id: "chemistry",
        name: "Chemistry",
        subfields: [
          { id: "organic-chemistry", name: "Organic Chemistry" },
          { id: "inorganic-chemistry", name: "Inorganic Chemistry" },
          { id: "biochemistry", name: "Biochemistry" },
          { id: "physical-chemistry", name: "Physical Chemistry" },
          { id: "analytical-chemistry", name: "Analytical Chemistry" },
          { id: "materials-chemistry", name: "Materials Chemistry" }
        ]
      },
      {
        id: "biology",
        name: "Biology",
        subfields: [
          { id: "molecular-biology", name: "Molecular Biology" },
          { id: "cell-biology", name: "Cell Biology" },
          { id: "genetics", name: "Genetics" },
          { id: "ecology", name: "Ecology" },
          { id: "evolutionary-biology", name: "Evolutionary Biology" },
          { id: "microbiology", name: "Microbiology" },
          { id: "neurobiology", name: "Neurobiology" },
          { id: "botany", name: "Botany" },
          { id: "zoology", name: "Zoology" }
        ]
      },
      {
        id: "earth-sciences",
        name: "Earth Sciences",
        subfields: [
          { id: "geology", name: "Geology" },
          { id: "meteorology", name: "Meteorology" },
          { id: "oceanography", name: "Oceanography" },
          { id: "atmospheric-science", name: "Atmospheric Science" },
          { id: "geophysics", name: "Geophysics" }
        ]
      },
      {
        id: "astronomy",
        name: "Astronomy",
        subfields: [
          { id: "cosmology", name: "Cosmology" },
          { id: "planetary-science", name: "Planetary Science" },
          { id: "stellar-astronomy", name: "Stellar Astronomy" },
          { id: "galactic-astronomy", name: "Galactic Astronomy" }
        ]
      }
    ]
  },
  {
    id: "social-sciences",
    name: "Social Sciences",
    fields: [
      {
        id: "psychology",
        name: "Psychology",
        subfields: [
          { id: "clinical-psychology", name: "Clinical Psychology" },
          { id: "cognitive-psychology", name: "Cognitive Psychology" },
          { id: "developmental-psychology", name: "Developmental Psychology" },
          { id: "social-psychology", name: "Social Psychology" },
          { id: "neuropsychology", name: "Neuropsychology" }
        ]
      },
      {
        id: "sociology",
        name: "Sociology",
        subfields: [
          { id: "urban-sociology", name: "Urban Sociology" },
          { id: "rural-sociology", name: "Rural Sociology" },
          { id: "social-stratification", name: "Social Stratification" },
          { id: "demography", name: "Demography" }
        ]
      },
      {
        id: "economics",
        name: "Economics",
        subfields: [
          { id: "microeconomics", name: "Microeconomics" },
          { id: "macroeconomics", name: "Macroeconomics" },
          { id: "econometrics", name: "Econometrics" },
          { id: "development-economics", name: "Development Economics" },
          { id: "behavioral-economics", name: "Behavioral Economics" }
        ]
      },
      {
        id: "political-science",
        name: "Political Science",
        subfields: [
          { id: "international-relations", name: "International Relations" },
          { id: "comparative-politics", name: "Comparative Politics" },
          { id: "political-theory", name: "Political Theory" },
          { id: "public-policy", name: "Public Policy" }
        ]
      },
      {
        id: "anthropology",
        name: "Anthropology",
        subfields: [
          { id: "cultural-anthropology", name: "Cultural Anthropology" },
          { id: "archaeological-anthropology", name: "Archaeological Anthropology" },
          { id: "linguistic-anthropology", name: "Linguistic Anthropology" },
          { id: "biological-anthropology", name: "Biological Anthropology" }
        ]
      }
    ]
  },
  {
    id: "formal-sciences",
    name: "Formal Sciences",
    fields: [
      {
        id: "mathematics",
        name: "Mathematics",
        subfields: [
          { id: "algebra", name: "Algebra" },
          { id: "geometry", name: "Geometry" },
          { id: "analysis", name: "Analysis" },
          { id: "topology", name: "Topology" },
          { id: "number-theory", name: "Number Theory" },
          { id: "applied-mathematics", name: "Applied Mathematics" }
        ]
      },
      {
        id: "computer-science",
        name: "Computer Science",
        subfields: [
          { id: "artificial-intelligence", name: "Artificial Intelligence" },
          { id: "machine-learning", name: "Machine Learning" },
          { id: "computer-graphics", name: "Computer Graphics" },
          { id: "algorithms", name: "Algorithms" },
          { id: "data-structures", name: "Data Structures" },
          { id: "computer-networks", name: "Computer Networks" },
          { id: "cybersecurity", name: "Cybersecurity" },
          { id: "software-engineering", name: "Software Engineering" },
          { id: "database-systems", name: "Database Systems" }
        ]
      },
      {
        id: "statistics",
        name: "Statistics",
        subfields: [
          { id: "probability-theory", name: "Probability Theory" },
          { id: "statistical-inference", name: "Statistical Inference" },
          { id: "data-analysis", name: "Data Analysis" },
          { id: "experimental-design", name: "Experimental Design" }
        ]
      },
      {
        id: "logic",
        name: "Logic",
        subfields: [
          { id: "mathematical-logic", name: "Mathematical Logic" },
          { id: "philosophical-logic", name: "Philosophical Logic" },
          { id: "computational-logic", name: "Computational Logic" }
        ]
      }
    ]
  },
  {
    id: "applied-sciences",
    name: "Applied Sciences",
    fields: [
      {
        id: "engineering",
        name: "Engineering",
        subfields: [
          { id: "mechanical-engineering", name: "Mechanical Engineering" },
          { id: "electrical-engineering", name: "Electrical Engineering" },
          { id: "civil-engineering", name: "Civil Engineering" },
          { id: "chemical-engineering", name: "Chemical Engineering" },
          { id: "aerospace-engineering", name: "Aerospace Engineering" },
          { id: "biomedical-engineering", name: "Biomedical Engineering" },
          { id: "environmental-engineering", name: "Environmental Engineering" }
        ]
      },
      {
        id: "medicine",
        name: "Medicine",
        subfields: [
          { id: "cardiology", name: "Cardiology" },
          { id: "neurology", name: "Neurology" },
          { id: "oncology", name: "Oncology" },
          { id: "pediatrics", name: "Pediatrics" },
          { id: "psychiatry", name: "Psychiatry" },
          { id: "immunology", name: "Immunology" },
          { id: "public-health", name: "Public Health" }
        ]
      },
      {
        id: "agriculture",
        name: "Agriculture",
        subfields: [
          { id: "agronomy", name: "Agronomy" },
          { id: "horticulture", name: "Horticulture" },
          { id: "animal-science", name: "Animal Science" },
          { id: "agricultural-economics", name: "Agricultural Economics" }
        ]
      },
      {
        id: "environmental-science",
        name: "Environmental Science",
        subfields: [
          { id: "conservation-biology", name: "Conservation Biology" },
          { id: "pollution-control", name: "Pollution Control" },
          { id: "renewable-energy", name: "Renewable Energy" },
          { id: "sustainability", name: "Sustainability" }
        ]
      }
    ]
  },
  {
    id: "humanities",
    name: "Humanities",
    fields: [
      {
        id: "philosophy",
        name: "Philosophy",
        subfields: [
          { id: "ethics", name: "Ethics" },
          { id: "metaphysics", name: "Metaphysics" },
          { id: "epistemology", name: "Epistemology" },
          { id: "philosophy-of-science", name: "Philosophy of Science" },
          { id: "philosophy-of-mind", name: "Philosophy of Mind" }
        ]
      },
      {
        id: "history",
        name: "History",
        subfields: [
          { id: "ancient-history", name: "Ancient History" },
          { id: "medieval-history", name: "Medieval History" },
          { id: "modern-history", name: "Modern History" },
          { id: "economic-history", name: "Economic History" },
          { id: "social-history", name: "Social History" }
        ]
      },
      {
        id: "linguistics",
        name: "Linguistics",
        subfields: [
          { id: "phonetics", name: "Phonetics" },
          { id: "syntax", name: "Syntax" },
          { id: "semantics", name: "Semantics" },
          { id: "sociolinguistics", name: "Sociolinguistics" },
          { id: "historical-linguistics", name: "Historical Linguistics" }
        ]
      },
      {
        id: "literature",
        name: "Literature",
        subfields: [
          { id: "classical-literature", name: "Classical Literature" },
          { id: "comparative-literature", name: "Comparative Literature" },
          { id: "literary-criticism", name: "Literary Criticism" },
          { id: "poetry", name: "Poetry" },
          { id: "prose", name: "Prose" }
        ]
      },
      {
        id: "arts",
        name: "Arts",
        subfields: [
          { id: "visual-arts", name: "Visual Arts" },
          { id: "performing-arts", name: "Performing Arts" },
          { id: "music", name: "Music" },
          { id: "film-studies", name: "Film Studies" },
          { id: "art-history", name: "Art History" }
        ]
      }
    ]
  },
  {
    id: "interdisciplinary",
    name: "Interdisciplinary Fields",
    fields: [
      {
        id: "cognitive-science",
        name: "Cognitive Science",
        subfields: [
          { id: "neuroscience", name: "Neuroscience" },
          { id: "cognitive-psychology", name: "Cognitive Psychology" },
          { id: "linguistics", name: "Linguistics" },
          { id: "artificial-intelligence", name: "Artificial Intelligence" }
        ]
      },
      {
        id: "environmental-studies",
        name: "Environmental Studies",
        subfields: [
          { id: "ecology", name: "Ecology" },
          { id: "environmental-policy", name: "Environmental Policy" },
          { id: "environmental-ethics", name: "Environmental Ethics" },
          { id: "conservation", name: "Conservation" }
        ]
      },
      {
        id: "data-science",
        name: "Data Science",
        subfields: [
          { id: "big-data", name: "Big Data" },
          { id: "data-mining", name: "Data Mining" },
          { id: "data-visualization", name: "Data Visualization" },
          { id: "predictive-analytics", name: "Predictive Analytics" }
        ]
      },
      {
        id: "blockchain",
        name: "Blockchain & Cryptocurrency",
        subfields: [
          { id: "distributed-ledger", name: "Distributed Ledger Technology" },
          { id: "smart-contracts", name: "Smart Contracts" },
          { id: "crypto-economics", name: "Crypto Economics" },
          { id: "decentralized-finance", name: "Decentralized Finance (DeFi)" }
        ]
      }
    ]
  }
];

/**
 * Get all research fields flattened into a single array
 * @returns Array of all research fields
 */
export function getAllResearchFields(): ResearchField[] {
  const allFields: ResearchField[] = [];
  
  // Recursively collect all fields
  function collectFields(fields: ResearchField[], parentPath: string = '') {
    for (const field of fields) {
      // Create a copy with path information
      const fieldWithPath = {
        ...field,
        path: parentPath ? `${parentPath}.${field.id}` : field.id
      };
      
      allFields.push(fieldWithPath);
      
      if (field.subfields && field.subfields.length > 0) {
        collectFields(field.subfields, fieldWithPath.path);
      }
    }
  }
  
  researchTaxonomy.forEach(category => {
    collectFields(category.fields);
  });
  
  return allFields;
}

/**
 * Get a research field by its ID
 * @param fieldId The ID of the field to find
 * @returns The research field or undefined if not found
 */
export function getFieldById(fieldId: string): ResearchField | undefined {
  const allFields = getAllResearchFields();
  return allFields.find(field => field.id === fieldId);
}

/**
 * Get the parent field of a given field
 * @param fieldId The ID of the field to find the parent for
 * @returns The parent field or undefined if no parent exists
 */
export function getParentField(fieldId: string): ResearchField | undefined {
  const field = getFieldById(fieldId);
  
  if (!field || !field.path) {
    return undefined;
  }
  
  // Extract parent path from the field's path
  const pathParts = field.path.split('.');
  
  // If there's only one part, this is a top-level field with no parent
  if (pathParts.length <= 1) {
    return undefined;
  }
  
  // Remove the last part (current field) to get the parent's path
  pathParts.pop();
  const parentId = pathParts[pathParts.length - 1];
  
  return getFieldById(parentId);
}

/**
 * Search for research fields by name or keywords
 * @param query Search query
 * @returns Array of matching research fields
 */
export function searchResearchFields(query: string): ResearchField[] {
  if (!query || query.trim() === '') {
    return [];
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  const allFields = getAllResearchFields();
  
  return allFields.filter(field => {
    // Check if name matches
    if (field.name.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    // Check if any keyword matches
    if (field.keywords && field.keywords.some(keyword => 
      keyword.toLowerCase().includes(normalizedQuery)
    )) {
      return true;
    }
    
    return false;
  });
}

/**
 * Helper function to get all research fields as a flat array for select inputs
 */
export function getResearchFieldsForSelect(): { value: string; label: string; group: string }[] {
  const options: { value: string; label: string; group: string }[] = [];
  
  researchTaxonomy.forEach(category => {
    category.fields.forEach(field => {
      if (field.subfields && field.subfields.length > 0) {
        field.subfields.forEach(subfield => {
          options.push({
            value: subfield.id,
            label: subfield.name,
            group: `${category.name} - ${field.name}`
          });
        });
      } else {
        options.push({
          value: field.id,
          label: field.name,
          group: category.name
        });
      }
    });
  });
  
  return options;
}
