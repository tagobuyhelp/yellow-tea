import TermsOfService from '@/views/TermsOfService';

export const metadata = {
  title: 'Terms of Service | Yellow Tea',
  description: 'Terms and conditions governing the use of Yellow Tea e-commerce website and orders.',
  alternates: {
    canonical: 'https://yellowtea.in/terms-of-service',
  },
};

export default function TermsOfServicePage() {
  return <TermsOfService />;
}
