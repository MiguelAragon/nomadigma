'use client';

import { Container } from '@/components/ui/container';
import { OrderReceiptContent } from '@/app/(public)/store/order-receipt/content';

export default function OrderReceiptPage() {
  return (
    <Container>
      <OrderReceiptContent />
    </Container>
  );
}
