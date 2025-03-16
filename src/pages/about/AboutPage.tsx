import { SEO } from '../../components/SEO';

export function AboutPage() {
  return (
    <>
      <SEO 
        title="About Researka - Our Mission and Values"
        description="Learn about Researka's mission to revolutionize academic publishing through blockchain technology, creating a transparent and equitable scholarly communication system."
        canonical="/about"
      />
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-blueGray-800">About Researka</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="mb-4">
            Researka is a decentralized academic publishing platform that leverages blockchain technology 
            to create a more transparent, accessible, and equitable scholarly communication system.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3 text-blueGray-700">Our Mission</h2>
          <p className="mb-4">
            Our mission is to revolutionize academic publishing by removing intermediaries, reducing costs, 
            and returning control to the academic community while ensuring the highest standards of 
            peer review and academic integrity.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3 text-blueGray-700">Core Values</h2>
          <ul className="list-none pl-0 mb-4 space-y-2">
            <li><strong>Transparency:</strong> All aspects of the publishing process are open and verifiable</li>
            <li><strong>Accessibility:</strong> Research should be available to everyone, regardless of institutional affiliation</li>
            <li><strong>Community Governance:</strong> The platform is governed by the academic community it serves</li>
            <li><strong>Quality:</strong> Rigorous peer review ensures high-quality publications</li>
            <li><strong>Innovation:</strong> Embracing new technologies to improve scholarly communication</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3 text-blueGray-700">How It Works</h2>
          <p className="mb-4">
            Researka uses blockchain technology to create a permanent, immutable record of publications 
            and peer reviews. Smart contracts automate many aspects of the publishing process, from submission 
            to review to publication, reducing administrative overhead and ensuring fairness.
          </p>
          
          <p className="mb-4">
            Our token-based incentive system rewards reviewers, editors, and other contributors to the 
            ecosystem, creating a sustainable model for open access publishing.
          </p>
        </div>
      </div>
    </>
  );
}

export default AboutPage;
