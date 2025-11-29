
import { useEffect } from 'react';

interface PageTitleOptions {
  title?: string;
  description?: string;
  keywords?: string[];
}

export const usePageTitle = ({ title, description, keywords }: PageTitleOptions = {}) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = `${title} - GenuDo AI`;
    } else {
      document.title = 'GenuDo AI | Advanced AI Sales Agents Platform';
    }

    // Update meta description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }

    // Update meta keywords
    if (keywords && keywords.length > 0) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords.join(', '));
    }
  }, [title, description, keywords]);
};
