
'use client';

import { useState, useEffect, useCallback, FormEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Heart, Loader2, Star, Search, X, ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/cart-context';

// Product Detail View
const ProductDetailView = ({ product }: { product: Product & { brand?: string; rating?: number; discountPercentage?: number; originalPrice?: number } }) => {
  const { addToCart } = useCart();
  return (
    <div className="p-4 md:p-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl shadow-lg">
          <Image
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            className="object-cover"
            data-ai-hint="product"
          />
          {product.discountPercentage && product.discountPercentage > 0 && (
            <Badge className="absolute top-3 left-3 bg-primary text-white font-bold text-sm px-3 py-1">
              -{Math.round(product.discountPercentage)}%
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div>
            {product.brand && (
              <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-1">{product.brand}</p>
            )}
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(product.rating ?? 4) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{product.rating ?? 4}/5 rating</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold text-primary">₺{product.price.toFixed(0)}</p>
            {product.originalPrice && (
              <p className="text-lg text-muted-foreground line-through">₺{product.originalPrice.toFixed(0)}</p>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="flex gap-2 flex-wrap">
            {product.properties.color && (
              <Badge variant="secondary">{product.properties.color}</Badge>
            )}
            {product.properties.size && (
              <span className="text-xs text-center">Size: {product.properties.size}</span>
            )}
            {product.properties.fabric && (
              <Badge variant="secondary">{product.properties.fabric}</Badge>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <AddToCartButton product={product} />
            <p className="text-xs text-muted-foreground text-center">
              {product.stockQuantity > 0
                ? `✅ In stock: ${product.stockQuantity} units`
                : '❌ Out of stock'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton for loading grid
function ExploreSkeleton({ count = 15 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'relative animate-pulse bg-muted rounded-xl overflow-hidden',
            i % 5 === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1',
            'aspect-square'
          )}
        />
      ))}
    </>
  );
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('cat') || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [skip, setSkip] = useState(0);

  const CATEGORIES = [
    { slug: 'all', label: 'All' },
    { slug: 'kadin', label: '👗 Women' },
    { slug: 'erkek', label: '👔 Men' },
    { slug: 'ayakkabi', label: '💟 Shoes' },
    { slug: 'aksesuar', label: '⌚ Accessories' },
    { slug: 'taki', label: '💍 Jewelry' },
    { slug: 'canta', label: '👜 Bags' },
  ];

  const fetchProducts = useCallback(async (category: string, currentSkip: number, append = false) => {
    if (append) {
      setIsFetchingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const catParam = category !== 'all' ? `&category=${category}` : '';
      const res = await fetch(`/api/products?type=explore${catParam}&skip=${currentSkip}&limit=20`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const fetched: Product[] = data.products || [];

      if (append) {
        setProducts(prev => [...prev, ...fetched]);
      } else {
        setProducts(fetched);
        setSkip(0);
      }
    } catch (err) {
      console.error('Explore fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts(activeCategory, 0, false);
  }, [activeCategory, fetchProducts]);

  // Scroll-based infinite load
  const loadMoreProducts = useCallback(() => {
    if (isLoading || isFetchingMore || isSearching) return;
    const newSkip = skip + 20;
    setSkip(newSkip);
    fetchProducts(activeCategory, newSkip, true);
  }, [isLoading, isFetchingMore, isSearching, skip, activeCategory, fetchProducts]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 600) {
        loadMoreProducts();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreProducts]);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setIsSearching(false);
      fetchProducts(activeCategory, 0, false);
      return;
    }
    setIsSearching(true);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/products?type=search&q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    fetchProducts(activeCategory, 0, false);
  };

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    setIsSearching(false);
    setSearchQuery('');
    setSkip(0);
  };

  return (
    <Dialog open={!!selectedProduct} onOpenChange={(isOpen) => !isOpen && setSelectedProduct(null)}>
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center my-8">
          <h1 className="text-4xl font-bold tracking-tight">Explore</h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover new trends, popular products and recommendations just for you.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto mt-4 flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search dresses, shirts, shoes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 text-base pr-8"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" size="icon" className="h-11 w-11">
              <Search className="h-5 w-5" />
            </Button>
          </form>
        </div>

        {/* Category tabs */}
        {!isSearching && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide px-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryChange(cat.slug)}
                className={cn(
                  'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  activeCategory === cat.slug
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Products grid */}
        <div className="grid grid-cols-3 gap-1">
          {isLoading ? (
            <ExploreSkeleton count={15} />
          ) : products.length === 0 ? (
            <div className="col-span-3 text-center py-16">
              <p className="text-lg text-muted-foreground">No products found matching your search.</p>
              <Button variant="outline" className="mt-4" onClick={clearSearch}>
                Clear
              </Button>
            </div>
          ) : (
            products.map((product, index) => {
              const isLarge = index % 5 === 0;
              return (
                <DialogTrigger asChild key={`${product.id}-${index}`}>
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className={cn(
                      'group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300',
                      {
                        'col-span-2 row-span-2 aspect-square': isLarge,
                        'col-span-1 row-span-1 aspect-square': !isLarge,
                      }
                    )}
                  >
                    <Image
                      src={product.imageUrls[0]}
                      alt={product.name}
                      fill
                      className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-110"
                      data-ai-hint="product"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-xs font-semibold line-clamp-1">{product.name}</p>
                      <p className="text-amber-400 text-sm font-bold">₺{product.price.toFixed(0)}</p>
                    </div>
                    {/* Likes */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
                      <Heart className="h-3 w-3 text-white" />
                      <span className="text-white text-xs">{product.likeCount}</span>
                    </div>
                  </button>
                </DialogTrigger>
              );
            })
          )}
        </div>

        {/* Loading more indicator */}
        {isFetchingMore && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Product detail dialog */}
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          <div className="overflow-y-auto h-full">
            {selectedProduct && <ProductDetailView product={selectedProduct as any} />}
            <Separator />
            <h2 className="text-2xl font-bold p-4 md:px-8">Discover More</h2>
            <div className="grid grid-cols-3 gap-1 p-4 md:px-8">
              {products
                .filter((p) => p.id !== selectedProduct?.id)
                .slice(0, 9)
                .map((product, i) => (
                  <button
                    key={`${product.id}-related-${i}`}
                    onClick={() => setSelectedProduct(product)}
                    className="group relative aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Image
                      src={product.imageUrls[0]}
                      alt={product.name}
                      fill
                      className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
                      data-ai-hint="product"
                    />
                  </button>
                ))}
            </div>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
