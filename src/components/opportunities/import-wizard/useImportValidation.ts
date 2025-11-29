
interface ImportedOpportunity {
  client_name: string;
  phone: string;
  email?: string;
  source?: string;
  notes?: string;
  preferred_language: string;
  preferred_dialect: string;
  isValid: boolean;
  errors: string[];
}

export const useImportValidation = () => {
  const validateOpportunity = (row: any): ImportedOpportunity => {
    const errors: string[] = [];

    // Required field validations
    if (!row['Client Name']?.toString().trim()) {
      errors.push('Client Name is required');
    }
    if (!row['Phone Number']?.toString().trim()) {
      errors.push('Phone Number is required');
    }
    if (!row['Preferred Language']?.toString().trim()) {
      errors.push('Preferred Language is required');
    }
    if (!row['Preferred Dialect']?.toString().trim()) {
      errors.push('Preferred Dialect is required');
    }

    // Format validations
    const email = row['Email']?.toString().trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email format');
    }
    
    const phone = row['Phone Number']?.toString().trim();
    if (phone) {
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
      if (!/^[\+]?[0-9]{7,15}$/.test(cleanPhone)) {
        errors.push(`Invalid phone format: "${phone}". Use numbers only, 7-15 digits`);
      }
    }

    const language = row['Preferred Language']?.toString().trim();
    const dialect = row['Preferred Dialect']?.toString().trim();

    return {
      client_name: row['Client Name']?.toString().trim() || '',
      phone: row['Phone Number']?.toString().trim() || '',
      email: email || '',
      source: row['Source']?.toString().trim() || '',
      notes: row['Notes']?.toString().trim() || '',
      preferred_language: language || '',
      preferred_dialect: dialect || '',
      isValid: errors.length === 0,
      errors
    };
  };

  return { validateOpportunity };
};
