import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

// Color palette
export const COLORS = {
  // Primary colors
  primary: '#5E72E4',
  primaryDark: '#324AB2',
  primaryLight: '#8F9FF3',

  // Secondary colors
  secondary: '#FF7F50',
  secondaryDark: '#E65A2C',
  secondaryLight: '#FFA07A',

  // Accent colors
  accent: '#11CDEF',
  accentDark: '#0B9BBF',
  accentLight: '#5FE3FF',

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8898AA',
  lightGray: '#E0E0E0',
  darkGray: '#525F7F',

  // Status colors
  success: '#2DCE89',
  warning: '#FB6340',
  error: '#F5365C',
  info: '#11CDEF',

  // Background colors
  background: '#F4F5F7',
  card: '#FFFFFF',

  // Text colors
  text: '#32325D',
  textLight: '#525F7F',
  textDark: '#1A1A1A',
  textMuted: '#8898AA',
};

// Typography
export const FONTS = {
  // Font families
  regular: 'System',
  medium: 'System',
  bold: 'System',

  // Font sizes
  h1: 30,
  h2: 24,
  h3: 20,
  h4: 18,
  h5: 16,
  body: 14,
  caption: 12,
  small: 10,
};

// Spacing
export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
};

// Border radius
export const BORDER_RADIUS = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  round: 50,
};

// Shadows
export const SHADOWS = {
  small: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Screen dimensions
export const SIZES = {
  width,
  height,
  // Responsive sizes for portrait mode and landscape mode
  screenWidth: width < height ? width : height,
  screenHeight: width < height ? height : width,
};

// Animation constants
export const ANIMATION = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};

export default {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  SIZES,
  ANIMATION,
};
