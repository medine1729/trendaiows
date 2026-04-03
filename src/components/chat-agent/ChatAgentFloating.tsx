"use client";

import { useState } from 'react';
import { BotMessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatPanel } from './ChatPanel';

export function ChatAgentFloating() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-4">
      {/* The Floating Panel */}
      <div 
        className={`transition-all duration-300 origin-bottom-right ${
          isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {isOpen && <ChatPanel onClose={() => setIsOpen(false)} />}
      </div>

      {/* The Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={`h-14 w-14 rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95 ${
          isOpen ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        {isOpen ? <X size={24} /> : <BotMessageSquare size={26} />}
      </Button>
    </div>
  );
}
