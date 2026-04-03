"use client";

import { ChatFullScreen } from "@/components/chat-agent/ChatPanel";

export default function ChatPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-60px)] w-full overflow-hidden">
            <ChatFullScreen />
        </div>
    );
}
