'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/components/ui/toolbar';
import { Captions } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { OrderPlacedContent } from '@/app/(public)/store/checkout/order-placed/content';
import { Steps } from '@/app/(public)/store/checkout/steps';

export default function OrderPlacedPage() {
  return (
    <Fragment>
      <Steps currentStep={3} />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text="Order Placed" />
            <ToolbarDescription>
              Your purchase has been successfully completed
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button variant="outline">
              <Captions />
              <Link href="/store/my-orders">My Orders</Link>
            </Button>
            <Button>
              <Captions />
              <Link href="/store/my-orders">Continue Shopping</Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <OrderPlacedContent />
      </Container>
    </Fragment>
  );
}
