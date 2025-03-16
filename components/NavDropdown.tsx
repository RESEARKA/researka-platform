import React from 'react';
import { 
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button
} from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';

interface NavDropdownProps {
  title: string;
  items: Array<{
    label: string;
    href: string;
  }>;
}

const NavDropdown: React.FC<NavDropdownProps> = ({ title, items }) => {
  return (
    <Menu>
      <MenuButton 
        as={Button} 
        rightIcon={<FiChevronDown />}
        variant="ghost"
        size={{ base: "sm", md: "md" }}
      >
        {title}
      </MenuButton>
      <MenuList minWidth="180px">
        {items.map((item, index) => (
          <MenuItem key={index} as="a" href={item.href}>
            {item.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default NavDropdown;
