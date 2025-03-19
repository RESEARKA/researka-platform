import { NextApiRequest, NextApiResponse } from 'next';
import { seedMockUsers } from '../../data/mockUsers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check for a secret key to prevent unauthorized seeding
    const { secret } = req.body;
    
    if (secret !== 'researka-secret-key') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Seed mock users
    await seedMockUsers();
    
    return res.status(200).json({ message: 'Mock users seeded successfully' });
  } catch (error) {
    console.error('Error in seed-users API:', error);
    return res.status(500).json({ message: 'Error seeding users', error });
  }
}
