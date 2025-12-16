/**
 * Color Theme for Agri eBook Hub
 * Agricultural-themed color palette inspired by lush green fields
 */

const Colors = {
  // Primary Green Colors - Main brand colors
  primary: {
    main: '#2E7D32',        // Deep forest green
    light: '#4CAF50',       // Vibrant green
    dark: '#1B5E20',       // Dark forest green
    lighter: '#81C784',    // Light green
    darkest: '#0D3E10',    // Very dark green
  },

  // Secondary Colors - Complementary to green
  secondary: {
    main: '#558B2F',       // Olive green
    light: '#8BC34A',      // Light green
    dark: '#33691E',       // Dark olive
    accent: '#9CCC65',     // Lime green accent
  },

  // Background Colors
  background: {
    primary: '#FFFFFF',    // Pure white
    secondary: '#F5F5F5',  // Light gray
    tertiary: '#E8F5E9',  // Very light green tint
    dark: '#121212',       // Dark mode background
    darkSecondary: '#1E1E1E', // Dark mode secondary
  },

  // Text Colors
  text: {
    primary: '#212121',    // Almost black
    secondary: '#424242',  // Dark gray
    tertiary: '#757575',   // Medium gray
    light: '#FFFFFF',      // White text
    disabled: '#BDBDBD',  // Light gray for disabled text
  },

  // Accent Colors
  accent: {
    success: '#4CAF50',    // Success green
    warning: '#FF9800',    // Orange warning
    error: '#F44336',      // Red error
    info: '#2196F3',       // Blue info
    gold: '#FFC107',       // Gold/yellow accent
  },

  // Field/Agricultural Colors
  field: {
    freshGreen: '#66BB6A', // Fresh crop green
    matureGreen: '#388E3C', // Mature crop green
    soil: '#8D6E63',       // Brown soil
    sky: '#87CEEB',        // Sky blue
    sun: '#FFD54F',        // Sun yellow
  },

  // Border Colors
  border: {
    light: '#E0E0E0',      // Light gray border
    medium: '#BDBDBD',     // Medium gray border
    dark: '#757575',       // Dark gray border
    primary: '#4CAF50',    // Green border
  },

  // Shadow Colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)',
    green: 'rgba(76, 175, 80, 0.2)', // Green shadow
  },

  // Card Colors
  card: {
    background: '#FFFFFF',
    backgroundDark: '#1E1E1E',
    border: '#E0E0E0',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },

  // Button Colors
  button: {
    primary: '#2E7D32',
    primaryPressed: '#1B5E20',
    secondary: '#558B2F',
    secondaryPressed: '#33691E',
    disabled: '#BDBDBD',
    text: '#FFFFFF',
    textDisabled: '#757575',
  },

  // Input/Form Colors
  input: {
    background: '#FFFFFF',
    backgroundDark: '#2C2C2C',
    border: '#BDBDBD',
    borderFocused: '#4CAF50',
    placeholder: '#9E9E9E',
    text: '#212121',
    textDark: '#FFFFFF',
  },

  // Navigation Colors
  navigation: {
    background: '#FFFFFF',
    backgroundDark: '#121212',
    active: '#2E7D32',
    inactive: '#9E9E9E',
    border: '#E0E0E0',
  },

  // Book/Content Colors
  book: {
    cover: '#4CAF50',
    coverDark: '#2E7D32',
    page: '#FFFEF7',      // Off-white page color
    text: '#212121',
    highlight: '#C8E6C9', // Light green highlight
  },
};

// Dark mode color scheme
const DarkColors = {
  ...Colors,
  background: {
    primary: '#121212',
    secondary: '#1E1E1E',
    tertiary: '#2C2C2C',
    dark: '#000000',
    darkSecondary: '#1E1E1E',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#E0E0E0',
    tertiary: '#BDBDBD',
    light: '#FFFFFF',
    disabled: '#757575',
  },
  card: {
    background: '#1E1E1E',
    backgroundDark: '#121212',
    border: '#333333',
    shadow: 'rgba(0, 0, 0, 0.5)',
  },
  input: {
    background: '#2C2C2C',
    backgroundDark: '#1E1E1E',
    border: '#424242',
    borderFocused: '#4CAF50',
    placeholder: '#757575',
    text: '#FFFFFF',
    textDark: '#FFFFFF',
  },
  navigation: {
    background: '#121212',
    backgroundDark: '#000000',
    active: '#4CAF50',
    inactive: '#757575',
    border: '#333333',
  },
};

// Helper function to get colors based on theme
export const getColors = (isDarkMode = false) => {
  return isDarkMode ? DarkColors : Colors;
};

export default Colors;

