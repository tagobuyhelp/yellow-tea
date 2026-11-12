import PrivacyPolicy from '@/views/PrivacyPolicy';

export const metadata = {
  title: 'Privacy Policy | Yellow Tea',
  description: 'Learn how Yellow Tea collects, protects, and handles your personal information.',
  alternates: {
    canonical: 'https://yellowtea.in/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}
