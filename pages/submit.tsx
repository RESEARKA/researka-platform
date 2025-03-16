import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Badge,
  Divider,
  Flex,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FiUpload, FiDollarSign, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function Submit() {
  const router = useRouter();
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    keywords: '',
    category: '',
    file: null as File | null,
  });

  // Redirect if not authenticated
  if (typeof window !== 'undefined' && !isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        file: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Submission received',
        description: 'Your article has been submitted for review.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      router.push('/submit/success');
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: 'There was an error submitting your article. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate submission fee based on tokenomics
  const submissionFee = 100; // 100 RSKA tokens
  const feeInUSD = 10; // $10 USD

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={2}>Submit Your Research</Heading>
          <Text color="gray.600">Share your work with the academic community</Text>
        </Box>

        <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
          <Box flex="3">
            <Card variant="outline" bg="white" boxShadow="md" borderRadius="lg">
              <CardHeader pb={0}>
                <Heading size="md">Article Submission</Heading>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={6} align="stretch">
                    <FormControl isRequired>
                      <FormLabel>Title</FormLabel>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter the title of your research paper"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Abstract</FormLabel>
                      <Textarea
                        name="abstract"
                        value={formData.abstract}
                        onChange={handleChange}
                        placeholder="Provide a brief summary of your research"
                        minHeight="150px"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Keywords</FormLabel>
                      <Input
                        name="keywords"
                        value={formData.keywords}
                        onChange={handleChange}
                        placeholder="Enter keywords separated by commas"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Category</FormLabel>
                      <Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="Select category"
                      >
                        <option value="life-sciences">Life Sciences & Biomedicine</option>
                        <option value="physical-sciences">Physical Sciences</option>
                        <option value="technology">Technology & Engineering</option>
                        <option value="social-sciences">Social Sciences</option>
                        <option value="arts-humanities">Arts & Humanities</option>
                        <option value="multidisciplinary">Multidisciplinary</option>
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Upload Paper (PDF)</FormLabel>
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        p={1}
                      />
                    </FormControl>

                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Submission Fee</AlertTitle>
                        <AlertDescription>
                          A fee of {submissionFee} RSKA tokens (approx. ${feeInUSD}) will be charged for this submission.
                        </AlertDescription>
                      </Box>
                    </Alert>

                    <Button
                      type="submit"
                      colorScheme="green"
                      size="lg"
                      isLoading={isLoading}
                      loadingText="Submitting"
                      leftIcon={<FiUpload />}
                    >
                      Submit Paper
                    </Button>
                  </VStack>
                </form>
              </CardBody>
            </Card>
          </Box>

          <Box flex="2">
            <VStack spacing={6} align="stretch">
              <Card variant="outline" bg="white" boxShadow="md" borderRadius="lg">
                <CardHeader pb={0}>
                  <Heading size="md">Tokenomics Benefits</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack>
                      <Icon as={FiDollarSign} color="green.500" boxSize={5} />
                      <Box>
                        <Text fontWeight="bold">Citation Royalties</Text>
                        <Text fontSize="sm">Earn RSKA tokens when your paper is cited by others</Text>
                      </Box>
                    </HStack>
                    
                    <HStack>
                      <Icon as={FiCheckCircle} color="blue.500" boxSize={5} />
                      <Box>
                        <Text fontWeight="bold">Review Rewards</Text>
                        <Text fontSize="sm">Earn 50 RSKA tokens for each peer review you complete</Text>
                      </Box>
                    </HStack>
                    
                    <HStack>
                      <Icon as={FiInfo} color="purple.500" boxSize={5} />
                      <Box>
                        <Text fontWeight="bold">Staking Benefits</Text>
                        <Text fontSize="sm">Stake your tokens to earn 15-21% APY and reduce fees</Text>
                      </Box>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              <Card variant="outline" bg="white" boxShadow="md" borderRadius="lg">
                <CardHeader pb={0}>
                  <Heading size="md">Submission Guidelines</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <Text>• File must be in PDF format</Text>
                    <Text>• Maximum file size: 20MB</Text>
                    <Text>• Include all figures and tables in the document</Text>
                    <Text>• References should follow APA or IEEE format</Text>
                    <Text>• Ensure proper citation of all sources</Text>
                    <Text>• Remove any identifying information for blind review</Text>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </Box>
        </Flex>
      </VStack>
    </Container>
  );
}
