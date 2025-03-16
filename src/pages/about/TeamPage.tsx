import { SEO } from '../../components/SEO';

export function TeamPage() {
  const teamMembers = [
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      role: 'Founder & Chief Scientist',
      bio: 'Dr. Chen is a former professor of Computer Science with expertise in distributed systems and blockchain technology. She founded Researka to address the inequities in academic publishing.',
      image: '/images/team/optimized/team-member-1.jpg'
    },
    {
      id: 2,
      name: 'Prof. Michael Rodriguez',
      role: 'Chief Academic Officer',
      bio: 'Prof. Rodriguez brings 20 years of experience in academic publishing and research ethics. He oversees the peer review process and academic standards.',
      image: '/images/team/optimized/team-member-2.jpg'
    },
    {
      id: 3,
      name: 'Aisha Patel',
      role: 'CTO',
      bio: 'Aisha is a blockchain engineer with previous experience at Ethereum Foundation. She leads the technical development of the Researka platform.',
      image: '/images/team/optimized/team-member-5.jpg'
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      role: 'Head of Community',
      bio: 'Dr. Wilson specializes in science communication and community building. He manages relationships with academic institutions and researcher communities.',
      image: '/images/team/optimized/team-member-3.jpg'
    },
    {
      id: 5,
      name: 'Dr. Elena Kuznetsova',
      role: 'Research Director',
      bio: 'Dr. Kuznetsova is an expert in bibliometrics and research evaluation. She develops new metrics for measuring research impact in a decentralized ecosystem.',
      image: '/images/team/optimized/team-member-4.jpg'
    },
    {
      id: 6,
      name: 'Thomas Lee',
      role: 'Product Manager',
      bio: 'Thomas has extensive experience in UX design for academic tools. He ensures that Researka meets the needs of researchers and readers alike.',
      image: '/images/team/optimized/team-member-2.jpg'
    }
  ];

  return (
    <>
      <SEO 
        title="Meet the Researka Team"
        description="Meet the diverse team of academics, technologists, and publishing experts behind Researka who are transforming scholarly communication."
        canonical="/about/team"
      />
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-blueGray-800 text-center">Our Team</h1>
        
        <p className="text-gray-700 mb-8 text-center max-w-3xl mx-auto">
          Researka is built by a diverse team of academics, technologists, and publishing experts 
          united by a shared vision of transforming scholarly communication through blockchain technology.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map(member => (
            <div key={member.id} className="bg-blueGray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex justify-center items-center p-4">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-blueGray-100 flex-shrink-0">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="object-cover w-full h-full"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="p-6 flex-grow">
                <h3 className="font-bold text-lg text-blueGray-800 text-center">{member.name}</h3>
                <p className="text-blue-600 text-sm mb-3 text-center">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-blueGray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-blueGray-800">Join Our Team</h2>
          <p className="text-gray-700 mb-6">
            We're always looking for talented individuals who are passionate about transforming academic publishing. 
            If you're interested in joining our mission, please check our current openings or send your resume to careers@researka.org.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium">
            View Open Positions
          </button>
        </div>
      </div>
    </>
  );
}

export default TeamPage;
