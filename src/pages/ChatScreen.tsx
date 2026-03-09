import { useState } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { ChatThread } from "@/types/doctor";

interface Props {
  chats: ChatThread[];
  onSendMessage: (patientId: string, text: string) => void;
}

export default function ChatScreen({ chats, onSendMessage }: Props) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const activeChat = chats.find((c) => c.patientId === selectedChat);

  const handleSend = () => {
    if (!input.trim() || !selectedChat) return;
    onSendMessage(selectedChat, input.trim());
    setInput("");
  };

  // Chat list view
  if (!selectedChat) {
    return (
      <div className="min-h-screen bg-background px-4 pb-24 pt-6">
        <h1 className="mb-1 text-2xl font-bold text-foreground">Messages</h1>
        <p className="mb-6 text-sm text-muted-foreground">{chats.length} conversations</p>
        <div className="space-y-2">
          {chats.map((chat) => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            return (
              <button
                key={chat.patientId}
                onClick={() => setSelectedChat(chat.patientId)}
                className="flex w-full items-start gap-3 rounded-lg bg-card p-4 text-left transition-colors hover:bg-accent"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {chat.patientName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{chat.patientName}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{lastMsg?.text}</p>
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {lastMsg && new Date(lastMsg.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </button>
            );
          })}
          {chats.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">No conversations yet</p>
          )}
        </div>
      </div>
    );
  }

  // Chat detail view
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button onClick={() => setSelectedChat(null)} className="text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {activeChat?.patientName.charAt(0)}
        </div>
        <p className="font-semibold text-foreground">{activeChat?.patientName}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 pb-32">
        {activeChat?.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderType === "doctor" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                msg.senderType === "doctor"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card text-foreground rounded-bl-md"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className={`mt-1 text-[10px] ${msg.senderType === "doctor" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {new Date(msg.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 border-t border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 rounded-full bg-secondary py-2.5 pl-4 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
