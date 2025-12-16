/**
 * Utility function to apply theme and font size to styles
 * This helps convert static Colors references to dynamic themeColors
 */

export const applyThemeToStyles = (baseStyles, themeColors, fontSizeMultiplier) => {
  const applyTheme = (styleObj) => {
    const themed = {};
    
    for (const [key, value] of Object.entries(styleObj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        themed[key] = applyTheme(value);
      } else if (typeof value === 'string' && value.includes('Colors.')) {
        // Replace Colors references with themeColors
        const colorPath = value.replace('Colors.', '');
        const pathParts = colorPath.split('.');
        let colorValue = themeColors;
        for (const part of pathParts) {
          colorValue = colorValue?.[part];
        }
        themed[key] = colorValue || value;
      } else if (key === 'fontSize' && typeof value === 'number') {
        themed[key] = value * fontSizeMultiplier;
      } else {
        themed[key] = value;
      }
    }
    
    return themed;
  };
  
  return applyTheme(baseStyles);
};

