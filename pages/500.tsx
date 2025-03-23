import React from 'react';
import { Box, Heading, Text, Button, VStack, useColorModeValue } from '@chakra-ui/react';
import Link from 'next/link';
import Head from 'next/head';

const ServerErrorPage: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <>
      <Head>
        <title>Server Error | Researka Platform</title>
      </Head>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        p={4}
      >
        <Box
          p={8}
          borderRadius="lg"
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="md"
          maxWidth="500px"
          width="100%"
          textAlign="center"
        >
          <VStack spacing={6}>
            <Heading as="h1" size="xl">500</Heading>
            <Heading as="h2" size="md">Server Error</Heading>
            <Text color={textColor}>
              Sorry, something went wrong on our server. Our team has been notified and is working to fix the issue.
            </Text>
            <Box pt={4} width="100%">
              <Link href="/" passHref>
                <Button as="a" colorScheme="blue" size="lg" width={['100%', 'auto']}>
                  Return to Home
                </Button>
              </Link>
            </Box>
          </VStack>
        </Box>
      </Box>
    </>
  );
};

export default ServerErrorPage;
