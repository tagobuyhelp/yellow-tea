import { useEffect, useState } from 'react';

export function useAdminSettings() {
  // Hardcoded frontend settings
  const [settings] = useState({
    chargeDelivery: true,
    chargeGST: true,
    pickupPincode: '741165',
  });
  const [loading] = useState(false);

  return { settings, loading };
} 