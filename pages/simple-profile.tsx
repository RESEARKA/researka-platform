import React, { useEffect, useState } from 'react';
import { Box, Container, Text, Center, Spinner, useToast, VStack } from '@chakra-ui/react';
import Layout from '../components/Layout';
import SimpleSignupForm from '../components/auth/SimpleSignupForm';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { getUserProfile } from '../services/profileService';
import { createLogger, LogCategory } from '../utils/logger';
import OrcidProfileSection from '../components/profile/OrcidProfileSection';

// Create a logger instance for this page
const logger = createLogger('SimpleProfilePage');

/**
 * SimpleProfilePage
 * 
 * A simplified profile completion page that focuses on collecting
 * only the essential information needed for new users.
 */
const SimpleProfilePage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const { currentUser, authIsInitialized } = useAuth();
  
  // State for profile checking
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  
  // Get the return URL from query parameters (where to redirect after completion)
  const returnUrl = router.query.returnUrl as string || '/';
  
  // Check if user already has a profile
  useEffect(() => {
    if (!authIsInitialized) return;
    
    if (!currentUser) {
      // User is not logged in, redirect to login
      router.push('/login?returnUrl=/simple-profile');
      return;
    }
    
    const checkExistingProfile = async () => {
      try {
        logger.info('Checking for existing profile', {
          category: LogCategory.LIFECYCLE
        });
        
        const profile = await getUserProfile(currentUser.uid);
        
        if (profile) {
          logger.info('Existing profile found', {
            context: {
              hasName: !!profile.name,
              hasRole: !!profile.role,
              isComplete: profile.isComplete
            },
            category: LogCategory.DATA
          });
          
          // If profile is already complete and we came from another page with returnUrl,
          // provide a way to edit the profile or return to the original page
          if ((profile.isComplete || profile.profileComplete) && returnUrl !== '/') {
            logger.info('Profile already complete with return URL, offering options', {
              context: { returnUrl },
              category: LogCategory.LIFECYCLE
            });
            
            // Only show toast if it's not already active
            if (!toast.isActive('profile-complete-info')) {
              toast({
                id: 'profile-complete-info',
                title: 'Profile Complete',
                description: 'You can edit your profile or continue to your destination',
                status: 'info',
                duration: 5000,
                isClosable: true,
              });
            }
            
            // For editing, we'll just show the form with existing data
            // Don't redirect, let them stay on this page to edit
            setExistingProfile(profile);
          } 
          // If profile is already complete and we navigated directly to the profile page,
          // just show the editing interface directly
          else if (profile.isComplete || profile.profileComplete) {
            logger.info('Profile already complete, showing edit interface', {
              category: LogCategory.LIFECYCLE
            });
            
            setExistingProfile(profile);
          }
        }
      } catch (error) {
        logger.error('Error checking profile', {
          context: { error },
          category: LogCategory.ERROR
        });
      } finally {
        setIsCheckingProfile(false);
      }
    };
    
    checkExistingProfile();
  }, [authIsInitialized, currentUser, returnUrl, router, toast]);
  
  // Handle profile completion
  const handleProfileComplete = () => {
    logger.info('Profile completed, redirecting', {
      context: { returnUrl },
      category: LogCategory.LIFECYCLE
    });
    
    router.push(returnUrl);
  };
  
  // Show loading state while checking profile or if auth isn't initialized
  if (isCheckingProfile || !authIsInitialized) {
    return (
      <Layout>
        <Container maxW="container.md" py={10}>
          <Center minH="60vh">
            <Box textAlign="center">
              <Spinner size="xl" mb={4} />
              <Text>Checking your profile...</Text>
            </Box>
          </Center>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Container maxW="container.md" py={10}>
        {existingProfile ? (
          <VStack spacing={8} align="stretch">
            <SimpleSignupForm existingProfile={existingProfile} onComplete={handleProfileComplete} />
            <OrcidProfileSection />
          </VStack>
        ) : (
          <SimpleSignupForm existingProfile={existingProfile} onComplete={handleProfileComplete} />
        )}
      </Container>
    </Layout>
  );
};

export default SimpleProfilePage;
