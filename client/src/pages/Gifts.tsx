import React, { useEffect } from 'react';
import Shop from './Shop';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Gifts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // If not already filtered by Gift Boxes, set the filter
    if (searchParams.get('category') !== 'gift-boxes') {
      setSearchParams({ category: 'gift-boxes' });
    }
  }, [searchParams, setSearchParams]);

  // Render Shop page with the current search params
  return <Shop />;
};

export default Gifts; 