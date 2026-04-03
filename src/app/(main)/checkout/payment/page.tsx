
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
  const { toast } = useToast();
  const router = useRouter();

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would process the payment here.
    toast({
      title: 'Payment Successful!',
      description: 'Your order has been received. Redirecting to home.',
    });
    // Here you would also clear the cart.
    router.push('/');
  };

  return (
    <div className="container mx-auto py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Payment Information</h1>
          </div>
          <CardDescription>Please enter your card details for secure payment.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePayment} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="card-name">Name on Card</Label>
              <Input id="card-name" placeholder="Full Name" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input id="card-number" placeholder="0000 0000 0000 0000" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="expiry-date">Expiry Date</Label>
                <Input id="expiry-date" placeholder="MM/YY" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" required />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full mt-4">
              Complete Payment and Place Order
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
