/**
 * University domain verification mapping
 * Maps prestigious university names to their official email domains
 * Used to verify that users claiming affiliation with top institutions have valid email domains
 */

export interface UniversityDomain {
  name: string;
  domain: string;
  country: string;
}

export const UNIVERSITY_DOMAINS: UniversityDomain[] = [
  // Top 20 U.S. Universities
  { name: 'Massachusetts Institute of Technology', domain: 'mit.edu', country: 'US' },
  { name: 'Stanford University', domain: 'stanford.edu', country: 'US' },
  { name: 'Harvard University', domain: 'harvard.edu', country: 'US' },
  { name: 'California Institute of Technology', domain: 'caltech.edu', country: 'US' },
  { name: 'Princeton University', domain: 'princeton.edu', country: 'US' },
  { name: 'Yale University', domain: 'yale.edu', country: 'US' },
  { name: 'University of Chicago', domain: 'uchicago.edu', country: 'US' },
  { name: 'Columbia University', domain: 'columbia.edu', country: 'US' },
  { name: 'University of Pennsylvania', domain: 'upenn.edu', country: 'US' },
  { name: 'Duke University', domain: 'duke.edu', country: 'US' },
  { name: 'Northwestern University', domain: 'northwestern.edu', country: 'US' },
  { name: 'University of California, Berkeley', domain: 'berkeley.edu', country: 'US' },
  { name: 'Cornell University', domain: 'cornell.edu', country: 'US' },
  { name: 'Johns Hopkins University', domain: 'jhu.edu', country: 'US' },
  { name: 'University of California, Los Angeles', domain: 'ucla.edu', country: 'US' },
  { name: 'University of Michigan, Ann Arbor', domain: 'umich.edu', country: 'US' },
  { name: 'New York University', domain: 'nyu.edu', country: 'US' },
  { name: 'Brown University', domain: 'brown.edu', country: 'US' },
  { name: 'Rice University', domain: 'rice.edu', country: 'US' },
  { name: 'University of Southern California', domain: 'usc.edu', country: 'US' },
  
  // UK
  { name: 'University of Oxford', domain: 'ox.ac.uk', country: 'UK' },
  { name: 'University of Cambridge', domain: 'cam.ac.uk', country: 'UK' },
  { name: 'Imperial College London', domain: 'imperial.ac.uk', country: 'UK' },
  { name: 'University College London', domain: 'ucl.ac.uk', country: 'UK' },
  { name: 'London School of Economics and Political Science', domain: 'lse.ac.uk', country: 'UK' },
  
  // Canada
  { name: 'University of Toronto', domain: 'utoronto.ca', country: 'Canada' },
  { name: 'University of British Columbia', domain: 'ubc.ca', country: 'Canada' },
  { name: 'McGill University', domain: 'mcgill.ca', country: 'Canada' },
  
  // Australia
  { name: 'University of Melbourne', domain: 'unimelb.edu.au', country: 'Australia' },
  { name: 'Australian National University', domain: 'anu.edu.au', country: 'Australia' },
  { name: 'University of Sydney', domain: 'sydney.edu.au', country: 'Australia' },
  
  // New Zealand
  { name: 'University of Auckland', domain: 'auckland.ac.nz', country: 'New Zealand' },
  { name: 'University of Otago', domain: 'otago.ac.nz', country: 'New Zealand' },
  
  // Ireland
  { name: 'Trinity College Dublin', domain: 'tcd.ie', country: 'Ireland' },
  { name: 'University College Dublin', domain: 'ucd.ie', country: 'Ireland' },
  
  // China
  { name: 'Tsinghua University', domain: 'tsinghua.edu.cn', country: 'China' },
  { name: 'Peking University', domain: 'pku.edu.cn', country: 'China' },
  { name: 'Fudan University', domain: 'fudan.edu.cn', country: 'China' },
  { name: 'Shanghai Jiao Tong University', domain: 'sjtu.edu.cn', country: 'China' },
  { name: 'Zhejiang University', domain: 'zju.edu.cn', country: 'China' },
  
  // Japan
  { name: 'University of Tokyo', domain: 'u-tokyo.ac.jp', country: 'Japan' },
  { name: 'Kyoto University', domain: 'kyoto-u.ac.jp', country: 'Japan' },
  { name: 'Osaka University', domain: 'osaka-u.ac.jp', country: 'Japan' },
  { name: 'Tohoku University', domain: 'tohoku.ac.jp', country: 'Japan' },
  
  // South Korea
  { name: 'Seoul National University', domain: 'snu.ac.kr', country: 'South Korea' },
  { name: 'Korea Advanced Institute of Science and Technology', domain: 'kaist.ac.kr', country: 'South Korea' },
  { name: 'Pohang University of Science and Technology', domain: 'postech.ac.kr', country: 'South Korea' },
  { name: 'Yonsei University', domain: 'yonsei.ac.kr', country: 'South Korea' },
  
  // Russia
  { name: 'Lomonosov Moscow State University', domain: 'msu.ru', country: 'Russia' },
  { name: 'St. Petersburg State University', domain: 'spbu.ru', country: 'Russia' },
  { name: 'Moscow Institute of Physics and Technology', domain: 'mipt.ru', country: 'Russia' },
  { name: 'Higher School of Economics', domain: 'hse.ru', country: 'Russia' },
  { name: 'Novosibirsk State University', domain: 'nsu.ru', country: 'Russia' },
  
  // France
  { name: 'Université PSL', domain: 'psl.eu', country: 'France' },
  { name: 'École Polytechnique', domain: 'polytechnique.edu', country: 'France' },
  { name: 'Sorbonne University', domain: 'sorbonne-universite.fr', country: 'France' },
  { name: 'École Normale Supérieure', domain: 'ens.psl.eu', country: 'France' },
  
  // Germany
  { name: 'LMU Munich', domain: 'lmu.de', country: 'Germany' },
  { name: 'Technical University of Munich', domain: 'tum.de', country: 'Germany' },
  { name: 'Heidelberg University', domain: 'uni-heidelberg.de', country: 'Germany' },
  { name: 'Humboldt University of Berlin', domain: 'hu-berlin.de', country: 'Germany' },
  
  // Italy
  { name: 'University of Bologna', domain: 'unibo.it', country: 'Italy' },
  { name: 'Sapienza University of Rome', domain: 'uniroma1.it', country: 'Italy' },
  { name: 'Scuola Normale Superiore', domain: 'sns.it', country: 'Italy' },
  
  // Spain
  { name: 'University of Barcelona', domain: 'ub.edu', country: 'Spain' },
  { name: 'Autonomous University of Barcelona', domain: 'uab.cat', country: 'Spain' },
  { name: 'Complutense University of Madrid', domain: 'ucm.es', country: 'Spain' },
  
  // Portugal
  { name: 'University of Lisbon', domain: 'ulisboa.pt', country: 'Portugal' },
  { name: 'University of Porto', domain: 'up.pt', country: 'Portugal' },
  { name: 'University of Coimbra', domain: 'uc.pt', country: 'Portugal' },
  
  // Netherlands
  { name: 'Delft University of Technology', domain: 'tudelft.nl', country: 'Netherlands' },
  { name: 'University of Amsterdam', domain: 'uva.nl', country: 'Netherlands' },
  { name: 'Leiden University', domain: 'universiteitleiden.nl', country: 'Netherlands' },
  
  // Belgium
  { name: 'KU Leuven', domain: 'kuleuven.be', country: 'Belgium' },
  { name: 'Université catholique de Louvain', domain: 'uclouvain.be', country: 'Belgium' },
  { name: 'Ghent University', domain: 'ugent.be', country: 'Belgium' },
  
  // Brazil
  { name: 'University of São Paulo', domain: 'usp.br', country: 'Brazil' },
  { name: 'State University of Campinas', domain: 'unicamp.br', country: 'Brazil' },
  { name: 'Federal University of Rio de Janeiro', domain: 'ufrj.br', country: 'Brazil' },
  
  // Mexico
  { name: 'National Autonomous University of Mexico', domain: 'unam.mx', country: 'Mexico' },
  { name: 'Monterrey Institute of Technology', domain: 'tec.mx', country: 'Mexico' },
  { name: 'Universidad Autónoma Metropolitana', domain: 'uam.mx', country: 'Mexico' },
];

