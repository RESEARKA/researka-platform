import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Mock user data
export const mockUsers = [
  {
    email: 'researcher@example.com',
    password: 'password123',
    name: 'John Researcher',
    role: 'Researcher',
    institution: 'Science Academy',
    department: 'Computer Science',
    position: 'Associate Professor',
    researchInterests: ['Machine Learning', 'Artificial Intelligence', 'Data Science'],
    articles: 5,
    reviews: 8,
    reputation: 76
  },
  {
    email: 'reviewer@example.com',
    password: 'password123',
    name: 'Alice Reviewer',
    role: 'Reviewer',
    institution: 'Tech University',
    department: 'Electrical Engineering',
    position: 'Professor',
    researchInterests: ['Quantum Computing', 'Circuit Design', 'Robotics'],
    articles: 12,
    reviews: 45,
    reputation: 92
  },
  {
    email: 'editor@example.com',
    password: 'password123',
    name: 'Bob Editor',
    role: 'Editor',
    institution: 'Global Research Institute',
    department: 'Physics',
    position: 'Senior Researcher',
    researchInterests: ['Quantum Physics', 'Astrophysics', 'Theoretical Physics'],
    articles: 8,
    reviews: 20,
    reputation: 88
  }
];

// Function to seed mock users into Firebase
export const seedMockUsers = async () => {
  try {
    for (const user of mockUsers) {
      try {
        // Check if Firebase is initialized
        if (!auth || !db) {
          console.error('Firebase not initialized');
          return;
        }
        
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: user.name,
          email: user.email,
          role: user.role,
          institution: user.institution,
          department: user.department,
          position: user.position,
          researchInterests: user.researchInterests,
          articles: user.articles,
          reviews: user.reviews,
          reputation: user.reputation,
          profileComplete: true,
          createdAt: new Date().toISOString()
        });
        
        console.log(`Created mock user: ${user.email}`);
      } catch (error: any) {
        // Skip if user already exists
        if (error.code === 'auth/email-already-in-use') {
          console.log(`User already exists: ${user.email}`);
        } else {
          console.error(`Error creating user ${user.email}:`, error);
        }
      }
    }
    console.log('Mock users seeded successfully');
  } catch (error) {
    console.error('Error seeding mock users:', error);
  }
};
