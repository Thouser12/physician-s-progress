import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Bell, MessageCircle, User } from "lucide-react";
import { useUnreadPerConnection } from "@/hooks/useUnreadPerConnection";
import { usePendingRequestsCount } from "@/hooks/usePendingRequestsCount";

const tabs = [
  { path: "/", label: "Início", icon: LayoutDashboard },
  { path: "/patients", label: "Pacientes", icon: Users },
  { path: "/requests", label: "Pedidos", icon: Bell, badgeType: "requests" as const },
  { path: "/chat", label: "Chat", icon: MessageCircle, badgeType: "chat" as const },
  { path: "/perfil", label: "Perfil", icon: User },
];

export function BottomNav() {
  const location = useLocation();
  const { total: unreadMessages } = useUnreadPerConnection();
  const { count: pendingRequests } = usePendingRequestsCount();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const getBadge = (type?: "chat" | "requests"): number => {
    if (type === "chat") return unreadMessages;
    if (type === "requests") return pendingRequests;
    return 0;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const badgeCount = getBadge(tab.badgeType);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <tab.icon className="h-5 w-5" />
                {badgeCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                )}
              </div>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
