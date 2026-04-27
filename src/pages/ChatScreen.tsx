import { useState, useEffect } from "react";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChat } from "@/hooks/useChat";
import { useUnreadPerConnection } from "@/hooks/useUnreadPerConnection";

export default function ChatScreen() {
  const { chats, loading, sendMessage } = useChat();
  const { perConnection, markConnectionAsRead } = useUnreadPerConnection();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const activeChat = chats.find((c) => c.patientId === selectedChat);

  // Mark messages as read when opening a specific conversation
  useEffect(() => {
    if (activeChat) {
      markConnectionAsRead(activeChat.connectionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat?.connectionId, activeChat?.messages.length]);

  const handleSend = () => {
    if (!input.trim() || !selectedChat) return;
    sendMessage(selectedChat, input.trim());
    setInput("");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Chat list view
  if (!selectedChat) {
    return (
      <div className="min-h-screen bg-background px-4 pb-safe-24 pt-safe-6">
        <h1 className="mb-1 text-2xl font-bold text-foreground">Mensagens</h1>
        <p className="mb-6 text-sm text-muted-foreground">{chats.length} conversas</p>
        <div className="space-y-2">
          {chats.map((chat) => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            const unreadCount = perConnection[chat.connectionId] ?? 0;
            return (
              <button
                key={chat.patientId}
                onClick={() => setSelectedChat(chat.patientId)}
                className={`flex w-full items-start gap-3 rounded-lg p-4 text-left transition-colors ${
                  unreadCount > 0 ? "bg-primary/5 hover:bg-primary/10" : "bg-card hover:bg-accent"
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={chat.patientAvatar ?? undefined} alt={chat.patientName} />
                    <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                      {chat.patientName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`truncate ${unreadCount > 0 ? "font-bold text-foreground" : "font-semibold text-foreground"}`}>
                      {chat.patientName}
                    </p>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {lastMsg && new Date(lastMsg.timestamp).toLocaleDateString("pt-BR", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className={`mt-0.5 truncate text-xs ${unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                    {lastMsg?.text}
                  </p>
                </div>
              </button>
            );
          })}
          {chats.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma conversa ainda</p>
          )}
        </div>
      </div>
    );
  }

  // Chat detail view
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-border px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <button onClick={() => setSelectedChat(null)} className="text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar className="h-8 w-8">
          <AvatarImage src={activeChat?.patientAvatar ?? undefined} alt={activeChat?.patientName ?? 'Paciente'} />
          <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
            {activeChat?.patientName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <p className="font-semibold text-foreground">{activeChat?.patientName}</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-36 pt-4">
        {activeChat?.messages.map((msg) => {
          const isDoctor = msg.senderType === "doctor";
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isDoctor ? "justify-end" : "justify-start"}`}>
              {!isDoctor && (
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage src={activeChat.patientAvatar ?? undefined} alt={activeChat.patientName} />
                  <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                    {activeChat.patientName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isDoctor
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card text-foreground rounded-bl-md"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`mt-1 text-[10px] ${isDoctor ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {new Date(msg.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-safe-nav left-0 right-0 border-t border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <input
            type="text"
            placeholder="Digite uma mensagem..."
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
