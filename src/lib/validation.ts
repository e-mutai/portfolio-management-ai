/**
 * Email validation utility
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password strength validation
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} => {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Determine strength
  if (errors.length === 0) {
    strength = 'strong';
  } else if (errors.length <= 2) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
};

/**
 * Phone number validation (international format)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Name validation (first name, last name)
 */
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
  return nameRegex.test(name.trim());
};

/**
 * Investment amount validation
 */
export const validateInvestmentAmount = (
  amount: number,
  minAmount: number = 0,
  maxAmount: number = 1000000
): {
  isValid: boolean;
  error?: string;
} => {
  if (isNaN(amount) || amount < 0) {
    return {
      isValid: false,
      error: 'Please enter a valid amount',
    };
  }

  if (amount < minAmount) {
    return {
      isValid: false,
      error: `Minimum investment amount is $${minAmount}`,
    };
  }

  if (amount > maxAmount) {
    return {
      isValid: false,
      error: `Maximum investment amount is $${maxAmount}`,
    };
  }

  return { isValid: true };
};

/**
 * Risk tolerance validation
 */
export const isValidRiskTolerance = (
  riskTolerance: string
): riskTolerance is 'conservative' | 'moderate' | 'aggressive' => {
  return ['conservative', 'moderate', 'aggressive'].includes(riskTolerance);
};

/**
 * Investment experience validation
 */
export const isValidInvestmentExperience = (
  experience: string
): experience is 'beginner' | 'intermediate' | 'advanced' => {
  return ['beginner', 'intermediate', 'advanced'].includes(experience);
};

/**
 * Stock symbol validation
 */
export const isValidStockSymbol = (symbol: string): boolean => {
  const symbolRegex = /^[A-Z]{1,5}$/;
  return symbolRegex.test(symbol.toUpperCase());
};

/**
 * Date validation (must be 18+ years old)
 */
export const isValidAge = (dateOfBirth: string): boolean => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18;
  }

  return age >= 18;
};

/**
 * Form field required validation
 */
export const isRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * Generic form validation
 */
export interface ValidationRule {
  field: string;
  value: any;
  rules: Array<{
    type: 'required' | 'email' | 'minLength' | 'maxLength' | 'custom';
    message: string;
    validator?: (value: any) => boolean;
    param?: any;
  }>;
}

export const validateForm = (validationRules: ValidationRule[]): {
  isValid: boolean;
  errors: { field: string; message: string }[];
} => {
  const errors: { field: string; message: string }[] = [];

  validationRules.forEach(({ field, value, rules }) => {
    rules.forEach(rule => {
      let isValid = true;

      switch (rule.type) {
        case 'required':
          isValid = isRequired(value);
          break;
        case 'email':
          isValid = !value || isValidEmail(value);
          break;
        case 'minLength':
          isValid = !value || value.toString().length >= rule.param;
          break;
        case 'maxLength':
          isValid = !value || value.toString().length <= rule.param;
          break;
        case 'custom':
          isValid = !rule.validator || rule.validator(value);
          break;
        default:
          isValid = true;
      }

      if (!isValid) {
        errors.push({ field, message: rule.message });
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};
