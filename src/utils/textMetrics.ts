/**
 * Text Metrics Utility Functions
 * For AI Configuration text fields quality assessment
 */

export interface QualityLevel {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  message?: string;
}

/**
 * Count words in text (splits by whitespace)
 */
export const countWords = (text: string): number => {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
};

/**
 * Count characters (excluding whitespace)
 */
export const countCharacters = (text: string): number => {
  if (!text) return 0;
  return text.replace(/\s/g, '').length;
};

/**
 * Get quality level for AI Persona field (based on word count)
 * < 100: Not enough
 * 100-199: Medium
 * 200-300: Good
 * > 300: Too much
 */
export const getPersonaQuality = (wordCount: number): QualityLevel => {
  if (wordCount === 0) {
    return { label: 'Empty', variant: 'outline' };
  }
  if (wordCount < 100) {
    return { label: 'Not enough', variant: 'warning' };
  }
  if (wordCount < 200) {
    return { label: 'Medium', variant: 'secondary' };
  }
  if (wordCount <= 300) {
    return { label: 'Good', variant: 'success' };
  }
  return {
    label: 'Too much',
    variant: 'destructive',
    message: 'Consider reducing'
  };
};

/**
 * Get quality level for Stage Instructions field (based on word count)
 * < 300: Not enough
 * 300-699: Medium
 * 700-1000: Good
 * > 1000: Too much
 */
export const getInstructionsQuality = (wordCount: number): QualityLevel => {
  if (wordCount === 0) {
    return { label: 'Empty', variant: 'outline' };
  }
  if (wordCount < 300) {
    return { label: 'Not enough', variant: 'warning' };
  }
  if (wordCount < 700) {
    return { label: 'Medium', variant: 'secondary' };
  }
  if (wordCount <= 1000) {
    return { label: 'Good', variant: 'success' };
  }
  return {
    label: 'Too much',
    variant: 'destructive',
    message: 'Consider reducing'
  };
};

/**
 * Get quality level for Important Notes field (based on word count)
 * < 100: Not enough
 * 100-299: Medium
 * 300-500: Good
 * > 500: Too much
 */
export const getImportantNotesQuality = (wordCount: number): QualityLevel => {
  if (wordCount === 0) {
    return { label: 'Empty', variant: 'outline' };
  }
  if (wordCount < 100) {
    return { label: 'Not enough', variant: 'warning' };
  }
  if (wordCount < 300) {
    return { label: 'Medium', variant: 'secondary' };
  }
  if (wordCount <= 500) {
    return { label: 'Good', variant: 'success' };
  }
  return {
    label: 'Too much',
    variant: 'destructive',
    message: 'Consider reducing'
  };
};

/**
 * Get quality level for total instructions across all fields (based on word count)
 * < 500: Not enough
 * 500-1199: Medium
 * 1200-1800: Good
 * > 1800: Too much
 */
export const getTotalQuality = (totalWords: number): QualityLevel => {
  if (totalWords === 0) {
    return { label: 'Empty', variant: 'outline' };
  }
  if (totalWords < 500) {
    return { label: 'Not enough', variant: 'warning' };
  }
  if (totalWords < 1200) {
    return { label: 'Medium', variant: 'secondary' };
  }
  if (totalWords <= 1800) {
    return { label: 'Good', variant: 'success' };
  }
  return {
    label: 'Too much',
    variant: 'destructive',
    message: 'Consider reducing or removing redundant instructions'
  };
};
