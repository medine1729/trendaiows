"use server";

import { Product } from '@/lib/types';
import { IntentContext } from '@/lib/chat-agent-types';

import fs from 'fs';
import path from 'path';

function getEnvVar(key: string): string {
    if (process.env[key]) return process.env[key] as string;
    try {
        const envPath = path.join(process.cwd(), '.env.local');
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(new RegExp(`${key}=["']?([^"'\r\n]+)`));
        if (match) return match[1];
    } catch(e) {}
    return "";
}

export async function processChatWithOpenRouter(message: string): Promise<{ intent: IntentContext, products: Product[] }> {
    const geminiKey = getEnvVar("GEMINI_API_KEY");
    const openRouterKey = getEnvVar("OPENROUTER_API_KEY");
    
    let intent: IntentContext = { intentType: 'unknown' };

    try {
        if (geminiKey) {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    system_instruction: {
                        parts: {
                            text: `You are an AI e-commerce assistant.
                            Extract intention from the user's message.
                            Return ONLY a valid JSON object matching this schema:
                            {
                                "intentType": "greeting" | "product_search" | "payment_intent" | "unknown",
                                "category": "string (the product category, like 'shoes', 'dress', 'laptop')",
                                "budgetLimit": "number (extract maximum budget if specified, e.g. 'under 150' -> 150. Null otherwise)"
                            }`
                        }
                    },
                    contents: [{ role: "user", parts: [{ text: message }] }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            });
            const jsonResponse = await response.json();
            if (jsonResponse.error) throw new Error(jsonResponse.error.message);
            if (jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text) {
                const parsed = JSON.parse(jsonResponse.candidates[0].content.parts[0].text);
                intent.intentType = parsed.intentType || 'unknown';
                intent.category = parsed.category || null;
                intent.budgetLimit = parsed.budgetLimit || null;
                intent.queryTerm = message;
            } else {
                throw new Error("Invalid Gemini response format");
            }
        } else if (openRouterKey) {
             const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${openRouterKey}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  model: "google/gemini-2.5-flash",
                  response_format: { type: "json_object" },
                  messages: [
                    {
                       role: "system",
                       content: `You are an AI e-commerce assistant.
                       Extract intention from the user's message.
                       Return ONLY a valid JSON object matching this schema:
                       {
                         "intentType": "greeting" | "product_search" | "payment_intent" | "unknown",
                         "category": "string (the product category, like 'shoes', 'dress', 'laptop')",
                         "budgetLimit": "number (extract maximum budget if specified, e.g. 'under 150' -> 150. Null otherwise)"
                       }`
                    },
                    { role: "user", content: message }
                  ]
                })
             });
             const jsonResponse = await response.json();
             if (jsonResponse.error) throw new Error(jsonResponse.error.message);
             if (jsonResponse.choices?.[0]?.message?.content) {
                const parsed = JSON.parse(jsonResponse.choices[0].message.content);
                intent.intentType = parsed.intentType || 'unknown';
                intent.category = parsed.category || null;
                intent.budgetLimit = parsed.budgetLimit || null;
                intent.queryTerm = message;
             } else {
                 throw new Error("Invalid OpenRouter response format");
             }
        } else {
            console.warn("No API Keys found, falling back to regex matching.");
            intent = fallbackProcessIntent(message);
        }
    } catch(e) {
        console.error("AI API Failed, falling back to mock", e);
        intent = fallbackProcessIntent(message);
    }

    // Now fetch products from DummyJSON strictly server-side
    let products: Product[] = [];
    if (intent.intentType === 'product_search') {
        const searchQuery = intent.category || 'clothes';
        try {
            const res = await fetch(`https://dummyjson.com/products/search?q=${searchQuery}`);
            const data = await res.json();
            
            if (data.products) {
                products = data.products.map((p: any) => ({
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
                if (intent.budgetLimit) {
                    products = products.filter(p => p.price <= intent.budgetLimit!);
                }

                // Sort by likeCount
                products.sort((a, b) => b.likeCount - a.likeCount);
                products = products.slice(0, 3);
            }
        } catch (e) {
            console.error('DummyJSON API Error:', e);
        }
    }

    return { intent, products };
}

function fallbackProcessIntent(message: string): IntentContext {
    const lowerMessage = message.toLowerCase();
    const context: IntentContext = { intentType: 'unknown' };

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
      
      if (lowerMessage.includes('dress')) context.category = 'dress';
      else if (lowerMessage.includes('jacket')) context.category = 'jacket';
      else if (lowerMessage.includes('shoe') || lowerMessage.includes('sneaker')) context.category = 'shoes';
      else if (lowerMessage.includes('shirt')) context.category = 'shirt';
      else if (lowerMessage.includes('bag')) context.category = 'bag';
      else if (lowerMessage.includes('phone')) context.category = 'phone';
      else if (lowerMessage.includes('laptop')) context.category = 'laptop';
      else {
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

    if (context.intentType === 'unknown' && message.trim().length > 3) {
       context.intentType = 'product_search';
       context.category = message.split(' ')[0];
       context.queryTerm = message;
    }

    return context;
}
