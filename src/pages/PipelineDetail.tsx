
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PipelineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the stages view for this pipeline
    if (id) {
      navigate(`/pipelines/${id}/stages`, { replace: true });
    }
  }, [id, navigate]);

  return null; // This component just redirects
};

export default PipelineDetail;
