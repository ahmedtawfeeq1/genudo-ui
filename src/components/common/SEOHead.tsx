
import { usePageTitle } from '@/hooks/usePageTitle';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
}

const SEOHead: React.FC<SEOHeadProps> = ({ title, description, keywords }) => {
  usePageTitle({ title, description, keywords });
  return null; // This component doesn't render anything visible
};

export default SEOHead;
