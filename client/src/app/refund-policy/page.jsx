import RefundPolicy from '@/views/RefundPolicy';

export const metadata = {
  title: 'Refund & Return Policy | Yellow Tea',
  description: 'Understand the return, refund, and replacement policies for Yellow Tea products.',
  alternates: {
    canonical: 'https://yellowtea.in/refund-policy',
  },
};

export default function RefundPolicyPage() {
  return <RefundPolicy />;
}
