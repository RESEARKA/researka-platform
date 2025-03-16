import { Article } from '../articleTypes';

// General Science Articles
export const generalScienceArticles: Article[] = [
  {
    id: "gen-001",
    title: "Citizen Science Initiatives Drive Significant Advances in Biodiversity Monitoring and Conservation",
    abstract: "This review examines the growing impact of citizen science initiatives on biodiversity monitoring and conservation efforts worldwide. By analyzing data from over 250 citizen science projects across six continents, we demonstrate how public participation has enhanced data collection capabilities, accelerated species discovery, and influenced conservation policy. The study highlights best practices for project design, data validation, and participant engagement that maximize scientific contributions while fostering environmental stewardship.",
    fullText: `
Introduction:
The scale and complexity of global biodiversity challenges have increasingly outpaced the capacity of professional scientists to monitor and address them alone. Citizen science—the involvement of volunteers in scientific research—has emerged as a powerful approach to expand the scope and impact of biodiversity monitoring and conservation efforts (Bonney et al., 2022). While citizen science has historical roots dating back centuries, recent technological advances and growing environmental awareness have catalyzed unprecedented growth in public participation in biodiversity research.

This review synthesizes findings from a comprehensive analysis of 250 biodiversity-focused citizen science initiatives across six continents, examining their scientific contributions, conservation impacts, and operational best practices. We evaluate how these initiatives have expanded data collection capabilities, accelerated species discovery, influenced conservation policy, and fostered environmental stewardship among participants. Additionally, we identify key factors that contribute to project success and recommend strategies for maximizing the scientific and conservation value of citizen science approaches.

Methods:
We conducted a systematic review of biodiversity-focused citizen science initiatives using a mixed-methods approach. Quantitative analysis included bibliometric assessment of scientific publications resulting from citizen science projects (n=1,247), evaluation of data quality through comparison with professional datasets where available, and statistical analysis of project characteristics associated with scientific productivity and participant retention.

Qualitative methods included semi-structured interviews with project coordinators (n=75) and participants (n=150), thematic analysis of project documentation, and case studies of high-impact initiatives. Projects were categorized based on taxonomic focus, geographic scope, research objectives, participant tasks, data validation protocols, and institutional support structures.

To assess conservation impact, we tracked policy citations, management plan incorporations, and documented conservation actions resulting from citizen science data. Participant outcomes were evaluated through surveys measuring changes in knowledge, attitudes, and behaviors related to biodiversity conservation.

Best practices were identified through comparative analysis of project structures, protocols, and outcomes, with particular attention to data quality assurance mechanisms, participant training approaches, and communication strategies. We also examined technological platforms and tools that support data collection, validation, and dissemination.

Results:
Our analysis revealed that biodiversity-focused citizen science has grown exponentially, with a 320% increase in active projects over the past decade. Collectively, these initiatives have contributed over 400 million species occurrence records to global biodiversity databases, representing 35% of publicly available biodiversity data. Taxonomically, birds remain the most monitored group (42% of projects), but initiatives focusing on invertebrates, plants, and fungi have shown the fastest growth (annual increases of 18%, 15%, and 12%, respectively).

Data quality analysis demonstrated that properly designed citizen science projects can produce data of comparable accuracy to professional studies. Projects employing structured protocols with built-in validation mechanisms achieved species identification accuracy rates of 88-97% depending on taxonomic group. Statistical power analyses indicated that the expanded spatial and temporal coverage of citizen science data often compensated for higher variability, resulting in enhanced ability to detect population trends and range shifts.

Scientific impact has been substantial, with citizen science data contributing to 1,843 peer-reviewed publications over the past decade. Projects integrated with professional research programs and explicit scientific objectives produced significantly more publications (p<0.001). Notably, citizen science has enabled discoveries of 372 species new to science and documented 4,125 significant range extensions, particularly in regions with limited professional scientific capacity.

Conservation impact was evidenced by the incorporation of citizen science data into 213 species management plans, 97 protected area designations or expansions, and 145 national biodiversity strategies. Projects that actively engaged with policymakers and conservation practitioners from the design phase showed significantly higher policy uptake (p<0.01).

Participant engagement analysis identified several success factors, including clear communication of project goals, user-friendly data collection tools, regular feedback on contributions, recognition of participant achievements, and opportunities for social interaction. Projects offering tiered participation options, allowing contributors to increase their involvement as they gained experience, achieved 68% higher retention rates than those with fixed participation structures.

Discussion:
Our findings demonstrate that citizen science has evolved from a supplementary data collection approach to a transformative force in biodiversity research and conservation. The scale and scope of data generated through public participation have enabled analyses that would be logistically impossible through traditional scientific approaches alone. Moreover, the geographic and temporal coverage achieved by citizen science networks has proven invaluable for tracking biodiversity responses to global change.

The scientific credibility of citizen science has substantially increased through methodological innovations in project design and data validation. The development of standardized protocols, technological tools for real-time validation, expert review systems, and statistical methods for accounting for observer variation has addressed many historical concerns about data quality. Our finding that well-designed citizen science projects can produce data of comparable quality to professional studies challenges persistent skepticism and supports the integration of citizen-generated data into mainstream scientific analyses.

Beyond data generation, citizen science has created novel pathways for public engagement with biodiversity conservation. The documented increases in participants' knowledge, concern, and pro-environmental behaviors suggest that the educational and social outcomes of citizen science may be as valuable as the scientific contributions. This dual benefit—advancing scientific knowledge while fostering environmental stewardship—positions citizen science as a particularly effective approach in the context of accelerating biodiversity loss.

The policy and management applications of citizen science data highlight the practical conservation value of these initiatives. The responsive nature of citizen science networks, which can rapidly mobilize observers across broad geographic areas, has proven especially valuable for early detection of invasive species, monitoring of threatened populations, and documenting responses to environmental changes or management interventions.

However, our analysis also identified significant challenges and opportunities for improvement. Many projects struggle with sustainable funding models, as the costs of coordination, data management, and participant support are often underestimated. Additionally, there remains a geographic bias in citizen science implementation, with fewer initiatives in biodiversity-rich but economically disadvantaged regions. Addressing these challenges will require innovative funding approaches, international partnerships, and capacity building efforts.

Conclusion:
Citizen science has emerged as a powerful approach for advancing biodiversity monitoring and conservation, generating data at unprecedented scales while fostering public engagement with environmental stewardship. The success factors identified in this review—standardized protocols, robust validation, clear communication, user-friendly tools, and strategic partnerships—provide a framework for designing high-impact initiatives. As biodiversity faces mounting pressures from habitat loss, climate change, and other anthropogenic threats, citizen science offers a scalable, cost-effective mechanism for tracking ecosystem health and informing conservation actions. By harnessing the collective potential of public participation, the scientific community can significantly enhance its capacity to document, understand, and protect global biodiversity.
    `,
    authors: [
      {
        id: "auth-7001",
        name: "Dr. Isabella J. Martinez",
        institution: "Center for Biodiversity and Conservation, American Museum of Natural History",
        email: "i.martinez@amnh.org",
        orcid: "0000-0002-7843-5641"
      },
      {
        id: "auth-7002",
        name: "Prof. Thomas Ndlovu",
        institution: "Department of Zoology and Entomology, University of Pretoria",
        email: "t.ndlovu@up.ac.za",
        orcid: "0000-0001-6294-8275"
      },
      {
        id: "auth-7003",
        name: "Dr. Mei-Ling Chen",
        institution: "Biodiversity Research Center, Academia Sinica",
        email: "mlchen@gate.sinica.edu.tw",
        orcid: "0000-0003-2159-7846"
      }
    ],
    publishedDate: "2025-01-30",
    category: "General Science",
    keywords: ["citizen science", "biodiversity monitoring", "conservation", "public participation", "environmental stewardship", "data quality", "community science"],
    citations: 12,
    views: 876,
    doi: "10.1016/j.biocon.2025.109429"
  },
  {
    id: "gen-002",
    title: "The Science of Science Communication: An Interdisciplinary Framework for Effective Public Engagement",
    abstract: "Effective communication of scientific information to diverse audiences has become increasingly crucial in addressing complex societal challenges. This paper presents an interdisciplinary framework for science communication that integrates insights from journalism, psychology, design, and digital media studies. Through analysis of 150 science communication initiatives across multiple domains, we identify key principles that enhance engagement, comprehension, and knowledge transfer. Our findings highlight the importance of narrative techniques, visual communication strategies, audience-specific framing, and digital interaction in creating impactful science communication experiences.",
    fullText: `
Introduction:
Science communication—the practice of informing, educating, and engaging non-expert audiences with scientific concepts, research findings, and processes—has evolved from a peripheral activity to a central component of the scientific enterprise. As society grapples with complex challenges from climate change to public health emergencies, the need for effective translation of scientific knowledge into public understanding has never been more urgent (Davies et al., 2023). Yet despite growing recognition of its importance, science communication often remains fragmented across disciplinary boundaries, with limited integration of insights from relevant fields.

This paper presents an interdisciplinary framework for science communication that synthesizes perspectives from four domains: journalism (focusing on information gathering, verification, and storytelling), psychology (examining information processing, belief formation, and behavior change), design (addressing visual representation, information architecture, and user experience), and digital media studies (exploring platform dynamics, interactivity, and networked communication). By integrating these perspectives, we aim to provide a more comprehensive understanding of the factors that influence science communication effectiveness across diverse contexts and audiences.

Our analysis draws on a systematic examination of 150 science communication initiatives spanning multiple scientific domains, communication channels, and target audiences. Through this analysis, we identify key principles and practices that enhance engagement, comprehension, and knowledge transfer in science communication. We also explore how these principles can be applied to address contemporary challenges in the science-society interface, including misinformation, polarization, and declining trust in expertise.

Methods:
We employed a mixed-methods approach to develop and validate our interdisciplinary framework. First, we conducted a systematic literature review across the four contributing domains (journalism, psychology, design, and digital media studies), identifying theoretical frameworks and empirical findings relevant to science communication. This review yielded an initial set of principles and practices hypothesized to enhance communication effectiveness.

Next, we analyzed 150 science communication initiatives selected to represent diversity in scientific domain (physical sciences, life sciences, social sciences, and interdisciplinary topics), communication channel (print, digital, broadcast, and in-person), target audience (general public, policymakers, students, and specific interest communities), and organizational context (academic institutions, media organizations, government agencies, and non-profit organizations). For each initiative, we collected data on design features, audience engagement metrics, knowledge transfer outcomes, and contextual factors.

Data collection methods included content analysis of communication materials, semi-structured interviews with creators and audience members (n=75), analysis of engagement metrics where available, and pre-post assessments of knowledge and attitudes for a subset of initiatives (n=42). We also conducted four in-depth case studies of particularly successful initiatives to provide richer contextual understanding of effective approaches.

Data analysis employed both quantitative techniques (statistical analysis of engagement metrics and knowledge assessments) and qualitative approaches (thematic analysis of interviews and communication materials). Through iterative analysis and synthesis, we identified recurring patterns and principles that appeared to enhance communication effectiveness across diverse contexts.

Results:
Our analysis revealed that science communication initiatives employing strong interdisciplinary approaches achieved significantly higher engagement metrics and knowledge transfer outcomes compared to those relying predominantly on single-discipline frameworks. Specifically, initiatives integrating elements from all four domains demonstrated 47% higher completion rates, 68% greater information retention, and 52% more sharing behaviors than those employing one or two domains.

Narrative techniques emerged as particularly powerful tools for science communication, with story-driven explanations generating 2.3 times higher engagement than fact-based presentations of equivalent information. However, the effectiveness of narrative approaches varied by topic and audience segment. For controversial issues like genetic engineering and climate change, narratives featuring diverse perspectives and explicit acknowledgment of uncertainties generated more sustained engagement and nuanced understanding than advocacy-oriented storytelling.

Visual communication strategies demonstrated strong effectiveness across all audience segments, with interactive visualizations producing the highest knowledge gains for complex topics. Notably, visualizations that allowed users to manipulate variables and observe outcomes (e.g., climate model simulations, epidemic spread visualizations) led to more accurate mental models of scientific processes than static representations.

Audience-specific framing emerged as a critical factor in communication effectiveness. Initiatives that conducted formative research to understand audience values, mental models, and information needs before developing content showed 73% higher engagement than those using generic approaches. However, we found that only 28% of the analyzed initiatives reported conducting systematic audience research during the design phase.

Digital interaction features significantly enhanced engagement and knowledge transfer, particularly for younger audiences. Science communication initiatives incorporating elements such as quizzes, decision scenarios, and user-contributed content achieved 84% higher completion rates and 62% greater information retention compared to passive consumption formats. However, the effectiveness of these features depended on thoughtful integration with content rather than superficial gamification.

Institutional context and perceived source credibility strongly influenced audience receptivity to science communication. Initiatives that transparently communicated their methodological approach, acknowledged limitations, and clearly distinguished between established findings and emerging research generated higher trust ratings. Collaborative initiatives involving multiple institutions (e.g., academic-journalistic partnerships) showed particular promise for reaching diverse audiences.

Discussion:
Our findings demonstrate that effective science communication requires integration across traditionally separate domains of expertise. The journalistic emphasis on narrative and verification, the psychological understanding of information processing and persuasion, the design focus on visual representation and user experience, and the digital media perspective on interactivity and networked communication each contribute essential elements to successful science communication. Initiatives that thoughtfully integrate these perspectives achieve substantially better outcomes than those operating primarily within single disciplinary frameworks.

The power of narrative approaches highlighted in our analysis aligns with growing evidence that human cognition is fundamentally story-oriented. However, our findings suggest that the specific narrative structures most effective for science communication differ from conventional journalistic or entertainment storytelling. Effective science narratives maintain fidelity to evidence while employing techniques such as analogies, character-driven examples, and explanatory sequences that build conceptual understanding. The variation in narrative effectiveness across topics and audiences underscores the importance of tailoring approaches to specific communication contexts rather than applying generic templates.

The strong performance of interactive visualizations reflects the cognitive benefits of multimodal learning and active engagement with complex information. By enabling audiences to explore relationships between variables and observe the consequences of different scenarios, these approaches support development of accurate mental models that can be applied beyond the specific examples presented. The growing accessibility of tools for creating interactive visualizations represents a significant opportunity for enhancing science communication across diverse topics and settings.

Our findings regarding audience-specific framing highlight both an opportunity and a persistent challenge in science communication. While tailoring communication to audience characteristics demonstrably enhances effectiveness, many science communication initiatives continue to employ one-size-fits-all approaches or rely on intuitive rather than evidence-based assumptions about audience needs. Developing more systematic approaches to audience research and segmentation represents a critical priority for advancing science communication practice.

The influence of institutional context and source credibility on communication effectiveness underscores the importance of addressing structural factors alongside message-level considerations. In an era of declining trust in traditional institutions, science communication initiatives must navigate complex questions of authority, transparency, and perceived objectivity. Our findings suggest that collaborative approaches involving multiple types of institutions may help bridge credibility gaps and reach diverse audiences, though such collaborations require careful attention to potential tensions between different institutional norms and priorities.

Conclusion:
Interdisciplinary approaches combining journalism, psychology, design, and digital media offer powerful frameworks for science communication in an increasingly complex information landscape. By strategically integrating these perspectives, communicators can create experiences that are simultaneously engaging, comprehensible, and scientifically accurate. However, realizing this potential requires institutional structures that facilitate genuine collaboration across traditionally separate domains, as well as evaluation frameworks that capture the multidimensional nature of communication effectiveness. As scientific issues become increasingly central to public discourse and policy decisions, investing in these interdisciplinary approaches represents a critical priority for scientific institutions, media organizations, and funding agencies committed to fostering an informed and engaged public.
    `,
    authors: [
      {
        id: "auth-8001",
        name: "Dr. Jonathan P. Morris",
        institution: "Center for Public Engagement with Science, University of Wisconsin-Madison",
        email: "jp.morris@wisc.edu",
        orcid: "0000-0001-8532-7642"
      },
      {
        id: "auth-8002",
        name: "Prof. Aisha Nakata",
        institution: "Department of Communication Studies, University of Tokyo",
        email: "a.nakata@u-tokyo.ac.jp",
        orcid: "0000-0002-9475-6318"
      },
      {
        id: "auth-8003",
        name: "Dr. Claudia Fernández-Rivera",
        institution: "School of Communication and Journalism, Universidad Nacional Autónoma de México",
        email: "c.fernandez-rivera@unam.mx",
        orcid: "0000-0003-1857-9624"
      }
    ],
    publishedDate: "2025-02-15",
    category: "General Science",
    keywords: ["science communication", "public engagement", "interdisciplinary approaches", "narrative techniques", "visual communication", "audience research", "digital interaction"],
    citations: 8,
    views: 742,
    doi: "10.1073/pnas.2501842122"
  },
  {
    id: "gen-003",
    title: "Artificial Intelligence Applications in Renewable Energy Systems: Current Status, Challenges, and Future Directions",
    abstract: "The integration of artificial intelligence (AI) with renewable energy technologies presents significant opportunities for enhancing system efficiency, reliability, and grid integration. This comprehensive review examines the current landscape of AI applications across the renewable energy value chain, from resource forecasting and system operation to grid integration and materials discovery. Based on analysis of over 500 research publications and 50 commercial implementations, we identify key technological trends, implementation challenges, and promising research directions. Our findings highlight the transformative potential of AI in accelerating the transition to sustainable energy systems while acknowledging important technical, data, and institutional barriers that must be addressed.",
    fullText: `
Introduction:
The global transition to renewable energy systems represents one of the most significant technological transformations of the 21st century. As renewable sources like solar and wind power increasingly form the backbone of electricity systems worldwide, their inherent variability and decentralized nature create new challenges for system planning, operation, and optimization. Concurrently, the rapid advancement of artificial intelligence (AI) technologies has opened new possibilities for addressing these challenges through enhanced forecasting, control, and decision-making capabilities (Rolnick et al., 2022).

This review examines the convergence of AI and renewable energy technologies, providing a comprehensive assessment of current applications, implementation challenges, and future research directions. We analyze how machine learning, computer vision, natural language processing, and other AI approaches are being applied across the renewable energy value chain—from resource assessment and forecasting to system operation, grid integration, and materials discovery. By synthesizing insights from both academic research and commercial implementations, we aim to provide a balanced perspective on the state of the field and its potential trajectory.

Our analysis is based on a systematic review of over 500 research publications spanning the past decade, complemented by case studies of 50 commercial AI implementations in renewable energy contexts. We evaluate the technological maturity, demonstrated benefits, and implementation challenges of different application areas, with particular attention to the scalability and generalizability of proposed approaches. Additionally, we identify critical gaps in current research and practice, highlighting promising directions for future work.

Methods:
Our methodological approach combined systematic literature review, case study analysis, and expert consultation. For the literature review, we searched major scientific databases using a structured query combining terms related to artificial intelligence (e.g., "machine learning," "deep learning," "computer vision") and renewable energy (e.g., "solar power," "wind energy," "smart grid"). After screening for relevance and quality, 537 publications from 2015-2025 were included in the final analysis.

Publications were categorized according to AI approach, renewable energy technology, application area, and level of technological maturity (using the technology readiness level framework). We conducted quantitative analysis of publication trends and citation patterns, complemented by qualitative content analysis to identify key themes, methodological approaches, and reported outcomes.

To complement the academic literature, we analyzed 50 case studies of commercial AI implementations in renewable energy contexts. Case studies were selected to represent diversity in geographic location, organization type, renewable technology, and application area. Data sources included company reports, technical documentation, industry analyses, and interviews with implementation teams where possible. Each case study was evaluated using a structured framework addressing technological approach, implementation challenges, measured outcomes, and lessons learned.

Finally, we conducted consultations with 25 experts spanning academia, industry, and policy domains to validate our findings and identify emerging trends not yet well-represented in the literature. Expert input was particularly valuable for assessing implementation challenges and future research directions.

Results:
Our analysis revealed widespread and rapidly growing implementation of AI across the renewable energy value chain, with varying levels of technological maturity and impact. Resource forecasting emerged as the most mature application area, with deep learning approaches demonstrating significant improvements in prediction accuracy for solar irradiance (15-25% error reduction) and wind power (18-30% error reduction) compared to conventional statistical methods. Notably, hybrid models combining physics-based simulations with neural networks showed superior performance in complex terrain and extreme weather conditions.

In system operation and maintenance, machine learning-based predictive maintenance has progressed from research to commercial deployment, particularly in wind energy. Computer vision algorithms analyzing drone imagery have achieved 92-97% accuracy in detecting solar panel defects and wind turbine blade damage, enabling condition-based maintenance strategies that reduce downtime by 23-35% and maintenance costs by 18-27% in documented implementations.

Grid integration applications have focused on addressing the variability and uncertainty of renewable generation. Reinforcement learning algorithms for battery storage dispatch have demonstrated 12-18% improvements in economic performance compared to rule-based approaches, while maintaining grid stability constraints. Virtual power plant orchestration using multi-agent systems has enabled aggregation of distributed energy resources, with field trials showing 8-14% improvements in revenue and 10-20% reductions in balancing costs.

Materials discovery represents an emerging frontier, with machine learning accelerating the identification and optimization of novel materials for solar cells, batteries, and electrolyzers. High-throughput computational screening combined with active learning has reduced experimental iterations required for materials development by 60-80% in research settings, though commercial implementation remains limited.

Despite these promising results, our analysis identified several persistent challenges. Data quality and availability emerged as critical limitations, particularly for smaller renewable energy systems and in regions with limited monitoring infrastructure. The lack of standardized data formats and sharing protocols further hinders development of generalizable AI solutions. Additionally, many AI approaches demonstrated in research contexts face significant implementation barriers related to computational requirements, integration with existing systems, and workforce capabilities.

Institutional and regulatory factors also influence AI adoption. Our case studies revealed that organizations with clear data governance frameworks, cross-functional implementation teams, and executive-level support achieved more successful outcomes. Regulatory uncertainty regarding data ownership, algorithm transparency, and system reliability requirements was frequently cited as a barrier to wider implementation, particularly for grid integration applications.

Discussion:
The convergence of AI and renewable energy technologies presents significant opportunities for accelerating the clean energy transition. Our findings demonstrate that AI applications have matured beyond proof-of-concept to deliver measurable improvements in system performance, cost-effectiveness, and reliability across multiple domains. The progression from relatively simple forecasting applications to more complex control and optimization functions reflects both technological advancement and growing confidence in AI-based approaches.

Several trends emerge from our analysis that may shape future developments. First, we observe a shift from purely data-driven approaches toward hybrid models that integrate domain knowledge and physical principles with machine learning techniques. These physics-informed AI approaches address limitations of purely statistical methods, particularly for complex systems with limited historical data or under novel conditions not represented in training datasets.

Second, the evolution toward distributed, edge-computing implementations of AI algorithms reflects the increasingly decentralized nature of renewable energy systems. By processing data closer to its source, these approaches reduce latency, communication bandwidth requirements, and privacy concerns, enabling more responsive control of distributed energy resources.

Third, the growing emphasis on explainable AI addresses critical concerns regarding transparency and trustworthiness, particularly for applications affecting grid reliability or energy market operations. Techniques that provide insight into algorithm decision-making not only facilitate regulatory compliance but also build operator confidence and enable effective human-AI collaboration.

Despite these positive trends, significant challenges remain in translating research advances into widespread implementation. The "valley of death" between academic demonstration and commercial deployment appears particularly wide for more complex applications like grid integration and virtual power plant orchestration. Bridging this gap will require not only technical advances but also business model innovation, workforce development, and supportive regulatory frameworks.

The interdisciplinary nature of this field presents both challenges and opportunities. Effective implementation requires collaboration between data scientists, domain experts, system operators, and policy makers—groups with different priorities, vocabularies, and working methods. Organizations that have established effective cross-functional teams report more successful outcomes, suggesting that human and organizational factors may be as important as technical considerations in determining implementation success.

Conclusion:
The convergence of AI and renewable energy represents a promising frontier for addressing climate and energy challenges. Our review demonstrates that AI applications have progressed beyond theoretical research to deliver tangible improvements in renewable energy forecasting, operation, integration, and development. As these technologies continue to mature, interdisciplinary collaboration between energy domain experts and AI researchers will be essential to address implementation challenges and realize the full potential of this technological convergence. Strategic research investments in physics-informed AI, explainable algorithms, and standardized evaluation frameworks will accelerate progress toward a more efficient, reliable, and sustainable energy system.
    `,
    authors: [
      {
        id: "auth-9001",
        name: "Dr. Michael Chen",
        institution: "Energy Systems Laboratory, Stanford University",
        email: "michael.chen@stanford.edu",
        orcid: "0000-0002-4571-8532"
      },
      {
        id: "auth-9002",
        name: "Prof. Amara Wilson",
        institution: "School of Electrical and Computer Engineering, Cornell University",
        email: "a.wilson@cornell.edu",
        orcid: "0000-0001-9237-4526"
      },
      {
        id: "auth-9003",
        name: "Dr. Fatima Al-Zahrani",
        institution: "Renewable Energy Research Center, King Abdullah University of Science and Technology",
        email: "fatima.alzahrani@kaust.edu.sa",
        orcid: "0000-0003-6158-7403"
      }
    ],
    publishedDate: "2025-03-07",
    category: "General Science",
    keywords: ["artificial intelligence", "renewable energy", "machine learning", "predictive maintenance", "energy forecasting", "smart grid", "materials discovery"],
    citations: 4,
    views: 578,
    doi: "10.1038/s41560-025-01142-x"
  }
];
