"use client";

import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/types';
import { Input } from './ui/input';

interface AddToCartButtonProps {
    product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
    const { items, addToCart, updateQuantity } = useCart();
    
    const cartItem = items.find(item => item.id === product.id);

    if (cartItem) {
        return (
             <div className="flex items-center gap-2 justify-center w-full sm:w-auto flex-grow">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11"
                  onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <span className="text-xl font-bold w-12 text-center">{cartItem.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11"
                  onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
        )
    }
    
    return (
        <Button size="lg" className="w-full sm:w-auto flex-grow" onClick={() => addToCart(product)}>
            <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
        </Button>
    )
}
