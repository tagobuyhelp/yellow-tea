import React, { useEffect } from 'react';
import Shop from './Shop';
import { useNavigate, useSearchParams } from 'react-router-dom';

const TrialPacks: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // If not already filtered by Trial Packs, set the filter
    if (searchParams.get('category') !== 'trial-packs') {
      setSearchParams({ category: 'trial-packs' });
    }
  }, [searchParams, setSearchParams]);

  // Render Shop page with the current search params
  return <Shop />;
};

export default TrialPacks; 