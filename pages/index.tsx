import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Text,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  VStack,
  Link as ChakraLink,
  useColorModeValue,
  Icon,
  Divider,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Image,
} from '@chakra-ui/react';
import Link from 'next/link';
import Head from 'next/head';
import { FiSearch, FiChevronDown, FiExternalLink, FiUsers, FiFileText, FiAward } from 'react-icons/fi';
import { useModalContext } from '../contexts/ModalContext';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { openLoginModal, openRegisterModal } = useModalContext();
  const { isAuthenticated, user } = useAuth();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate search
    setTimeout(() => {
      setIsSearching(false);
      // Navigate to search results
      // router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }, 1000);
  };

  const handleLoginClick = () => {
    openLoginModal();
  };

  const handleRegisterClick = () => {
    openRegisterModal();
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Head>
        <title>Researka - Decentralizing Academic Research</title>
        <meta name="description" content="A blockchain-powered platform for open access research publication, peer review, and academic collaboration." />
      </Head>
      
      {/* Header/Navigation */}
      <Box borderBottom="1px" borderColor="gray.200" py={2}>
        <Container maxW="container.xl">
          <Flex 
            justify="space-between" 
            align="center"
            direction={{ base: "column", md: "row" }}
            gap={{ base: 4, md: 0 }}
          >
            <Link href="/" passHref>
              <ChakraLink _hover={{ textDecoration: 'none' }}>
                <Flex align="center">
                  <Image 
                    src="/images/researka-logo.svg" 
                    alt="Researka Logo" 
                    width="140px" 
                    height="42px"
                    mr={2}
                  />
                </Flex>
              </ChakraLink>
            </Link>
            
            <HStack 
              spacing={{ base: 2, md: 4 }}
              flexWrap={{ base: "wrap", md: "nowrap" }}
              justifyContent={{ base: "center", md: "flex-end" }}
            >
              <Link href="/" passHref>
                <Button as="a" variant="ghost" colorScheme="green" isActive={true} size={{ base: "sm", md: "md" }} fontSize={{ base: "xs", md: "sm" }}>HOME</Button>
              </Link>
              
              <Link href="/articles/search" passHref>
                <Button as="a" variant="ghost" size={{ base: "sm", md: "md" }} fontSize={{ base: "xs", md: "sm" }}>SEARCH</Button>
              </Link>
              
              <Link href="/submit" passHref>
                <Button as="a" variant="ghost" size={{ base: "sm", md: "md" }} fontSize={{ base: "xs", md: "sm" }}>SUBMIT</Button>
              </Link>
              
              <Link href="/review-dashboard" passHref>
                <Button as="a" variant="ghost" size={{ base: "sm", md: "md" }} fontSize={{ base: "xs", md: "sm" }}>REVIEW</Button>
              </Link>
              
              {/* INFO Dropdown */}
              <Box position="relative" role="group">
                <Button 
                  variant="ghost" 
                  size={{ base: "sm", md: "md" }}
                  rightIcon={<FiChevronDown />}
                  fontSize={{ base: "xs", md: "sm" }}
                >
                  INFO
                </Button>
                <Box 
                  position="absolute"
                  left="0"
                  top="100%"
                  mt="1"
                  w="48"
                  bg="white"
                  shadow="lg"
                  rounded="md"
                  overflow="hidden"
                  zIndex="10"
                  transform="translateY(-10px)"
                  opacity="0"
                  visibility="hidden"
                  transition="all 0.2s"
                  _groupHover={{
                    opacity: 1,
                    visibility: 'visible',
                    transform: 'translateY(0)',
                  }}
                >
                  <Link href="/roles" passHref>
                    <ChakraLink 
                      display="block" 
                      px="4" 
                      py="2" 
                      fontSize="xs" 
                      fontWeight="medium" 
                      color="gray.700" 
                      _hover={{ bg: 'gray.100' }}
                    >
                      ROLES
                    </ChakraLink>
                  </Link>
                  <Link href="/about" passHref>
                    <ChakraLink 
                      display="block" 
                      px="4" 
                      py="2" 
                      fontSize="xs" 
                      fontWeight="medium" 
                      color="gray.700" 
                      _hover={{ bg: 'gray.100' }}
                    >
                      ABOUT
                    </ChakraLink>
                  </Link>
                  <Link href="/about/team" passHref>
                    <ChakraLink 
                      display="block" 
                      px="4" 
                      py="2" 
                      fontSize="xs" 
                      fontWeight="medium" 
                      color="gray.700" 
                      _hover={{ bg: 'gray.100' }}
                    >
                      TEAM
                    </ChakraLink>
                  </Link>
                  <Link href="/about/whitepaper" passHref>
                    <ChakraLink 
                      display="block" 
                      px="4" 
                      py="2" 
                      fontSize="xs" 
                      fontWeight="medium" 
                      color="gray.700" 
                      _hover={{ bg: 'gray.100' }}
                    >
                      WHITEPAPER
                    </ChakraLink>
                  </Link>
                  <Link href="/about/contact" passHref>
                    <ChakraLink 
                      display="block" 
                      px="4" 
                      py="2" 
                      fontSize="xs" 
                      fontWeight="medium" 
                      color="gray.700" 
                      _hover={{ bg: 'gray.100' }}
                    >
                      CONTACT
                    </ChakraLink>
                  </Link>
                </Box>
              </Box>
              
              {/* GOVERNANCE Dropdown */}
              <Box position="relative" role="group">
                <Button 
                  variant="ghost" 
                  size={{ base: "sm", md: "md" }}
                  rightIcon={<FiChevronDown />}
                  fontSize={{ base: "xs", md: "sm" }}
                >
                  GOVERNANCE
                </Button>
                <Box 
                  position="absolute"
                  right="0"
                  top="100%"
                  mt="1"
                  w="56"
                  bg="white"
                  shadow="lg"
                  rounded="md"
                  overflow="hidden"
                  zIndex="10"
                  transform="translateY(-10px)"
                  opacity="0"
                  visibility="hidden"
                  transition="all 0.2s"
                  _groupHover={{
                    opacity: 1,
                    visibility: 'visible',
                    transform: 'translateY(0)',
                  }}
                >
                  <Link href="/legal" passHref>
                    <ChakraLink 
                      display="block" 
                      px="4" 
                      py="2" 
                      fontSize="xs" 
                      fontWeight="medium" 
                      color="gray.700" 
                      _hover={{ bg: 'gray.100' }}
                    >
                      LEGAL
                    </ChakraLink>
                  </Link>
                  <Link href="/privacy-policy" passHref>
                    <ChakraLink 
                      display="block" 
                      px="4" 
                      py="2" 
                      fontSize="xs" 
                      fontWeight="medium" 
                      color="gray.700" 
                      _hover={{ bg: 'gray.100' }}
                    >
                      PRIVACY POLICY
                    </ChakraLink>
                  </Link>
                  <Link href="/cookie-policy" passHref>
                    <ChakraLink 
                      display="block" 
                      px="4" 
                      py="2" 
                      fontSize="xs" 
                      fontWeight="medium" 
                      color="gray.700" 
                      _hover={{ bg: 'gray.100' }}
                    >
                      COOKIE POLICY
                    </ChakraLink>
                  </Link>
                  <Link href="/privacy-center" passHref>
                    <ChakraLink 
                      display="block" 
                      px="4" 
                      py="2" 
                      fontSize="xs" 
                      fontWeight="medium" 
                      color="gray.700" 
                      _hover={{ bg: 'gray.100' }}
                    >
                      PRIVACY CENTER
                    </ChakraLink>
                  </Link>
                </Box>
              </Box>
              
              {isAuthenticated ? (
                <Link href="/dashboard" passHref>
                  <Button as="a" colorScheme="green" size={{ base: "sm", md: "md" }} fontSize={{ base: "xs", md: "sm" }}>DASHBOARD</Button>
                </Link>
              ) : (
                <Button 
                  colorScheme="green" 
                  size={{ base: "sm", md: "md" }} 
                  fontSize={{ base: "xs", md: "sm" }}
                  onClick={handleLoginClick}
                >
                  LOGIN
                </Button>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box 
        bg="gray.50" 
        pt={{ base: 16, md: 24 }} 
        pb={{ base: 20, md: 28 }}
        px={4}
      >
        <Container maxW="container.xl">
          <VStack spacing={8} align="center">
            <Heading 
              as="h2" 
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              fontWeight="bold"
              textAlign="center"
              color="gray.700"
              lineHeight="1.2"
            >
              DECENTRALIZING ACADEMIC RESEARCH
            </Heading>
            
            <Text 
              fontSize={{ base: "md", md: "lg" }}
              textAlign="center"
              maxW="2xl"
              color="gray.600"
            >
              A blockchain-powered platform for open access research publication, 
              peer review, and academic collaboration.
            </Text>
            
            <Box w="full" maxW="2xl">
              <form onSubmit={handleSearch}>
                <InputGroup size="lg">
                  <Input 
                    placeholder="Search for articles, authors, or topics..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    borderRadius="md"
                    focusBorderColor="green.400"
                    isDisabled={isSearching}
                    aria-label="Search articles"
                  />
                  <InputRightElement>
                    <Button 
                      h="1.75rem" 
                      size="sm" 
                      type="submit"
                      isLoading={isSearching}
                      aria-label="Search"
                    >
                      <FiSearch />
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </form>
            </Box>
            
            <HStack spacing={4} pt={4}>
              <Button 
                colorScheme="green" 
                size="lg"
                onClick={isAuthenticated ? () => window.location.href = '/submit' : handleRegisterClick}
              >
                {isAuthenticated ? 'Submit Research' : 'Get Started'}
              </Button>
              <Button 
                variant="outline" 
                colorScheme="green" 
                size="lg"
                rightIcon={<FiExternalLink />}
                as="a"
                href="/about/whitepaper"
              >
                Read Whitepaper
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box bg="white" py={16}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={10}>
            <Stat textAlign="center">
              <StatLabel fontSize="md" fontWeight="medium" color="gray.500">Articles Published</StatLabel>
              <StatNumber fontSize="4xl" fontWeight="bold" color="green.500">1,234</StatNumber>
              <StatHelpText>Since launch</StatHelpText>
            </Stat>
            
            <Stat textAlign="center">
              <StatLabel fontSize="md" fontWeight="medium" color="gray.500">Peer Reviewers</StatLabel>
              <StatNumber fontSize="4xl" fontWeight="bold" color="green.500">567</StatNumber>
              <StatHelpText>Active contributors</StatHelpText>
            </Stat>
            
            <Stat textAlign="center">
              <StatLabel fontSize="md" fontWeight="medium" color="gray.500">Citations</StatLabel>
              <StatNumber fontSize="4xl" fontWeight="bold" color="green.500">12.5K</StatNumber>
              <StatHelpText>Academic impact</StatHelpText>
            </Stat>
            
            <Stat textAlign="center">
              <StatLabel fontSize="md" fontWeight="medium" color="gray.500">RSKA Tokens</StatLabel>
              <StatNumber fontSize="4xl" fontWeight="bold" color="green.500">5.2M</StatNumber>
              <StatHelpText>In circulation</StatHelpText>
            </Stat>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={16} bg="gray.50">
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading as="h3" size="xl">How Researka Works</Heading>
              <Text color="gray.600" maxW="2xl">
                Our decentralized platform revolutionizes academic publishing through blockchain technology, 
                tokenized incentives, and community governance.
              </Text>
            </VStack>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
              <Box bg="white" p={8} borderRadius="lg" boxShadow="md">
                <Icon as={FiFileText} boxSize={12} color="green.500" mb={4} />
                <Heading as="h4" size="md" mb={4}>Open Access Publishing</Heading>
                <Text color="gray.600">
                  Publish your research with permanent storage on IPFS and Ethereum. 
                  Maintain ownership of your work while making it accessible to all.
                </Text>
              </Box>
              
              <Box bg="white" p={8} borderRadius="lg" boxShadow="md">
                <Icon as={FiUsers} boxSize={12} color="green.500" mb={4} />
                <Heading as="h4" size="md" mb={4}>Decentralized Peer Review</Heading>
                <Text color="gray.600">
                  Our transparent peer review process rewards quality reviews with RSKA tokens 
                  while ensuring academic rigor and integrity.
                </Text>
              </Box>
              
              <Box bg="white" p={8} borderRadius="lg" boxShadow="md">
                <Icon as={FiAward} boxSize={12} color="green.500" mb={4} />
                <Heading as="h4" size="md" mb={4}>Citation Royalties</Heading>
                <Text color="gray.600">
                  Earn RSKA tokens when your work is cited. Our smart contracts automatically 
                  distribute royalties based on citation impact.
                </Text>
              </Box>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Token Section */}
      <Box py={16} bg="white">
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
            <VStack align="start" spacing={6}>
              <Badge colorScheme="green" fontSize="sm" px={2} py={1}>Tokenomics</Badge>
              <Heading as="h3" size="xl">RSKA Token Economy</Heading>
              <Text color="gray.600">
                The RSKA token powers the Researka ecosystem, creating a sustainable economic model 
                for academic publishing and peer review.
              </Text>
              <Divider />
              <SimpleGrid columns={2} spacing={4} width="full">
                <Box>
                  <Text fontWeight="bold">Total Supply</Text>
                  <Text>100,000,000 RSKA</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Initial Price</Text>
                  <Text>$0.10 USD</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Staking APY</Text>
                  <Text>15-21%</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Review Reward</Text>
                  <Text>50 RSKA</Text>
                </Box>
              </SimpleGrid>
              <ChakraLink 
                href="/token-dashboard" 
                color="green.500" 
                fontSize="xs" 
                mt={2}
                _hover={{ textDecoration: 'underline' }}
                display="inline-flex"
                alignItems="center"
              >
                <Text>View Token Dashboard</Text>
                <Icon as={FiExternalLink} ml={1} />
              </ChakraLink>
            </VStack>
            
            <Box>
              {/* Token Distribution Chart Placeholder */}
              <Box 
                bg="gray.100" 
                borderRadius="lg" 
                height="300px" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
              >
                <Text color="gray.500">Token Distribution Chart</Text>
              </Box>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="gray.800" color="white" py={12}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
            <VStack align="start" spacing={4}>
              <Heading as="h4" size="md">Researka</Heading>
              <Text fontSize="sm" color="gray.400">
                Decentralizing academic research through blockchain technology and tokenized incentives.
              </Text>
            </VStack>
            
            <VStack align="start" spacing={2}>
              <Heading as="h4" size="sm" mb={2}>Platform</Heading>
              <ChakraLink href="/articles" fontSize="sm">Articles</ChakraLink>
              <ChakraLink href="/submit" fontSize="sm">Submit Research</ChakraLink>
              <ChakraLink href="/review" fontSize="sm">Peer Review</ChakraLink>
              <ChakraLink href="/token" fontSize="sm">RSKA Token</ChakraLink>
            </VStack>
            
            <VStack align="start" spacing={2}>
              <Heading as="h4" size="sm" mb={2}>Company</Heading>
              <ChakraLink href="/about" fontSize="sm">About Us</ChakraLink>
              <ChakraLink href="/team" fontSize="sm">Team</ChakraLink>
              <ChakraLink href="/careers" fontSize="sm">Careers</ChakraLink>
              <ChakraLink href="/contact" fontSize="sm">Contact</ChakraLink>
            </VStack>
            
            <VStack align="start" spacing={2}>
              <Heading as="h4" size="sm" mb={2}>Legal</Heading>
              <ChakraLink href="/terms" fontSize="sm">Terms of Service</ChakraLink>
              <ChakraLink href="/privacy" fontSize="sm">Privacy Policy</ChakraLink>
              <ChakraLink href="/cookies" fontSize="sm">Cookie Policy</ChakraLink>
            </VStack>
          </SimpleGrid>
          
          <Divider my={8} borderColor="gray.700" />
          
          <Flex 
            direction={{ base: "column", md: "row" }} 
            justify="space-between" 
            align={{ base: "center", md: "flex-start" }}
            fontSize="sm"
            color="gray.400"
          >
            <Text> 2025 Researka. All rights reserved.</Text>
            <HStack spacing={4} mt={{ base: 4, md: 0 }}>
              <ChakraLink href="https://twitter.com/researka" isExternal>Twitter</ChakraLink>
              <ChakraLink href="https://github.com/researka" isExternal>GitHub</ChakraLink>
              <ChakraLink href="https://discord.gg/researka" isExternal>Discord</ChakraLink>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Login Modal */}
      {/* <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeLoginModal} 
        onRegisterClick={handleRegisterClick} 
      /> */}

      {/* Register Modal */}
      {/* <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={closeRegisterModal} 
        onLoginClick={handleLoginClick}
      /> */}
    </Box>
  );
}
