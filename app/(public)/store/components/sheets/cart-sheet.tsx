import { ShoppingCart, TrashIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toAbsoluteUrl } from '@/lib/helpers';
import { useStoreClient } from '@/app/(public)/store/components/context';

export function StoreClientCartSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: () => void;
}) {
  const { state, handleRemoveFromCart, handleUpdateCartItemQuantity, handleClearCart, cartTotal } = useStoreClient();
  const items = state.cartItems;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:w-[560px] sm:max-w-none inset-5 start-auto h-auto rounded-lg p-0 [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-3.5 px-5 border-border">
          <SheetTitle>Cart</SheetTitle>
        </SheetHeader>
        <SheetBody className="px-5 py-0">
          <ScrollArea className="h-[calc(100dvh-12rem)] pe-3 -me-3 space-y-5">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="size-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              items.map((item, index) => (
              <Card className="mb-5" key={index}>
                <CardContent className="p-2 pe-5 flex items-center flex-wrap sm:flex-nowrap w-full justify-between gap-3.5">
                  <div className="flex md:items-center gap-4">
                    <Card className="flex items-center justify-center bg-accent/50 h-[70px] w-[90px] shadow-none shrink-0">
                      <img
                        src={toAbsoluteUrl(`/media/store/client/600x600/${item.logo}`)}
                        className="h-[70px]"
                        alt="img"
                      />
                    </Card>

                    <div className="flex flex-col justify-center gap-2.5 -mt-1">
                      <Link
                        href="#"
                        className="hover:text-primary text-sm font-medium text-mono leading-5.5"
                      >
                        {item.title}
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-normal text-secondary-foreground">
                          SKU:{' '}
                          <span className="text-xs font-medium text-foreground">
                            {item.sku}
                          </span>
                        </span>
                        {item.badge && (
                          <Badge
                            size="sm"
                            variant="destructive"
                            className="uppercase shrink-0"
                          >
                            save 25%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center flex-col gap-3">
                    <div className="flex items-center sm:justify-end gap-2">
                      <Select 
                        value={item.quantity.toString()}
                        onValueChange={(value) => handleUpdateCartItemQuantity(item.id, parseInt(value))}
                      >
                        <SelectTrigger className="w-[50px]" size="sm">
                          <SelectValue placeholder={item.quantity.toString()} />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button 
                        size="sm" 
                        variant="outline" 
                        mode="icon"
                        onClick={() => handleRemoveFromCart(item.id)}
                      >
                        <TrashIcon/>
                      </Button>
                    </div>

                    <div className="flex items-center sm:justify-end gap-3">
                      {item.label && (
                        <span className="text-sm font-normal text-secondary-foreground line-through">
                          {item.label}
                        </span>
                      )}
                      <span className="text-sm font-semibold text-mono">
                        ${(parseFloat(item.total) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            )}

            {items.length > 0 && (
            <div className="flex items-center justify-end border-none rounded-md bg-accent/50 gap-5 py-2 px-3 !mt-[30px]">
              <span className="text-sm font-medium text-mono">Total</span>
                <span className="text-sm font-semibold text-dark">${cartTotal.toFixed(2)}</span>
            </div>
            )}
          </ScrollArea>
        </SheetBody>
        <SheetFooter className="flex-row border-t py-3.5 px-5 border-border gap-2 lg:gap-0">
          <Button variant="outline" onClick={handleClearCart} disabled={items.length === 0}>
            Clear Cart
          </Button>
          <Button 
            variant="primary" 
            className="grow" 
            asChild
            disabled={items.length === 0}
          >
            <Link href="/store/checkout/order-summary">
            <ShoppingCart />
            Checkout
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}


