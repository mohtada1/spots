// Design System Tokens based on design.json
export const designTokens = {
  colors: {
    primary: '#da3743',
    background: '#ffffff',
    text: '#333333',
    grayLight: '#f5f5f5',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
  },
  
  typography: {
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    sizes: {
      small: '14px',
      'small-medium': '16px',
      medium: '18px',
      'medium-large': '20px',
      large: '24px',
    },
  },
  
  shadows: {
    subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    lift: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  
  transitions: {
    fast: '200ms',
    easing: 'ease-out',
  },
} as const;

// Component-specific design tokens
export const componentTokens = {
  button: {
    primary: {
      background: designTokens.colors.primary,
      color: '#ffffff',
      borderRadius: designTokens.borderRadius.small,
      padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
      fontWeight: designTokens.typography.weights.semibold,
    },
    secondary: {
      background: 'transparent',
      color: designTokens.colors.text,
      border: `1px solid ${designTokens.colors.text}`,
      borderRadius: designTokens.borderRadius.small,
    },
    ghost: {
      background: 'transparent',
      color: designTokens.colors.primary,
      border: 'none',
    },
  },
  
  card: {
    restaurant: {
      padding: designTokens.spacing.md,
      shadow: designTokens.shadows.subtle,
      borderRadius: designTokens.borderRadius.small,
      hoverShadow: designTokens.shadows.lift,
    },
  },
  
  rating: {
    color: designTokens.colors.primary,
    starStyle: 'filled-solid',
  },
} as const;

// Utility classes for consistent styling
export const utilityClasses = {
  // Primary button styling
  buttonPrimary: `bg-food-primary text-white rounded-food-small px-food-md py-food-sm font-semibold hover:bg-red-600 transition-colors duration-200`,
  
  // Secondary button styling
  buttonSecondary: `bg-transparent text-food-text border border-food-text rounded-food-small px-food-md py-food-sm hover:bg-gray-50 transition-colors duration-200`,
  
  // Ghost button styling
  buttonGhost: `bg-transparent text-food-primary border-none px-food-md py-food-sm hover:bg-red-50 transition-colors duration-200`,
  
  // Card styling
  cardRestaurant: `bg-food-background rounded-food-small shadow-sm hover:shadow-md transition-shadow duration-200 p-food-md`,
  
  // Typography
  headingLarge: `text-2xl font-bold text-food-text`,
  headingMedium: `text-xl font-semibold text-food-text`,
  headingSmall: `text-lg font-medium text-food-text`,
  bodyText: `text-base font-normal text-food-text`,
  captionText: `text-sm font-normal text-gray-600`,
  
  // Layout
  containerPadding: `px-food-md md:px-food-lg`,
  sectionSpacing: `py-food-xl md:py-food-2xl`,
} as const;
