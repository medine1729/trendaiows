import { NextRequest, NextResponse } from 'next/server';
import {
  fetchHomepageProducts,
  fetchExploreProducts,
  searchProducts,
} from '@/lib/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'explore';
  const category = searchParams.get('category') || undefined;
  const query = searchParams.get('q') || undefined;
  const skip = parseInt(searchParams.get('skip') || '0', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  try {
    if (type === 'homepage') {
      const data = await fetchHomepageProducts();
      return NextResponse.json(data);
    }

    if (type === 'search' && query) {
      const products = await searchProducts(query);
      return NextResponse.json({ products });
    }

    // Default: explore
    const products = await fetchExploreProducts(category, skip, limit);
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
