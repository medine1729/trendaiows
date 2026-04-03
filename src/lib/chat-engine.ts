import { Product } from './types';
import { IntentContext } from './chat-agent-types';

export class ChatEngine {
  processIntent(message: string): IntentContext {
    const lowerMessage = message.toLowerCase();
    const context: IntentContext = { intentType: 'unknown' };

    // budget extraction regex (e.g. "under 150", "< 150", "max 150")
    const budgetMatch = lowerMessage.match(/(?:under|max|<|less than)\s*\$?(\d+)/);
    if (budgetMatch) {
      context.budgetLimit = parseInt(budgetMatch[1], 10);
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      context.intentType = 'greeting';
    } else if (lowerMessage.includes('buy') || lowerMessage.includes('pay') || lowerMessage.includes('checkout')) {
      context.intentType = 'payment_intent';
    } else if (lowerMessage.includes('find') || lowerMessage.includes('looking for') || lowerMessage.includes('show') || lowerMessage.includes('get') || context.budgetLimit) {
      context.intentType = 'product_search';
      
      // Keyword tagging for search query
      if (lowerMessage.includes('dress')) context.category = 'dress';
      else if (lowerMessage.includes('jacket')) context.category = 'jacket';
      else if (lowerMessage.includes('shoe') || lowerMessage.includes('sneaker')) context.category = 'shoes';
      else if (lowerMessage.includes('shirt')) context.category = 'shirt';
      else if (lowerMessage.includes('bag')) context.category = 'bag';
      else if (lowerMessage.includes('phone')) context.category = 'phone';
      else if (lowerMessage.includes('laptop')) context.category = 'laptop';
      else {
        // Just extract the next word after standard identifiers as a fallback search term
        const parts = lowerMessage.split(' ');
        const findIndex = parts.findIndex(w => w === 'find' || w === 'show' || w === 'get');
        if (findIndex !== -1 && parts[findIndex + 1] && parts[findIndex + 1] !== 'me' && parts[findIndex + 1] !== 'a') {
            context.category = parts[findIndex + 1];
        } else if (findIndex !== -1 && parts[findIndex + 2]) {
            context.category = parts[findIndex + 2];
        }
      }
      
      context.queryTerm = message;
    }

    // Default to search if nothing else matched but we have text
    if (context.intentType === 'unknown' && message.trim().length > 3) {
       context.intentType = 'product_search';
       context.category = message.split(' ')[0];
       context.queryTerm = message;
    }

    return context;
  }

  async findProducts(context: IntentContext): Promise<Product[]> {
    if (context.intentType !== 'product_search') return [];

    const searchQuery = context.category || 'clothes';

    try {
      const res = await fetch(`https://dummyjson.com/products/search?q=${searchQuery}`);
      const data = await res.json();
      
      if (!data.products) return [];

      let results: Product[] = data.products.map((p: any) => ({
        id: p.id.toString(),
        name: p.title,
        description: p.description,
        price: p.price,
        imageUrls: p.images && p.images.length > 0 ? p.images : [p.thumbnail],
        properties: { category: p.category, brand: p.brand },
        likeCount: Math.floor(p.rating * 20),
        categoryId: `c_${p.category}`,
        stockQuantity: p.stock,
        createdAt: new Date().toISOString()
      }));

      // Filter by Budget if explicitly provided
      if (context.budgetLimit) {
        results = results.filter(p => p.price <= context.budgetLimit!);
      }

      // Sort by likeCount (mock popularity scoring)
      results.sort((a, b) => b.likeCount - a.likeCount);

      return results.slice(0, 3); // Return top 3 matches
    } catch (e) {
      console.error('DummyJSON API Error:', e);
      return [];
    }
  }

  generateExplanation(product: Product, context: IntentContext): string {
     let exp = "This is a popular choice";
     if (context.budgetLimit && product.price <= context.budgetLimit) {
        exp += ` fitting well under your $${context.budgetLimit} budget (saves $${(context.budgetLimit - product.price).toFixed(2)}).`;
     } else {
        exp += ` known for highly rated quality.`;
     }
     return exp;
  }
}

export const chatEngine = new ChatEngine();
