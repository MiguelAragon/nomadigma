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
import { MapPinned } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { ShippingInfoContent } from '@/app/(public)/store/checkout/shipping-info/content';
import { Steps } from '@/app/(public)/store/checkout/steps';

export default function ShippingInfoPage() {
  return (
    <Fragment>
      <Steps currentStep={1} />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text="Shipping Info" />
            <ToolbarDescription>
              Enter and confirm your delivery address
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button variant="outline">
              <MapPinned />
              <Link href="#">Add Address</Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <ShippingInfoContent />
      </Container>
    </Fragment>
  );
}