/**
 * Check if a university requires domain verification
 * @param universityName The name of the university to check
 * @returns True if the university requires domain verification
 */
export function requiresDomainVerification(universityName: string): boolean {
  return UNIVERSITY_DOMAINS.some(
    (uni) => uni.name.toLowerCase() === universityName.toLowerCase()
  );
}

/**
 * Get the expected domain for a university
 * @param universityName The name of the university to check
 * @returns The expected domain or null if not found
 */
export function getExpectedDomain(universityName: string): string | null {
  const university = UNIVERSITY_DOMAINS.find(
    (uni) => uni.name.toLowerCase() === universityName.toLowerCase()
  );
  return university ? university.domain : null;
}

/**
 * Verify that an email domain matches the expected domain for a university
 * @param email The email to verify
 * @param universityName The name of the university to check against
 * @returns True if the email domain matches or if the university doesn't require verification
 */
export function verifyEmailDomain(email: string, universityName: string): boolean {
  // If the university doesn't require verification, return true
  if (!requiresDomainVerification(universityName)) {
    return true;
  }

  const expectedDomain = getExpectedDomain(universityName);
  if (!expectedDomain) {
    return true; // If we can't find the expected domain, don't block the user
  }

  // Validate email format first
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false; // Invalid email format
  }

  // Extract domain from email
  const emailParts = email.split('@');
  if (emailParts.length !== 2 || !emailParts[0] || !emailParts[1]) {
    return false; // Invalid email format
  }

  const emailDomain = emailParts[1].toLowerCase();
  return emailDomain === expectedDomain.toLowerCase();
}
