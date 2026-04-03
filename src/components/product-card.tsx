
"use client"

import Image from 'next/image';
import Link from 'next/link';
import { Heart, X, ShoppingCart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/types';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/cart-context';

interface ProductCardProps {
  product: Product & { suitabilityExplanation?: string };
  onRemove?: (productId: string) => void;
}

export function ProductCard({ product, onRemove }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsLiked(!isLiked);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onRemove) onRemove(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product);
  };

  const hasDiscount = product.id.charCodeAt(product.id.length - 1) % 3 === 0;
  const discountPercent = hasDiscount ? Math.floor(10 + (product.id.charCodeAt(0) % 40)) : 0;
  const originalPrice = hasDiscount ? product.price * (1 + discountPercent / 100) : null;

  return (
    <div
      className={cn(
        "group relative bg-white overflow-hidden flex flex-col transition-all duration-300",
        "rounded-3xl border hover:-translate-y-1",
      )}
      style={{
        borderColor: 'hsl(36 15% 90%)',
        boxShadow: isHovered
          ? '0 12px 32px hsl(350 60% 60% / 0.10), 0 2px 8px hsl(0 0% 0% / 0.05)'
          : '0 1px 4px hsl(0 0% 0% / 0.04)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Remove button */}
      {onRemove && (
        <button
          className="absolute top-2.5 left-2.5 z-20 h-7 w-7 rounded-full bg-white shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ border: '1px solid hsl(36 15% 90%)' }}
          onClick={handleRemove}
        >
          <X className="h-3.5 w-3.5" style={{ color: 'hsl(0 72% 55%)' }} />
        </button>
      )}

      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
        {hasDiscount && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-xl shadow-sm"
            style={{ background: 'hsl(350 60% 60%)', color: 'white' }}
          >
            -{discountPercent}%
          </span>
        )}
        {product.id.charCodeAt(0) % 5 === 0 && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-xl shadow-sm"
            style={{ background: 'hsl(160 45% 48%)', color: 'white' }}
          >
            YENİ
          </span>
        )}
      </div>

      {/* Wishlist button */}
      <button
        onClick={toggleLike}
        className="absolute top-2.5 right-2.5 z-20 h-8 w-8 rounded-full bg-white shadow flex items-center justify-center transition-all duration-200 hover:scale-110"
        style={{ border: '1px solid hsl(36 15% 90%)' }}
      >
        <Heart
          className={cn("h-4 w-4 transition-all", isLiked ? "fill-rose-400 text-rose-400 scale-110" : "text-stone-350")}
          style={!isLiked ? { color: 'hsl(25 10% 70%)' } : {}}
        />
      </button>

      {/* Image */}
      <Link href={`/product/${product.id}`} className="relative block overflow-hidden aspect-[3/4]">
        <Image
          src={product.imageUrls[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          data-ai-hint="fashion product"
        />

        {/* Hover overlay */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-end pb-4 gap-2 transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
          style={{ background: 'linear-gradient(to top, hsl(0 0% 0% / 0.35) 0%, transparent 60%)' }}
        >
          {product.suitabilityExplanation && (
            <div
              className="mx-3 mb-1 rounded-2xl p-2 text-white text-[11px] text-center leading-tight"
              style={{ background: 'hsl(0 0% 0% / 0.55)', backdropFilter: 'blur(6px)' }}
            >
              {product.suitabilityExplanation}
            </div>
          )}
          <button
            onClick={handleAddToCart}
            className="flex items-center gap-2 rounded-2xl px-5 py-2 text-sm font-semibold shadow transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'hsl(0 0% 100%)',
              color: 'hsl(350 60% 52%)',
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-3.5 flex flex-col gap-1.5 flex-1">
        <Link href={`/product/${product.id}`} className="group/link">
          <h3
            className="font-medium text-sm leading-tight line-clamp-2 transition-colors"
            style={{ color: 'hsl(25 20% 22%)' }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Stars */}
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn("h-3 w-3", i < 4 ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200")}
            />
          ))}
          <span className="text-xs ml-1" style={{ color: 'hsl(25 15% 58%)' }}>
            ({Math.floor(20 + product.likeCount / 2)})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold" style={{ color: 'hsl(350 60% 52%)' }}>
              ${product.price.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-xs line-through" style={{ color: 'hsl(25 10% 65%)' }}>
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          {/* Quick cart (mobile) */}
          <button
            onClick={handleAddToCart}
            className="md:hidden h-7 w-7 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: 'hsl(350 60% 94%)', color: 'hsl(350 60% 52%)' }}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
