import { NextPage } from 'next';
import { ErrorProps } from 'next/error';
import { Box, Heading, Text, Container, Button } from '@chakra-ui/react';
import Layout from '../components/Layout';

const ErrorPage: NextPage<ErrorProps> = ({ statusCode }) => {
  return (
    <Layout title={`Error ${statusCode || 'Unknown'} | RESEARKA`} description="An error occurred">
      <Container maxW="container.md" py={10}>
        <Box textAlign="center" py={10} px={6}>
          <Heading
            display="inline-block"
            as="h2"
            size="2xl"
            bgGradient="linear(to-r, green.400, green.600)"
            backgroundClip="text"
          >
            {statusCode || 'Error'}
          </Heading>
          <Text fontSize="18px" mt={3} mb={6}>
            {statusCode
              ? `An error ${statusCode} occurred on the server`
              : 'An error occurred on the client'}
          </Text>
          <Button
            colorScheme="green"
            bgGradient="linear(to-r, green.400, green.500, green.600)"
            color="white"
            variant="solid"
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </Button>
        </Box>
      </Container>
    </Layout>
  );
};

ErrorPage.getInitialProps = ({ res, err }: any) => {
  // Use any type here to avoid issues with NextPageContext type
  const statusCode = res ? res.statusCode : err ? err.statusCode ?? 404 : 404;
  return { statusCode };
};

export default ErrorPage;
