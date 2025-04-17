import React, { useEffect, useState } from 'react';
import { Box, Container, Text, Center, Spinner, useToast, VStack, Divider, HStack, Link } from '@chakra-ui/react';
import Layout from '../components/Layout';
import SimpleSignupForm from '../components/auth/SimpleSignupForm';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { getUserProfile } from '../services/profileService';
import { createLogger, LogCategory } from '../utils/logger';
import OrcidImport from '../components/profile/OrcidImport';
import OrcidConnectButton from '../components/auth/OrcidConnectButton';
import ProfileCompleteness from '../components/profile/ProfileCompleteness';
import { useProfileCompleteness } from '../hooks/useProfileCompleteness';

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
  
  // Get profile completeness data
  const { completionPercentage, fieldStatus, importFromOrcid, isLoading: isProfileCompletenessLoading } = useProfileCompleteness();
  
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
  
  // If user has a profile, show the profile page with completeness indicator
  if (existingProfile) {
    return (
      <Layout>
        <Container maxW="container.md" py={8}>
          <VStack spacing={8} align="stretch">
            <Box>
              <Text fontSize="2xl" fontWeight="bold" mb={4}>
                Your Profile
              </Text>
              
              {/* Profile Completeness Indicator */}
              {!isProfileCompletenessLoading && (
                <ProfileCompleteness profile={existingProfile} />
              )}
            </Box>
            
            <SimpleSignupForm
              existingProfile={existingProfile}
              onComplete={() => {
                toast({
                  title: "Profile Updated",
                  description: "Your profile has been successfully updated.",
                  status: "success",
                  duration: 5000,
                  isClosable: true,
                });
              }}
            />
            
            {/* Modified ORCID section that combines connection and import */}
            <Box 
              p={6} 
              borderWidth="1px" 
              borderRadius="md" 
              bg="white"
              borderColor="gray.200"
            >
              <Text fontSize="lg" fontWeight="bold" mb={3}>
                ORCID Integration
              </Text>
              
              <Text mb={4} color="gray.600">
                ORCID provides a persistent digital identifier that distinguishes you from other researchers and supports automated linkages between you and your professional activities.
              </Text>
              
              {existingProfile.orcidId ? (
                <>
                  <HStack spacing={3} mb={4}>
                    <Text>Connected ORCID:</Text>
                    <HStack>
                      <svg viewBox="0 0 256 256" width="20px" height="20px" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M256 128c0 70.7-57.3 128-128 128S0 198.7 0 128 57.3 0 128 0s128 57.3 128 128z"
                          fill="#A6CE39"
                        />
                        <path
                          d="M86.3 186.2H70.9V79.1h15.4v107.1zM108.9 79.1h41.6c39.6 0 57 28.3 57 53.6 0 27.5-21.5 53.6-56.8 53.6h-41.8V79.1zm15.4 93.3h24.5c34.9 0 42.9-26.5 42.9-39.7C191.7 111.2 178 93 148 93h-23.7v79.4zM88.7 56.8c0 5.5-4.5 10.1-10.1 10.1s-10.1-4.6-10.1-10.1c0-5.6 4.5-10.1 10.1-10.1s10.1 4.6 10.1 10.1z"
                          fill="#FFF"
                        />
                      </svg>
                      <Link 
                        href={`https://orcid.org/${existingProfile.orcidId}`} 
                        isExternal 
                        color="gray.700"
                      >
                        {existingProfile.orcidId}
                      </Link>
                    </HStack>
                  </HStack>
                  
                  <Divider my={4} />
                  
                  <Text fontSize="md" fontWeight="medium" mb={2}>
                    Import Data from ORCID
                  </Text>
                  <Text fontSize="sm" color="gray.600" mb={4}>
                    Update your profile with information from your ORCID account
                  </Text>
                  
                  <OrcidImport 
                    orcidId={existingProfile.orcidId} 
                    onImportComplete={importFromOrcid} 
                  />
                </>
              ) : (
                <OrcidConnectButton />
              )}
            </Box>
          </VStack>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Container maxW="container.md" py={10}>
        <SimpleSignupForm existingProfile={existingProfile} onComplete={handleProfileComplete} />
      </Container>
    </Layout>
  );
};

export default SimpleProfilePage;
