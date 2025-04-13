import React from 'react';
import { Icon, IconProps } from '@chakra-ui/react';

/**
 * ORCID icon component that displays the official ORCID logo
 * Used to identify and link to ORCID profiles
 */
export const OrcidIcon: React.FC<IconProps> = (props) => (
  <Icon 
    viewBox="0 0 24 24" 
    aria-label="ORCID identifier" 
    role="img"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 2.824a9.176 9.176 0 110 18.352 9.176 9.176 0 010-18.352zm-2.118 4.941c-.735 0-1.33.595-1.33 1.33v6.47c0 .735.595 1.33 1.33 1.33s1.33-.595 1.33-1.33v-6.47c0-.735-.595-1.33-1.33-1.33zm0-1.177a1.177 1.177 0 110-2.353 1.177 1.177 0 010 2.353zm7.647 2.47h-3.53v6.47c0 .735.595 1.33 1.33 1.33s1.33-.595 1.33-1.33v-1.977h.87c1.654 0 3-1.346 3-3s-1.346-3-3-3zm0 4.235h-.87v-2.47h.87c.683 0 1.235.552 1.235 1.235s-.552 1.235-1.235 1.235z"
    />
  </Icon>
);
