"use client";

import { useState, useRef, useEffect } from 'react';
import {
  Send, X, Bot, User as UserIcon, CheckCircle2, AlertTriangle,
  PackageSearch, Wallet, Zap, ShieldCheck, ChevronRight, Star,
  Plus, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { ChatMessage, PaymentResult, ChargeInvoice } from '@/lib/chat-agent-types';
import { chatEngine } from '@/lib/chat-engine';
import { walletService } from '@/lib/wallet-service';
import { Product } from '@/lib/types';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { processChatWithOpenRouter } from '@/app/actions/openrouter';

interface ChatPanelProps {
  onClose?: () => void;
  className?: string;
}

export function ChatPanel({ onClose, className }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '1',
    role: 'assistant',
    content: 'Hello! I\'m your TrendAI shopping assistant. I can help you find products and make secure payments with your OWS wallet.',
    timestamp: new Date()
  }]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [walletBalance, setWalletBalance] = useState(walletService.getWalletInfo().balance);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...msg,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date()
    }]);
  };

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const userMessage = inputVal.trim();
    setInputVal('');
    addMessage({ role: 'user', content: userMessage });
    setIsTyping(true);

    setTimeout(async () => {
      try {
        const { intent, products } = await processChatWithOpenRouter(userMessage);
        setIsTyping(false);

        if (intent.intentType === 'product_search') {
          if (products.length > 0) {
            const productsWithExplanation = products.map(p => ({
              ...p,
              suitabilityExplanation: chatEngine.generateExplanation(p, intent)
            }));
            addMessage({
              role: 'assistant',
              content: `Found ${products.length} products! You can buy them instantly with your OWS wallet.`,
              suggestedProducts: productsWithExplanation,
            });
          } else {
            addMessage({
              role: 'assistant',
              content: "I couldn't find products matching those criteria. Should we try a different search?"
            });
          }
        } else if (intent.intentType === 'payment_intent') {
          addMessage({
            role: 'assistant',
            content: 'To make a payment, you need to select a product first. You can choose from the suggestions below.'
          });
        } else if (intent.intentType === 'greeting') {
          addMessage({
            role: 'assistant',
            content: 'Hi there! Want to discover new trends? Or are you looking for products within a specific budget?'
          });
        } else {
          addMessage({
            role: 'assistant',
            content: "I didn't understand. Try writing something like \"Find dresses under $50\"."
          });
        }
      } catch (error) {
        setIsTyping(false);
        addMessage({
          role: 'assistant',
          content: 'Connection error. Please try again.'
        });
      }
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const processOwsPayment = (product: Product) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const invoice = walletService.generateInvoice(product.price, `${product.name} purchase`);
      addMessage({
        role: 'assistant',
        content: `Starting OWS payment for "${product.name}". Extending x402 verification...`,
        invoice: invoice
      });

      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const result = walletService.processPayment(invoice, product.categoryId);
          setWalletBalance(walletService.getWalletInfo().balance);
          let messageContent = '';
          if (result.status === 'success') {
            messageContent = `✅ Payment successful! Your order for "${product.name}" is confirmed.`;
          } else if (result.status === 'policy_rejected') {
            messageContent = 'OWS Policy Agent rejected the transaction.';
          } else {
            messageContent = 'Payment failed.';
          }
          addMessage({ role: 'assistant', content: messageContent, paymentResult: result });
        }, 1200);
      }, 1500);
    }, 600);
  };

  return (
    <Card className={cn("flex flex-col overflow-hidden border-border/40", className || "w-[380px] h-[600px]")}
          style={{ background: 'hsl(224 71% 5%)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40"
           style={{ background: 'hsl(224 71% 4%)' }}>
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
               style={{ background: 'linear-gradient(135deg, hsl(263 70% 50%), hsl(220 70% 50%))' }}>
            <Bot size={17} className="text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 border-2"
                  style={{ borderColor: 'hsl(224 71% 4%)' }} />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-none text-white">TrendAI Assistant</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <ShieldCheck className="h-2.5 w-2.5 text-violet-400" />
              OWS &amp; x402 Secure Payment
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white" onClick={onClose}>
            <X size={15} />
          </Button>
        )}
      </div>

      {/* OWS Wallet Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-border/30"
           style={{ background: 'linear-gradient(90deg, hsl(263 70% 8%), hsl(220 70% 8%))' }}>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: 'hsl(263 70% 20%)' }}>
            <Wallet size={12} className="text-violet-400" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">OWS Wallet</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm font-mono text-white">${walletBalance.toFixed(2)}</span>
          <div className="flex items-center gap-1 rounded-full px-1.5 py-0.5" style={{ background: 'hsl(263 70% 20%)' }}>
            <Zap size={9} className="text-violet-400" />
            <span className="text-[9px] text-violet-400 font-semibold">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-3 py-3" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={cn(
                "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
                m.role === 'user'
                  ? "bg-violet-600/80"
                  : "bg-violet-950 border border-violet-500/30"
              )}>
                {m.role === 'user'
                  ? <UserIcon size={13} className="text-white" />
                  : <Bot size={13} className="text-violet-400" />}
              </div>
              <div className={`flex flex-col gap-1 max-w-[82%]`}>
                <div className={cn(
                  "px-3 py-2 rounded-2xl text-sm leading-relaxed",
                  m.role === 'user'
                    ? "rounded-tr-sm text-white"
                    : "rounded-tl-sm text-foreground/90",
                  m.role === 'user'
                    ? ""
                    : "chat-bubble-assistant"
                )}
                style={m.role === 'user' ? { background: 'hsl(263 70% 50%)' } : {}}>
                  {m.content}
                </div>

                {/* Product Suggestions */}
                {m.suggestedProducts && (
                  <div className="mt-1 space-y-2">
                    {m.suggestedProducts.map(p => (
                      <Card key={p.id} className="overflow-hidden border-border/30 group"
                            style={{ background: 'hsl(224 71% 7%)' }}>
                        <div className="flex p-2.5 gap-3">
                          <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                            <Image src={p.imageUrls[0]} alt={p.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                          </div>
                          <div className="flex flex-col justify-between flex-1 py-0.5">
                            <div>
                              <h4 className="font-semibold text-xs leading-tight line-clamp-1 text-white">{p.name}</h4>
                              <div className="flex items-center gap-1 mt-1">
                                <Star size={9} className="text-yellow-400 fill-yellow-400" />
                                <span className="text-[9px] text-muted-foreground">{(p.likeCount / 20).toFixed(1)}</span>
                              </div>
                              <span className="font-bold text-violet-400 text-sm mt-1 block">${p.price.toFixed(2)}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
                              {(p as any).suitabilityExplanation}
                            </p>
                          </div>
                        </div>
                        <div className="px-2.5 pb-2.5">
                          <Button
                            size="sm"
                            className="w-full text-xs h-8 rounded-lg font-semibold border-0 ows-btn text-white"
                            style={{ background: 'linear-gradient(135deg, hsl(263 70% 50%), hsl(220 70% 50%))' }}
                            onClick={() => processOwsPayment(p)}
                          >
                            <Wallet size={12} className="mr-1.5" />
                            Buy with OWS
                            <ChevronRight size={12} className="ml-auto" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* x402 Invoice */}
                {m.invoice && (
                  <div className="mt-1 rounded-xl border p-3 text-xs"
                       style={{ background: 'hsl(263 70% 8%)', borderColor: 'hsl(263 70% 25% / 0.5)' }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <PackageSearch size={13} className="text-violet-400" />
                      <span className="text-violet-400 font-semibold text-[11px]">x402 Payment Request</span>
                    </div>
                    <div className="space-y-1 font-mono text-[10px] text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-bold text-white">${m.invoice.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Invoice ID:</span>
                        <span className="text-violet-300">{m.invoice.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Alıcı:</span>
                        <span>{m.invoice.recipient}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Result */}
                {m.paymentResult && (
                  <div className={cn(
                    "mt-1 p-3 rounded-xl border text-xs flex flex-col gap-1.5",
                    m.paymentResult.status === 'success'
                      ? "border-green-500/20 text-green-300"
                      : "border-red-500/20 text-red-300"
                  )}
                  style={{ background: m.paymentResult.status === 'success' ? 'hsl(142 70% 8%)' : 'hsl(0 70% 8%)' }}>
                    <div className="flex items-center gap-2 font-semibold">
                      {m.paymentResult.status === 'success'
                        ? <CheckCircle2 size={14} />
                        : <AlertTriangle size={14} />}
                      {m.paymentResult.status === 'success' ? 'Ödeme Onaylandı' : 'Ödeme Başarısız'}
                    </div>
                    {m.paymentResult.reason && (
                      <p className="opacity-80 leading-tight">{m.paymentResult.reason}</p>
                    )}
                    {m.paymentResult.txHash && (
                      <p className="font-mono text-[9px] opacity-60 break-all rounded-lg p-1.5"
                         style={{ background: 'rgba(255,255,255,0.05)' }}>
                        Tx: {m.paymentResult.txHash}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-violet-950 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                <Bot size={13} className="text-violet-400" />
              </div>
              <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm flex items-center gap-1 chat-bubble-assistant">
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'hsl(263 70% 60%)' }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce delay-75" style={{ background: 'hsl(263 70% 60%)' }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce delay-150" style={{ background: 'hsl(263 70% 60%)' }} />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Form */}
      <div className="px-3 py-3 border-t border-border/30" style={{ background: 'hsl(224 71% 4%)' }}>
        {/* Quick Prompts */}
        <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 scrollbar-hide">
          {['Find a dress', 'Laptop search', 'Under $100', 'Most popular'].map(q => (
            <button key={q} onClick={() => setInputVal(q)}
                    className="text-[10px] whitespace-nowrap px-2.5 py-1 rounded-full font-medium transition-all hover:text-white"
                    style={{ background: 'hsl(263 70% 12%)', color: 'hsl(263 70% 70%)', border: '1px solid hsl(263 70% 25% / 0.4)' }}>
              {q}
            </button>
          ))}
        </div>
        <div className="relative flex items-center gap-2">
          <Input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for products or ask a question..."
            className="pr-10 text-sm border-border/30 text-foreground placeholder:text-muted-foreground/50 rounded-xl"
            style={{ background: 'hsl(224 71% 8%)' }}
          />
          <Button
            size="icon"
            disabled={!inputVal.trim() || isTyping}
            onClick={handleSend}
            className="h-9 w-9 rounded-xl shrink-0 border-0 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, hsl(263 70% 50%), hsl(220 70% 50%))' }}
          >
            <Send size={14} className="text-white" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ─── Full-Screen Chat (matches homepage warm palette) ────────────────────────
export function ChatFullScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '1',
    role: 'assistant',
    content: 'Hello! I\'m your TrendAI shopping assistant 👗✨ I can help you find products, suggest outfits, or make secure payments with your OWS wallet.',
    timestamp: new Date()
  }]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [walletBalance, setWalletBalance] = useState(walletService.getWalletInfo().balance);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [historyItems, setHistoryItems] = useState<{role:string; content:string}[][]>([]);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('chatHistory');
      if (savedHistory) {
        setHistoryItems(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load chat history", error);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...msg,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date()
    }]);
  };

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const userMessage = inputVal.trim();
    setInputVal('');
    addMessage({ role: 'user', content: userMessage });
    setIsTyping(true);

    setTimeout(async () => {
      try {
        const { intent, products } = await processChatWithOpenRouter(userMessage);
        setIsTyping(false);

        if (intent.intentType === 'product_search') {
          if (products.length > 0) {
            const productsWithExplanation = products.map(p => ({
              ...p,
              suitabilityExplanation: chatEngine.generateExplanation(p, intent)
            }));
            addMessage({
              role: 'assistant',
              content: `Found ${products.length} products! Buy instantly with your OWS wallet 🛍️`,
              suggestedProducts: productsWithExplanation,
            });
          } else {
            addMessage({ role: 'assistant', content: "I couldn't find products matching those criteria. Should we try different search terms?" });
          }
        } else if (intent.intentType === 'greeting') {
          addMessage({ role: 'assistant', content: 'Hi! 👋 Want to discover new trends? Or are you shopping within a specific budget?' });
        } else {
          addMessage({ role: 'assistant', content: 'I didn\'t understand. Try writing something like "Find dresses under $50".' });
        }
      } catch {
        setIsTyping(false);
        addMessage({ role: 'assistant', content: 'Connection error. Please try again.' });
      }
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSend(); }
  };

  const processOwsPaymentFS = (product: Product) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const invoice = walletService.generateInvoice(product.price, `${product.name} purchase`);
      addMessage({ role: 'assistant', content: `Starting OWS payment for "${product.name}"...`, invoice });
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const result = walletService.processPayment(invoice, product.categoryId);
          setWalletBalance(walletService.getWalletInfo().balance);
          const msg = result.status === 'success' ? `✅ Payment successful! "${product.name}" order confirmed.` : 'Payment failed.';
          addMessage({ role: 'assistant', content: msg, paymentResult: result });
        }, 1200);
      }, 1500);
    }, 600);
  };

  const QUICK_PROMPTS = ['👗 Suggest dress', '👔 Men\'s shirt', '👟 Sneakers', '👜 Find a bag', '💍 Jewelry', '🌿 Green outfit'];

  return (
    <div className="flex h-full w-full overflow-hidden" style={{ background: 'hsl(36 30% 97%)' }}>
      
      {/* Sidebar for Chat History */}
      <div className="hidden md:flex flex-col w-72 border-r shrink-0 z-10" style={{ borderColor: 'hsl(36 15% 88%)', background: 'hsl(36 30% 97%)' }}>
        <div className="p-5 border-b shrink-0 flex items-center justify-between" style={{ borderColor: 'hsl(36 15% 88%)' }}>
           <h3 className="font-bold text-sm" style={{ color: 'hsl(25 20% 22%)' }}>Chat History</h3>
           <Tooltip delayDuration={0}>
             <TooltipTrigger asChild>
               <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl shadow-sm" style={{ background: 'hsl(0 0% 100%)', borderColor: 'hsl(36 15% 88%)' }} onClick={() => {
                  setMessages([{ id: '1', role: 'assistant', content: 'Hello! I\'m your TrendAI shopping assistant 👗✨ I can help you find products, suggest outfits, or make secure payments with your OWS wallet.', timestamp: new Date() }]);
               }}>
                  <Plus size={16} style={{ color: 'hsl(350 60% 55%)' }} />
               </Button>
             </TooltipTrigger>
             <TooltipContent side="bottom" className="text-xs">New Chat</TooltipContent>
           </Tooltip>
        </div>
        <ScrollArea className="flex-1 p-4">
           <div className="space-y-2.5">
           {historyItems.length === 0 ? (
              <p className="text-xs text-center italic mt-10" style={{ color: 'hsl(25 15% 52%)' }}>No history found.</p>
           ) : (
              [...historyItems].reverse().map((chat, i) => {
                 const firstUserMsg = chat.find(m => m.role === 'user')?.content || "New Chat";
                 return (
                    <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer hover:shadow-md transition-all group" style={{ background: 'hsl(0 0% 100%)', border: '1px solid hsl(36 15% 88%)' }}>
                       <div className="p-2 rounded-xl bg-rose-50 group-hover:bg-rose-100 transition-colors">
                          <MessageSquare size={14} style={{ color: 'hsl(350 60% 55%)' }} />
                       </div>
                       <p className="text-xs font-semibold truncate flex-1" style={{ color: 'hsl(25 20% 22%)' }}>{firstUserMsg}</p>
                    </div>
                 );
              })
           )}
           </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative" style={{ background: 'hsl(36 30% 97%)' }}>


      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0"
           style={{ background: 'hsl(36 30% 97%)', borderColor: 'hsl(36 15% 88%)' }}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm shrink-0"
               style={{ background: 'linear-gradient(135deg, hsl(350 60% 72%), hsl(350 45% 80%))' }}>
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-base leading-none" style={{ color: 'hsl(25 20% 22%)' }}>TrendAI Assistant</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="h-2 w-2 rounded-full bg-green-400 inline-block" />
              <p className="text-xs" style={{ color: 'hsl(25 15% 52%)' }}>Online · OWS &amp; x402 secure</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5"
             style={{ background: 'linear-gradient(135deg, hsl(350 60% 96%), hsl(36 60% 95%))', border: '1px solid hsl(350 40% 88%)' }}>
          <Wallet size={14} style={{ color: 'hsl(350 60% 55%)' }} />
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(25 15% 52%)' }}>OWS Wallet</p>
            <p className="text-sm font-bold leading-none" style={{ color: 'hsl(25 20% 18%)' }}>${walletBalance.toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-1 ml-1">
            <Zap size={10} style={{ color: 'hsl(350 60% 58%)' }} />
            <span className="text-[9px] font-bold" style={{ color: 'hsl(350 60% 58%)' }}>ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6" ref={scrollRef}
           style={{ background: 'hsl(36 25% 95%)' }}>
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
                   style={m.role === 'user'
                     ? { background: 'linear-gradient(135deg, hsl(350 60% 62%), hsl(350 48% 70%))' }
                     : { background: 'linear-gradient(135deg, hsl(350 60% 72%), hsl(350 45% 80%))' }}>
                {m.role === 'user' ? <UserIcon size={15} className="text-white" /> : <Bot size={15} className="text-white" />}
              </div>
              <div className={`flex flex-col gap-2 max-w-[75%] md:max-w-[60%]`}>
                <div className={cn('px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm', m.role === 'user' ? 'rounded-tr-md text-white' : 'rounded-tl-md')}
                     style={m.role === 'user'
                       ? { background: 'linear-gradient(135deg, hsl(350 60% 62%), hsl(350 48% 70%))' }
                       : { background: 'hsl(0 0% 100%)', color: 'hsl(25 20% 22%)', border: '1px solid hsl(36 15% 88%)' }}>
                  {m.content}
                </div>

                {m.suggestedProducts && (
                  <div className="space-y-2 mt-1">
                    {m.suggestedProducts.map(p => (
                      <div key={p.id} className="flex gap-3 p-3 rounded-2xl shadow-sm border group hover:shadow-md transition-shadow"
                           style={{ background: 'hsl(0 0% 100%)', borderColor: 'hsl(36 15% 88%)' }}>
                        <div className="relative w-16 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                          <Image src={p.imageUrls[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="flex flex-col justify-between flex-1 py-0.5">
                          <div>
                            <h4 className="font-semibold text-xs leading-tight line-clamp-2" style={{ color: 'hsl(25 20% 22%)' }}>{p.name}</h4>
                            <div className="flex items-center gap-1 mt-1">
                              <Star size={9} className="text-amber-400 fill-amber-400" />
                              <span className="text-[9px]" style={{ color: 'hsl(25 15% 52%)' }}>{(p.likeCount / 20).toFixed(1)}</span>
                            </div>
                            <span className="font-bold text-sm mt-1 block" style={{ color: 'hsl(350 60% 55%)' }}>${(p.price / 32.5).toFixed(2)}</span>
                          </div>
                          {(p as any).suitabilityExplanation && (
                            <p className="text-[10px] leading-tight line-clamp-2 mt-1" style={{ color: 'hsl(25 15% 52%)' }}>{(p as any).suitabilityExplanation}</p>
                          )}
                          <button className="mt-2 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                                  style={{ background: 'linear-gradient(135deg, hsl(350 60% 62%), hsl(350 48% 70%))' }}
                                  onClick={() => processOwsPaymentFS(p)}>
                            <Wallet size={11} /> Buy with OWS
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {m.invoice && (
                  <div className="mt-1 rounded-xl border p-3 text-xs"
                       style={{ background: 'hsl(350 60% 98%)', borderColor: 'hsl(350 40% 85%)' }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <PackageSearch size={13} style={{ color: 'hsl(350 60% 55%)' }} />
                      <span className="font-semibold text-[11px]" style={{ color: 'hsl(350 60% 50%)' }}>x402 Payment Request</span>
                    </div>
                    <div className="space-y-1 font-mono text-[10px]" style={{ color: 'hsl(25 15% 52%)' }}>
                      <div className="flex justify-between"><span>Amount:</span><span className="font-bold" style={{ color: 'hsl(25 20% 22%)' }}>${m.invoice.amount.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Invoice ID:</span><span style={{ color: 'hsl(350 60% 55%)' }}>{m.invoice.id}</span></div>
                    </div>
                  </div>
                )}

                {m.paymentResult && (
                  <div className="mt-1 p-3 rounded-xl border text-xs flex flex-col gap-1.5"
                       style={{
                         background: m.paymentResult.status === 'success' ? 'hsl(142 60% 96%)' : 'hsl(0 60% 96%)',
                         borderColor: m.paymentResult.status === 'success' ? 'hsl(142 50% 80%)' : 'hsl(0 50% 80%)',
                         color: m.paymentResult.status === 'success' ? 'hsl(142 50% 30%)' : 'hsl(0 50% 40%)',
                       }}>
                    <div className="flex items-center gap-2 font-semibold">
                      {m.paymentResult.status === 'success' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                      {m.paymentResult.status === 'success' ? 'Ödeme Onaylandı' : 'Ödeme Başarısız'}
                    </div>
                    {m.paymentResult.reason && <p className="opacity-80">{m.paymentResult.reason}</p>}
                  </div>
                )}

                <p className="text-[10px] px-1" style={{ color: 'hsl(25 15% 62%)' }}>
                  {m.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
                   style={{ background: 'linear-gradient(135deg, hsl(350 60% 72%), hsl(350 45% 80%))' }}>
                <Bot size={15} className="text-white" />
              </div>
              <div className="px-4 py-3.5 rounded-2xl rounded-tl-md flex items-center gap-1.5 shadow-sm border"
                   style={{ background: 'hsl(0 0% 100%)', borderColor: 'hsl(36 15% 88%)' }}>
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'hsl(350 60% 65%)' }} />
                <span className="w-2 h-2 rounded-full animate-bounce delay-75" style={{ background: 'hsl(350 60% 65%)' }} />
                <span className="w-2 h-2 rounded-full animate-bounce delay-150" style={{ background: 'hsl(350 60% 65%)' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t px-4 md:px-8 py-4"
           style={{ background: 'hsl(36 30% 97%)', borderColor: 'hsl(36 15% 88%)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
            {QUICK_PROMPTS.map(q => (
              <button key={q} onClick={() => setInputVal(q)}
                      className="text-xs whitespace-nowrap px-3 py-1.5 rounded-full font-medium transition-all hover:opacity-80 shrink-0"
                      style={{ background: 'hsl(350 60% 95%)', color: 'hsl(350 60% 45%)', border: '1px solid hsl(350 40% 85%)' }}>
                {q}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <Input value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={handleKeyDown}
                   placeholder="Search products, ask for outfit ideas..."
                   className="flex-1 h-12 rounded-2xl text-sm border px-4"
                   style={{ background: 'hsl(0 0% 100%)', borderColor: 'hsl(36 15% 85%)', color: 'hsl(25 20% 22%)' }} />
            <Button size="icon" disabled={!inputVal.trim() || isTyping} onClick={handleSend}
                    className="h-12 w-12 rounded-2xl shrink-0 shadow-md disabled:opacity-40 border-0"
                    style={{ background: 'linear-gradient(135deg, hsl(350 60% 62%), hsl(350 48% 70%))' }}>
              <Send size={16} className="text-white" />
            </Button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
