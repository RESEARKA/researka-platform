/**
 * useFormValidation Hook
 * 
 * A custom hook for form validation in the RESEARKA platform.
 * This hook provides a simple way to validate form inputs with custom validation rules.
 */

import { useState, useCallback, useMemo } from 'react';
import { createLogger, LogCategory } from '../utils/logger';

// Create a logger instance for this hook
const logger = createLogger('useFormValidation');

// Types for validation
export type ValidationRule<T> = {
  validate: (value: T, formValues?: Record<string, any>) => boolean;
  message: string;
};

export type FieldValidation<T> = {
  value: T;
  rules: ValidationRule<T>[];
  touched: boolean;
  error: string | null;
  isValid: boolean;
};

export type FormValidation = {
  [key: string]: FieldValidation<any>;
};

export type FormErrors = {
  [key: string]: string | null;
};

export type FormTouched = {
  [key: string]: boolean;
};

export type FormValues = {
  [key: string]: any;
};

/**
 * Custom hook for form validation
 * @param initialValues Initial form values
 * @param validationRules Validation rules for each field
 * @returns Form validation state and methods
 */
export function useFormValidation<T extends FormValues>(
  initialValues: T,
  validationRules: { [K in keyof T]?: ValidationRule<T[K]>[] } = {}
) {
  // Form state
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (name: keyof T, value: any, allValues: T = values): string | null => {
      const rules = validationRules[name] || [];
      
      for (const rule of rules) {
        if (!rule.validate(value, allValues)) {
          return rule.message;
        }
      }
      
      return null;
    },
    [validationRules, values]
  );

  /**
   * Validate all fields
   */
  const validateForm = useCallback(
    (formValues: T = values): FormErrors => {
      const newErrors: FormErrors = {};
      
      for (const key in validationRules) {
        if (Object.prototype.hasOwnProperty.call(validationRules, key)) {
          const error = validateField(key, formValues[key], formValues);
          
          if (error) {
            newErrors[key] = error;
          } else {
            newErrors[key] = null;
          }
        }
      }
      
      return newErrors;
    },
    [validateField, validationRules, values]
  );

  /**
   * Handle field change
   */
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = event.target;
      let parsedValue: any = value;
      
      // Convert value based on input type
      if (type === 'number') {
        parsedValue = value === '' ? '' : Number(value);
      } else if (type === 'checkbox') {
        parsedValue = (event.target as HTMLInputElement).checked;
      }
      
      setValues(prev => ({
        ...prev,
        [name]: parsedValue
      }));
      
      // Validate field if it's been touched
      if (touched[name]) {
        const error = validateField(name as keyof T, parsedValue);
        
        setErrors(prev => ({
          ...prev,
          [name]: error
        }));
      }
    },
    [touched, validateField]
  );

  /**
   * Set a specific field value
   */
  const setFieldValue = useCallback(
    (name: keyof T, value: any) => {
      setValues(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Validate field if it's been touched
      if (touched[name as string]) {
        const error = validateField(name, value);
        
        setErrors(prev => ({
          ...prev,
          [name]: error
        }));
      }
    },
    [touched, validateField]
  );

  /**
   * Handle field blur
   */
  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target;
      
      // Mark field as touched
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
      
      // Validate field
      const error = validateField(name as keyof T, value);
      
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    },
    [validateField]
  );

  /**
   * Set a field as touched
   */
  const setFieldTouched = useCallback(
    (name: keyof T, isTouched: boolean = true) => {
      setTouched(prev => ({
        ...prev,
        [name]: isTouched
      }));
      
      // Validate field if it's being touched
      if (isTouched) {
        const error = validateField(name, values[name]);
        
        setErrors(prev => ({
          ...prev,
          [name]: error
        }));
      }
    },
    [validateField, values]
  );

  /**
   * Reset the form
   */
  const resetForm = useCallback(
    (newValues: T = initialValues) => {
      setValues(newValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    },
    [initialValues]
  );

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    (onSubmit: (values: T, formikHelpers: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }) => void | Promise<any>) => {
      return async (event?: React.FormEvent<HTMLFormElement>) => {
        if (event) {
          event.preventDefault();
        }
        
        // Mark all fields as touched
        const allTouched: FormTouched = {};
        
        for (const key in validationRules) {
          if (Object.prototype.hasOwnProperty.call(validationRules, key)) {
            allTouched[key] = true;
          }
        }
        
        setTouched(allTouched);
        
        // Validate all fields
        const formErrors = validateForm(values);
        setErrors(formErrors);
        
        // Check if there are any errors
        const hasErrors = Object.values(formErrors).some(error => error !== null);
        
        if (!hasErrors) {
          setIsSubmitting(true);
          
          try {
            await onSubmit(values, {
              setSubmitting: setIsSubmitting,
              resetForm: () => resetForm()
            });
          } catch (error) {
            logger.error('Form submission error', {
              context: { error },
              category: LogCategory.FORM
            });
          } finally {
            setIsSubmitting(false);
          }
        } else {
          logger.warn('Form validation failed', {
            context: { errors: formErrors },
            category: LogCategory.FORM
          });
        }
      };
    },
    [resetForm, validateForm, validationRules, values]
  );

  /**
   * Check if the form is valid
   */
  const isValid = useMemo(() => {
    return Object.values(errors).every(error => error === null);
  }, [errors]);

  /**
   * Check if the form is dirty (values have changed)
   */
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [initialValues, values]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    resetForm,
    validateForm,
    validateField
  };
}

/**
 * Common validation rules
 */
export const validationRules = {
  required: (message: string = 'This field is required'): ValidationRule<any> => ({
    validate: (value) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string') return value.trim() !== '';
      if (Array.isArray(value)) return value.length > 0;
      return true;
    },
    message
  }),
  
  email: (message: string = 'Please enter a valid email address'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true; // Let required rule handle empty values
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      return emailRegex.test(value);
    },
    message
  }),
  
  minLength: (length: number, message?: string): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true; // Let required rule handle empty values
      return value.length >= length;
    },
    message: message || `Must be at least ${length} characters`
  }),
  
  maxLength: (length: number, message?: string): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true; // Let required rule handle empty values
      return value.length <= length;
    },
    message: message || `Must be at most ${length} characters`
  }),
  
  pattern: (regex: RegExp, message: string): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true; // Let required rule handle empty values
      return regex.test(value);
    },
    message
  }),
  
  min: (min: number, message?: string): ValidationRule<number> => ({
    validate: (value) => {
      if (value === undefined || value === null) return true; // Let required rule handle empty values
      return value >= min;
    },
    message: message || `Must be at least ${min}`
  }),
  
  max: (max: number, message?: string): ValidationRule<number> => ({
    validate: (value) => {
      if (value === undefined || value === null) return true; // Let required rule handle empty values
      return value <= max;
    },
    message: message || `Must be at most ${max}`
  }),
  
  matches: (field: string, message: string): ValidationRule<any> => ({
    validate: (value, formValues) => {
      if (!formValues) return true;
      return value === formValues[field];
    },
    message
  })
};

export default useFormValidation;
