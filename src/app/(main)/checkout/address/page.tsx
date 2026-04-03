
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Truck } from 'lucide-react';

export default function AddressPage() {
  return (
    <div className="container mx-auto py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Truck className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Delivery Address</h1>
          </div>
          <CardDescription>Where would you like us to send your order?</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input id="fullname" placeholder="Full Name" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address1">Address Line 1</Label>
              <Input id="address1" placeholder="Street, Neighborhood, Door No" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address2">Address Line 2 (Optional)</Label>
              <Input id="address2" placeholder="Apartment, Suite, Floor, etc." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="New York" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="postal-code">Postal Code</Label>
                <Input id="postal-code" placeholder="10001" required />
              </div>
            </div>
            
            <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="123 456 7890" required />
            </div>

            <Separator className="my-4" />

            <Button asChild size="lg" className="w-full">
              <Link href="/checkout/payment">Continue to Payment</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
