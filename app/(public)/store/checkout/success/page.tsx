'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { CheckoutSuccessContent } from '@/app/(public)/store/checkout/success/content';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <Container>
      <CheckoutSuccessContent sessionId={sessionId} />
    </Container>
  );
}

