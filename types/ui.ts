/**
 * UI Types
 * 
 * This file contains UI-related types for the RESEARKA platform.
 */

import { ReactNode } from 'react';

/**
 * Props for components that can have children
 */
export interface WithChildrenProps {
  children: ReactNode;
}

/**
 * Props for components that can be styled with Chakra UI
 */
export interface StyleProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Base component props
 */
export interface BaseComponentProps extends StyleProps {
  id?: string;
  'data-testid'?: string;
}

/**
 * Modal props
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Toast notification types
 */
export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Toast notification props
 */
export interface ToastProps {
  title: string;
  description?: string;
  status: ToastType;
  duration?: number;
  isClosable?: boolean;
  position?: 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left';
}

/**
 * Button variants
 */
export enum ButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  OUTLINE = 'outline',
  GHOST = 'ghost',
  LINK = 'link'
}

/**
 * Button sizes
 */
export enum ButtonSize {
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl'
}

/**
 * Button props
 */
export interface ButtonProps extends BaseComponentProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Input props
 */
export interface InputProps extends BaseComponentProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

/**
 * Form field props
 */
export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  helperText?: string;
  errorText?: string;
  isRequired?: boolean;
  isInvalid?: boolean;
}
