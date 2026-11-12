import NotFound from '@/views/NotFound';

export const metadata = {
  title: 'Page Not Found | Yellow Tea',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFoundPage() {
  return <NotFound />;
}
