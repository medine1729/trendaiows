import type { Product } from './types';

// DummyJSON API types
interface DummyProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

interface DummyProductsResponse {
  products: DummyProduct[];
  total: number;
  skip: number;
  limit: number;
}

// Fashion categories mapping to Turkish
const CATEGORY_ID_MAP: Record<string, string> = {
  'womens-dresses': 'cat1',
  'womens-tops': 'cat1',
  'tops': 'cat1',
  'mens-shirts': 'cat1',
  'womens-shoes': 'cat5',
  'mens-shoes': 'cat5',
  'womens-bags': 'cat6',
  'womens-jewellery': 'cat4',
  'sunglasses': 'cat4',
  'mens-watches': 'cat4',
  'womens-watches': 'cat4',
};

// Convert DummyJSON product to our Product type
function toProduct(p: DummyProduct): Product {
  const categoryId = CATEGORY_ID_MAP[p.category] || 'cat1';
  const likeCount = Math.floor(p.rating * 50 + Math.random() * 200);

  return {
    id: `dummy-${p.id}`,
    name: p.title,
    description: p.description,
    price: Math.round(p.price * 32.5 * 10) / 10, // USD to TRY approximate
    imageUrls: p.images.length > 0 ? p.images : [p.thumbnail],
    properties: {
      color: undefined,
      fabric: p.brand,
      size: 'M',
    },
    likeCount,
    categoryId,
    stockQuantity: p.stock,
    aiSummary: `${p.brand} markasının bu üründen ${p.stock} adet stokta bulunmaktadır. Müşteri puanı: ${p.rating}/5`,
    createdAt: new Date().toISOString(),
    // Extra fields for display
    brand: p.brand,
    rating: p.rating,
    discountPercentage: p.discountPercentage,
    originalPrice: p.discountPercentage > 0
      ? Math.round(p.price * 32.5 / (1 - p.discountPercentage / 100) * 10) / 10
      : undefined,
  } as Product & { brand: string; rating: number; discountPercentage: number; originalPrice?: number };
}

const FASHION_CATEGORIES = [
  'womens-dresses',
  'womens-tops',
  'tops',
  'mens-shirts',
  'womens-shoes',
  'mens-shoes',
  'womens-bags',
  'womens-jewellery',
  'sunglasses',
];

const BASE_URL = 'https://dummyjson.com';

// Fetch products by category
export async function fetchProductsByCategory(category: string, limit = 20): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/products/category/${category}?limit=${limit}`, {
    next: { revalidate: 3600 }, // cache 1 hour
  });
  if (!res.ok) throw new Error(`Failed to fetch category: ${category}`);
  const data: DummyProductsResponse = await res.json();
  return data.products.map(toProduct);
}

// Fetch homepage products - mix of fashion categories
export async function fetchHomepageProducts(): Promise<{
  trending: Product[];
  newArrivals: Product[];
}> {
  const [dresses, tops, menShirts, shoes, bags] = await Promise.all([
    fetchProductsByCategory('womens-dresses', 8),
    fetchProductsByCategory('womens-tops', 4),
    fetchProductsByCategory('mens-shirts', 4),
    fetchProductsByCategory('womens-shoes', 4),
    fetchProductsByCategory('womens-bags', 4),
  ]);

  // Trending: mix from all categories, sorted by likes
  const all = [...dresses, ...tops, ...menShirts, ...shoes, ...bags];
  const trending = all
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 8);

  // New arrivals: mix, different from trending
  const trendingIds = new Set(trending.map((p) => p.id));
  const newArrivals = all
    .filter((p) => !trendingIds.has(p.id))
    .slice(0, 8);

  return { trending, newArrivals };
}

// Fetch explore page products - more items
export async function fetchExploreProducts(
  category?: string,
  skip = 0,
  limit = 20
): Promise<Product[]> {
  if (category && category !== 'all') {
    // Map Turkish category slug to DummyJSON category
    const categoryMap: Record<string, string[]> = {
      kadin: ['womens-dresses', 'womens-tops', 'tops'],
      erkek: ['mens-shirts', 'mens-shoes'],
      ayakkabi: ['womens-shoes', 'mens-shoes'],
      aksesuar: ['sunglasses', 'mens-watches', 'womens-watches'],
      taki: ['womens-jewellery'],
      canta: ['womens-bags'],
    };
    const cats = categoryMap[category] || FASHION_CATEGORIES.slice(0, 3);
    const results = await Promise.all(cats.map((c) => fetchProductsByCategory(c, 10)));
    return results.flat().slice(skip, skip + limit);
  }

  // All: fetch multiple categories
  const results = await Promise.all(
    FASHION_CATEGORIES.slice(0, 5).map((c) => fetchProductsByCategory(c, 10))
  );
  const allProducts = results.flat();

  // Shuffle for variety
  for (let i = allProducts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allProducts[i], allProducts[j]] = [allProducts[j], allProducts[i]];
  }

  return allProducts.slice(skip, skip + limit);
}

// Search products
export async function searchProducts(query: string): Promise<Product[]> {
  const res = await fetch(
    `${BASE_URL}/products/search?q=${encodeURIComponent(query)}&limit=30`,
    { next: { revalidate: 600 } }
  );
  if (!res.ok) throw new Error('Search failed');
  const data: DummyProductsResponse = await res.json();
  return data.products.map(toProduct);
}

// Fetch single product
export async function fetchProduct(id: string): Promise<Product | null> {
  // If it's a dummy product ID like "dummy-5"
  if (id.startsWith('dummy-')) {
    const numId = id.replace('dummy-', '');
    const res = await fetch(`${BASE_URL}/products/${numId}`);
    if (!res.ok) return null;
    const product: DummyProduct = await res.json();
    return toProduct(product);
  }
  return null;
}
