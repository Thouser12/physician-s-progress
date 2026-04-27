import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LevelBadge } from "@/components/LevelBadge";
import { usePatients } from "@/hooks/usePatients";
import { useUnreadPerConnection } from "@/hooks/useUnreadPerConnection";

export default function PatientList() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { patients, loading } = usePatients();
  const { perConnection } = useUnreadPerConnection();

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pb-safe-24 pt-safe-6">
      <h1 className="mb-1 text-2xl font-bold text-foreground">Pacientes</h1>
      <p className="mb-4 text-sm text-muted-foreground">{patients.length} vinculados</p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar pacientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((patient) => {
          const unread = perConnection[patient.connectionId] ?? 0;
          return (
            <button
              key={patient.id}
              onClick={() => navigate(`/patients/${patient.id}`)}
              className="flex w-full items-center gap-3 rounded-lg bg-card p-4 text-left transition-colors hover:bg-accent"
            >
              <div className="relative shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={patient.avatarUrl ?? undefined} alt={patient.name} />
                  <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                    {patient.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate ${unread > 0 ? "font-bold text-foreground" : "font-semibold text-foreground"}`}>
                  {patient.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {patient.weeklyCompletion}% esta semana
                </p>
              </div>
              <LevelBadge level={patient.level} />
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">Nenhum paciente encontrado</p>
        )}
      </div>
    </div>
  );
}
