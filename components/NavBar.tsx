import React from 'react';
import { 
  Box, 
  Flex, 
  HStack, 
  Button, 
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Container,
  Heading,
  Link as ChakraLink
} from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';

const NavBar: React.FC = () => {
  return (
    <Box borderBottom="1px" borderColor="gray.200" py={2}>
      <Container maxW="container.xl">
        <Flex 
          justify="space-between" 
          align="center"
          direction={{ base: "column", md: "row" }}
          gap={{ base: 4, md: 0 }}
        >
          <ChakraLink href="/" _hover={{ textDecoration: 'none' }}>
            <Heading as="h1" size="lg" color="green.400">RESEARKA</Heading>
          </ChakraLink>
          
          <HStack 
            spacing={{ base: 2, md: 4 }}
            flexWrap={{ base: "wrap", md: "nowrap" }}
            justifyContent={{ base: "center", md: "flex-end" }}
          >
            <Button as="a" href="/" variant="ghost" colorScheme="blue" isActive={true} size={{ base: "sm", md: "md" }}>HOME</Button>
            <Button as="a" href="/search" variant="ghost" size={{ base: "sm", md: "md" }}>SEARCH</Button>
            <Button as="a" href="/submit" variant="ghost" size={{ base: "sm", md: "md" }}>SUBMIT</Button>
            <Button as="a" href="/review" variant="ghost" size={{ base: "sm", md: "md" }}>REVIEW</Button>
            
            {/* INFO Dropdown */}
            <Menu>
              <MenuButton 
                as={Button} 
                rightIcon={<FiChevronDown />}
                variant="ghost"
                size={{ base: "sm", md: "md" }}
              >
                INFO
              </MenuButton>
              <MenuList minWidth="180px">
                <MenuItem as="a" href="/info/roles">ROLES</MenuItem>
                <MenuItem as="a" href="/info/about">ABOUT</MenuItem>
                <MenuItem as="a" href="/info/team">TEAM</MenuItem>
                <MenuItem as="a" href="/info/whitepaper">WHITEPAPER</MenuItem>
                <MenuItem as="a" href="/info/contact">CONTACT</MenuItem>
              </MenuList>
            </Menu>
            
            {/* GOVERNANCE Dropdown */}
            <Menu>
              <MenuButton 
                as={Button} 
                rightIcon={<FiChevronDown />}
                variant="ghost"
                size={{ base: "sm", md: "md" }}
              >
                GOVERNANCE
              </MenuButton>
              <MenuList minWidth="180px">
                <MenuItem as="a" href="/governance/legal">LEGAL</MenuItem>
                <MenuItem as="a" href="/governance/privacy-policy">PRIVACY POLICY</MenuItem>
                <MenuItem as="a" href="/governance/cookie-policy">COOKIE POLICY</MenuItem>
                <MenuItem as="a" href="/governance/privacy-center">PRIVACY CENTER</MenuItem>
              </MenuList>
            </Menu>
            
            <Button as="a" href="/login" colorScheme="blue" size={{ base: "sm", md: "md" }}>LOGIN</Button>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default NavBar;
