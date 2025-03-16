import { SEO } from '../../components/SEO';

export function WhitepaperPage() {
  return (
    <>
      <SEO 
        title="Researka Whitepaper - Blockchain-Based Academic Publishing"
        description="Researka 3.0 is a revolutionary academic publishing platform that leverages blockchain technology, dual-mode tokenomics, and artificial intelligence to transform scholarly communication."
        canonical="/about/whitepaper"
      />
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4 text-blueGray-800 text-center">Researka 3.0</h1>
        <h2 className="text-xl text-center mb-6 text-blueGray-600">Redefining Academic Publishing through Blockchain, AI, and Dual-Mode Tokenomics</h2>
        
        <div className="mb-8 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Version 4.0</p>
            <p className="text-sm text-gray-600">Last Updated: March 2025</p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Download PDF
          </button>
        </div>
        
        <div className="prose prose-lg max-w-none">
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-blueGray-700">Executive Summary</h2>
            <p className="mb-4">
              Researka 3.0 is a revolutionary academic publishing platform that leverages blockchain technology, dual-mode tokenomics, and artificial intelligence (AI) to transform scholarly communication. Built on zkSync—a secure Layer-2 scaling solution for Ethereum—the platform ensures transparent, immutable, and cost-effective publication processes. By integrating a dual-mode economic model that provides both stability (via fiat-pegging for everyday transactions) and growth potential (through a free-floating market mechanism), Researka 3.0 incentivizes authors, reviewers, and curators with its native RToken.
            </p>
            <p className="mb-4">
              In addition to a dynamic fee structure, our hybrid monetization model requires readers to pay a nominal fee for full article access (with free abstracts and previews available) and offers competitive subscription plans for individuals and institutions. Authors retain full copyright over their work, ensuring that liability for exclusivity lies solely with the submitter. Governance is designed to transition gradually from the founding team to a fully decentralized autonomous organization (DAO), ensuring long-term sustainability and community control.
            </p>
            <p>
              This whitepaper outlines the technical architecture, economic model, AI-enhanced workflow automation, and detailed roadmap for Researka 3.0, establishing it as a scalable, secure, and equitable platform for academic publishing across multiple disciplines.
            </p>
          </div>
          
          <h2 className="text-xl font-semibold mt-10 mb-4 text-blueGray-700">Table of Contents</h2>
          <ul className="pl-0 mb-8 space-y-2">
            <li className="flex items-center">
              <a href="#introduction" className="text-blue-600 hover:text-blue-800">Introduction</a>
            </li>
            <li className="flex items-center">
              <a href="#vision" className="text-blue-600 hover:text-blue-800">Vision and Objectives</a>
            </li>
            <li className="flex items-center">
              <a href="#architecture" className="text-blue-600 hover:text-blue-800">Technical Architecture</a>
            </li>
            <li className="flex items-center">
              <a href="#tokenomics" className="text-blue-600 hover:text-blue-800">Dual-Mode Tokenomics</a>
            </li>
            <li className="flex items-center">
              <a href="#monetization" className="text-blue-600 hover:text-blue-800">Monetization & Premium Access</a>
            </li>
            <li className="flex items-center">
              <a href="#legal" className="text-blue-600 hover:text-blue-800">Legal Framework and Liability</a>
            </li>
            <li className="flex items-center">
              <a href="#conclusion" className="text-blue-600 hover:text-blue-800">Conclusion</a>
            </li>
          </ul>
          
          <h2 id="introduction" className="text-2xl font-semibold mt-10 mb-4 text-blueGray-700">1. Introduction</h2>
          <p className="mb-4">
            Traditional academic publishing currently has several critical challenges:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>High Fees & Long Delays:</strong> Established journals often charge exorbitant publication fees and operate with lengthy review processes.</li>
            <li><strong>Opaque Review Processes:</strong> The peer review system lacks transparency, leading to questions of fairness and quality.</li>
            <li><strong>Centralized Control:</strong> A few major publishers dominate the market, restricting access and innovation.</li>
            <li><strong>Barriers to Access:</strong> With content locked behind paywalls, both readers and smaller institutions struggle with affordability.</li>
          </ul>
          <p className="mb-4">
            Moreover, the advent of advanced AI tools is lowering the barrier to research article creation. As AI accelerates manuscript production, the volume of submissions will soar, exacerbating the inefficiencies in the current system.
          </p>
          <p className="mb-4">
            Researka 3.0 is conceived as an agile, blockchain-based solution that addresses these challenges head on. By harnessing blockchain's immutable, decentralized nature and integrating AI to automate preliminary manuscript screening, our platform promises to streamline the publication process. In doing so, it not only reduces costs and speeds up publication times but also empowers researchers by allowing them to retain copyright over their work.
          </p>
          <p className="mb-4">
            Our approach is inspired by successful economic models in the crypto space—such as Aether Valoris's dual-mode tokenomics—and is uniquely tailored for academic publishing. We introduce a hybrid monetization model: readers pay a fair fee to access full articles (while previews remain free), and institutions can subscribe at competitive annual rates. Meanwhile, a dynamic fee mechanism ensures that submission costs remain stable in fiat terms, even as market prices fluctuate.
          </p>
          
          <h2 id="vision" className="text-2xl font-semibold mt-10 mb-4 text-blueGray-700">2. Vision and Objectives</h2>
          <h3 className="text-xl font-medium mb-3 text-blueGray-600">Our Vision</h3>
          <p className="mb-4">
            Researka 3.0 aims to democratize academic publishing by creating a decentralized platform that enables the swift, transparent, and affordable dissemination of scholarly research. Our goal is to empower researchers by returning control over their intellectual output, ensuring that both the production and consumption of knowledge are incentivized fairly.
          </p>
          <h3 className="text-xl font-medium mb-3 text-blueGray-600">Key Objectives</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Transparency:</strong> Create an open, verifiable peer review process where all actions are recorded on the blockchain.</li>
            <li><strong>Efficiency:</strong> Leverage AI for preliminary screening and blockchain for streamlined workflows to reduce publication times.</li>
            <li><strong>Accessibility:</strong> Provide fair pricing models for readers while ensuring authors and reviewers are properly compensated.</li>
            <li><strong>Decentralization:</strong> Gradually transition to a community-governed platform where stakeholders have a voice in decision-making.</li>
            <li><strong>Innovation:</strong> Continuously evolve the platform to incorporate emerging technologies and respond to community needs.</li>
          </ul>
          
          <h2 id="architecture" className="text-2xl font-semibold mt-10 mb-4 text-blueGray-700">3. Technical Architecture</h2>
          <p className="mb-4">
            Researka 3.0 is built on zkSync, a Layer-2 scaling solution for Ethereum that provides high throughput, low transaction costs, and enhanced security. The platform consists of several key components:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Smart Contracts:</strong> Handle submissions, reviews, token distribution, and governance.</li>
            <li><strong>IPFS Integration:</strong> Stores article content in a decentralized manner, ensuring permanence and censorship resistance.</li>
            <li><strong>AI Layer:</strong> Automates preliminary screening, plagiarism detection, and formatting checks.</li>
            <li><strong>Web Interface:</strong> Provides a user-friendly experience for authors, reviewers, and readers.</li>
          </ul>
          
          <h2 id="tokenomics" className="text-2xl font-semibold mt-10 mb-4 text-blueGray-700">4. Dual-Mode Tokenomics</h2>
          <p className="mb-4">
            Our innovative dual-mode tokenomics model combines stability with growth potential:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Stable Mode:</strong> For everyday transactions like submission fees, the platform uses a fiat-pegged mechanism to ensure consistent costs regardless of token market value.</li>
            <li><strong>Market Mode:</strong> For investments and speculative activities, the token trades freely on exchanges, allowing for value appreciation.</li>
          </ul>
          <p className="mb-4">
            This approach ensures that the platform remains affordable for academics while providing incentives for early adopters and investors.
          </p>
          
          <h2 id="monetization" className="text-2xl font-semibold mt-10 mb-4 text-blueGray-700">5. Monetization & Premium Access</h2>
          <p className="mb-4">
            Researka 3.0 adopts a hybrid monetization approach:
          </p>
          <h3 className="text-xl font-medium mb-3 text-blueGray-600">Reader Fees</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Per-Article Access:</strong> $10–$15 for full access to individual articles, with abstracts and previews provided free of charge.</li>
            <li><strong>Subscription Options:</strong>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Monthly Plan: $20–$30 per month for unlimited or a set number of full articles.</li>
                <li>Annual Plan: $100–$150 per year, offering a discounted rate for regular users.</li>
              </ul>
            </li>
          </ul>
          <h3 className="text-xl font-medium mb-3 text-blueGray-600">Institutional Subscriptions</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Small Institutions/Companies:</strong> Annual fees in the range of $1,000–$2,000 for access to a curated set of journals.</li>
            <li><strong>Large Institutions:</strong> Annual subscriptions of $5,000–$10,000 for comprehensive access across all disciplines and unlimited usage.</li>
          </ul>
          
          <h2 id="legal" className="text-2xl font-semibold mt-10 mb-4 text-blueGray-700">6. Legal Framework and Liability</h2>
          <p className="mb-4">
            In order to safeguard the platform and ensure ethical practices:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Author Copyright Retention:</strong> Authors maintain full copyright of their work, empowering them to share and distribute their research independently.</li>
            <li><strong>Liability on Submitters:</strong> All submitting authors must confirm, via a mandatory checkbox, that they hold the necessary rights to publish their work and that it is not bound by any exclusive agreements elsewhere.</li>
            <li><strong>Clear Legal Disclaimers:</strong> The platform's Terms & Conditions explicitly state that Researka 3.0 is not liable for any copyright or exclusivity conflicts arising from a submission.</li>
          </ul>
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500 italic text-gray-700 my-6">
            "By submitting your manuscript to Researka 3.0, you affirm that you have full rights to publish this work, and that it is not subject to any exclusive publishing agreements. You agree to indemnify and hold harmless Researka 3.0 from any claims arising from copyright or exclusivity disputes."
          </div>
          
          <h2 id="conclusion" className="text-2xl font-semibold mt-10 mb-4 text-blueGray-700">7. Conclusion</h2>
          <p className="mb-4">
            Researka 3.0 represents a paradigm shift in academic publishing by combining the best of blockchain technology, innovative dual-mode tokenomics, and AI-driven efficiency. Our platform creates a transparent, decentralized, and equitable ecosystem where researchers maintain control over their work, reviewers are fairly compensated, and readers gain access to high-quality research through competitive pricing.
          </p>
          <p className="mb-4">
            By integrating a dynamic fee structure, competitive reader and institutional subscription models, and a robust legal framework that assigns liability to authors, Researka 3.0 ensures that every stakeholder benefits from a sustainable and future-proof scholarly communication system.
          </p>
          <p className="mb-4">
            We invite researchers, academics, institutions, investors, and blockchain enthusiasts to join us in redefining academic publishing. Together, we can democratize the dissemination of knowledge, drive global scientific advancement, and establish a new standard for transparency and fairness in the research community.
          </p>
          <p className="italic text-gray-600 mt-8">
            This whitepaper is a living document and will be updated as Researka 3.0 evolves. We welcome feedback and collaboration to continually refine our vision and technology.
          </p>
        </div>
      </div>
    </>
  );
}

export default WhitepaperPage;
