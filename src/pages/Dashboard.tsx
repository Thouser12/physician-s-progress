import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, Users, Bell, TrendingUp, ArrowRight, LogOut } from "lucide-react";
import { useDoctor } from "@/hooks/useDoctor";
import { usePatients } from "@/hooks/usePatients";
import { useRequests } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { profile } = useDoctor();
  const { patients } = usePatients();
  const { requests } = useRequests();
  const { signOut } = useAuth();

  const doctorCode = profile?.doctor_code ?? "...";
  const doctorName = profile?.name ?? "Doutor";

  const avgCompletion = patients.length
    ? Math.round(patients.reduce((sum, p) => sum + p.weeklyCompletion, 0) / patients.length)
    : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(doctorCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const metrics = [
    { label: "Pacientes", value: patients.length, icon: Users, color: "text-primary" },
    { label: "Pendentes", value: requests.length, icon: Bell, color: "text-level-gold" },
    { label: "Media Semanal", value: `${avgCompletion}%`, icon: TrendingUp, color: "text-level-platinum" },
  ];

  const actions = [
    { label: "Ver Pacientes", path: "/patients" },
    { label: "Ver Solicitacoes", path: "/requests" },
    { label: "Gerenciar Metas", path: "/patients" },
  ];

  return (
    <div className="min-h-screen bg-background px-4 pb-safe-24 pt-safe-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Bem-vindo(a)</p>
          <h1 className="text-2xl font-bold text-foreground">{doctorName}</h1>
        </div>
        <button
          onClick={signOut}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title="Sair"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-lg bg-card p-4">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Seu Código</p>
          <p className="font-mono text-lg font-semibold text-foreground">{doctorCode}</p>
        </div>
        <button
          onClick={handleCopy}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-lg bg-card p-3 text-center">
            <m.icon className={`mx-auto mb-1 h-5 w-5 ${m.color}`} />
            <p className="text-xl font-bold text-foreground">{m.value}</p>
            <p className="text-[10px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Acoes Rapidas</h2>
      <div className="space-y-2">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.path)}
            className="flex w-full items-center justify-between rounded-lg bg-card p-4 text-left text-foreground transition-colors hover:bg-accent"
          >
            <span className="text-sm font-medium">{a.label}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}
