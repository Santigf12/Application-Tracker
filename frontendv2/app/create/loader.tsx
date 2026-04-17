'use client';

import dynamic from 'next/dynamic';

const CreatePageClient = dynamic(() => import('./client'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

export default function CreatePageLoader() {
  return <CreatePageClient />;
}