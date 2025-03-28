/**
 * Types for the navbar components
 */

/**
 * User profile data structure
 */
export interface UserProfileData {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  profileComplete?: boolean;
  [key: string]: any; // Allow for additional properties
}

/**
 * Navigation item structure
 */
export interface NavItem {
  label: string;
  href: string;
}

/**
 * Props for the NavItem component
 */
export interface NavItemProps {
  href: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

/**
 * Props for the NavDropdown component
 */
export interface NavDropdownProps {
  label: string;
  items: NavItem[];
}

/**
 * Props for the UserMenu component
 */
export interface UserMenuProps {
  userProfile: UserProfileData | null;
  isAdmin: boolean;
  onLogout: () => Promise<void>;
}

/**
 * Props for the AuthButtons component
 */
export interface AuthButtonsProps {
  isLoggedIn: boolean;
  onLoginClick: (redirectPath?: string) => void;
  onLogout: () => Promise<void>;
}

/**
 * Props for the NavBar component
 */
export interface NavBarProps {
  activePage?: string;
  isLoggedIn?: boolean;
  onLoginClick?: (redirectPath?: string) => void;
}

/**
 * Props for the NavLinks component
 */
export interface NavLinksProps {
  activePage: string;
  isLoggedIn: boolean;
}
