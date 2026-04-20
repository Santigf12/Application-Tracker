'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ApplicationIndexPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = params?.id ?? '';
  const page = searchParams.get('page') || '1';

  useEffect(() => {
    if (id) {
      router.replace(`/application/${id}/application?page=${page}`);
    }
  }, [id, page, router]);

  return null;
}