import React from 'react';
import { NextPage, NextPageContext } from 'next';
import { Box, Heading, Text, Button, VStack, useColorModeValue } from '@chakra-ui/react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

interface ErrorProps {
  statusCode: number | null;
  hasGetInitialPropsRun?: boolean;
  err?: Error | null;
}

const ErrorPage: NextPage<ErrorProps> = ({ statusCode, hasGetInitialPropsRun, err }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // If getInitialProps has run and we have an error, report it to Sentry
  if (err && hasGetInitialPropsRun) {
    // Log error to Sentry
    Sentry.captureException(err);
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      p={4}
    >
      <Box
        p={6}
        borderRadius="lg"
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="md"
        maxWidth="500px"
        width="100%"
      >
        <VStack spacing={4} align="flex-start">
          <Heading size="lg" color="red.500">
            {statusCode
              ? `An error ${statusCode} occurred on server`
              : 'An error occurred on client'}
          </Heading>
          <Text>
            {statusCode === 404
              ? 'The page you are looking for might have been removed or is temporarily unavailable.'
              : 'Something went wrong. Our team has been notified.'}
          </Text>
          <Box pt={4} width="100%">
            <Link href="/" passHref>
              <Button as="a" colorScheme="blue" width="100%">
                Return to Home
              </Button>
            </Link>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

ErrorPage.getInitialProps = async ({ res, err }: NextPageContext): Promise<ErrorProps> => {
  const statusCode = res ? res.statusCode : err ? (err as any).statusCode ?? 500 : 404;
  
  // This will contain the status code of the response
  return {
    statusCode,
    hasGetInitialPropsRun: true,
    err: err || null
  };
};

export default ErrorPage;
