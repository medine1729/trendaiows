
"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart, Wallet, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { walletService } from '@/lib/wallet-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice, cartCount, clearCart } = useCart();
  const [isPaying, setIsPaying] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{status: string; reason?: string} | null>(null);

  const handleCheckoutOWS = () => {
    setIsPaying(true);
    setPaymentResult(null);

    setTimeout(() => {
      // Simulate creating an invoice and processing payment
      const invoice = walletService.generateInvoice(totalPrice, 'TrendAI Shopping Cart Purchase');
      const result = walletService.processPayment(invoice, 'general');

      setPaymentResult({ status: result.status, reason: result.reason });
      setIsPaying(false);

      if (result.status === 'success') {
        clearCart();
      }
    }, 1500);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">My Cart ({cartCount} items)</h1>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-xl text-muted-foreground">Your cart is empty.</p>
          <Button asChild className="mt-4">
            <Link href="/">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center p-4 gap-4">
                      <div className="relative h-24 w-24 rounded-md overflow-hidden">
                        <Image
                          src={item.imageUrls[0]}
                          alt={item.name}
                          fill
                          className="object-cover"
                           data-ai-hint="product image"
                        />
                      </div>
                      <div className="flex-grow">
                        <Link href={`/product/${item.id}`} className="font-semibold hover:underline">
                          {item.name}
                        </Link>
                        <p className="text-muted-foreground text-sm">
                            {item.properties.color ? `${item.properties.color}` : ''}
                        </p>
                        <p className="text-lg font-bold text-primary mt-1">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                          className="w-14 h-8 text-center"
                          readOnly
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                {paymentResult && (
                  <div className={`w-full p-3 rounded-lg flex flex-col gap-1 text-sm ${paymentResult.status === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    <div className="flex items-center gap-2 font-semibold">
                      {paymentResult.status === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                      {paymentResult.status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
                    </div>
                    {paymentResult.reason && <p className="opacity-90">{paymentResult.reason}</p>}
                    {paymentResult.status === 'success' && <p>Your order is on its way. 🎉</p>}
                  </div>
                )}
                <Button 
                  size="lg" 
                  className="w-full font-bold shadow-md tracking-wide" 
                  style={{ background: 'linear-gradient(135deg, hsl(263 70% 50%), hsl(220 70% 50%))' }}
                  onClick={handleCheckoutOWS}
                  disabled={isPaying || totalPrice === 0}
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-5 w-5" />
                      Buy with OWS
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
