import { useState, useEffect } from 'react';
import { paymentAPI } from '@/services/payments';

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  methods: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  isActive: boolean;
}

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await paymentAPI.getPaymentMethods();
      setPaymentMethods(response.data);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setError('Failed to load payment methods');
      
      // Fallback to default payment methods
      setPaymentMethods([
        {
          id: 'razorpay',
          name: 'Razorpay',
          description: 'Pay securely with cards, UPI, net banking, and wallets',
          methods: [
            { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
            { id: 'upi', name: 'UPI', icon: '📱' },
            { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
            { id: 'wallet', name: 'Digital Wallets', icon: '👛' }
          ],
          isActive: true
        },
        {
          id: 'cod',
          name: 'Cash on Delivery',
          description: 'Pay with cash when your order is delivered',
          methods: [
            { id: 'cod', name: 'Cash on Delivery', icon: '💵' }
          ],
          isActive: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const getPaymentMethodById = (id: string) => {
    return paymentMethods.find(method => method.id === id);
  };

  const getActivePaymentMethods = () => {
    return paymentMethods.filter(method => method.isActive);
  };

  return {
    paymentMethods,
    loading,
    error,
    fetchPaymentMethods,
    getPaymentMethodById,
    getActivePaymentMethods
  };
}; 