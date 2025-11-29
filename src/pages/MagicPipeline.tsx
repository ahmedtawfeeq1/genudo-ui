
import React from 'react';
import ModernLayout from '@/components/layout/ModernLayout';
import MagicPipelineContent from '@/components/magic-pipeline/MagicPipelineContent';
import SEOHead from '@/components/common/SEOHead';
import { pageConfigs } from '@/utils/pageConfig';

const MagicPipeline = () => {
  return (
    <>
      <SEOHead 
        title={pageConfigs.magicPipeline.title}
        description={pageConfigs.magicPipeline.description}
        keywords={pageConfigs.magicPipeline.keywords}
      />
      <ModernLayout title="Magic Pipeline">
        <MagicPipelineContent />
      </ModernLayout>
    </>
  );
};

export default MagicPipeline;
