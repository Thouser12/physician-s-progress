import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, Users, Bell, TrendingUp, ArrowRight } from "lucide-react";

interface DashboardProps {
  totalPatients: number;
  pendingRequests: number;
  avgCompletion: number;
}

export default function Dashboard({ totalPatients, pendingRequests, avgCompletion }: DashboardProps) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const doctorId = "DR-48291";

  const handleCopy = () => {
    navigator.clipboard.writeText(doctorId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const metrics = [
    { label: "Total Patients", value: totalPatients, icon: Users, color: "text-primary" },
    { label: "Pending Requests", value: pendingRequests, icon: Bell, color: "text-level-gold" },
    { label: "Avg. Completion", value: `${avgCompletion}%`, icon: TrendingUp, color: "text-level-platinum" },
  ];

  const actions = [
    { label: "View Patient List", path: "/patients" },
    { label: "View Requests", path: "/requests" },
    { label: "Manage Goals", path: "/patients" },
  ];

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="text-2xl font-bold text-foreground">Dr. Smith</h1>
      </div>

      {/* Doctor ID */}
      <div className="mb-6 flex items-center gap-3 rounded-lg bg-card p-4">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Doctor ID</p>
          <p className="font-mono text-lg font-semibold text-foreground">{doctorId}</p>
        </div>
        <button
          onClick={handleCopy}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      {/* Metrics */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-lg bg-card p-3 text-center">
            <m.icon className={`mx-auto mb-1 h-5 w-5 ${m.color}`} />
            <p className="text-xl font-bold text-foreground">{m.value}</p>
            <p className="text-[10px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</h2>
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
