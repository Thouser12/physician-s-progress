import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { LevelBadge } from "@/components/LevelBadge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { usePatients } from "@/hooks/usePatients";

export default function PatientProgress() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients, loading } = usePatients();
  const patient = patients.find((p) => p.id === id);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Paciente nao encontrado
      </div>
    );
  }

  const chartData = patient.weeklyHistory.map((w) => ({
    name: `S${w.week}`,
    completion: w.completion,
  }));

  const getChangeIcon = (change?: string) => {
    if (change === "promoted") return <TrendingUp className="h-3.5 w-3.5 text-level-gold" />;
    if (change === "demoted") return <TrendingDown className="h-3.5 w-3.5 text-destructive" />;
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  const getChangeLabel = (change?: string, level?: string) => {
    if (change === "promoted") return `Promovido para ${level}`;
    if (change === "demoted") return `Rebaixado para ${level}`;
    return `Manteve ${level}`;
  };

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      <button onClick={() => navigate(`/patients/${id}`)} className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <h1 className="mb-1 text-2xl font-bold text-foreground">{patient.name}</h1>
      <div className="mb-6 flex items-center gap-2">
        <LevelBadge level={patient.level} />
        <span className="text-sm text-muted-foreground">{patient.weeklyCompletion}% esta semana</span>
      </div>

      <div className="mb-6 rounded-lg bg-card p-4">
        <p className="mb-2 text-sm text-muted-foreground">Semana Atual</p>
        <div className="mb-1 flex items-end justify-between">
          <span className="text-3xl font-bold text-foreground">{patient.weeklyCompletion}%</span>
        </div>
        <Progress value={patient.weeklyCompletion} className="h-2 bg-secondary" />
      </div>

      {chartData.length > 0 && (
        <div className="mb-6 rounded-lg bg-card p-4">
          <p className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Visao Semanal</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                <Bar dataKey="completion" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill="hsl(217 91% 60%)" fillOpacity={0.6 + (i / chartData.length) * 0.4} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Historico</h2>
      <div className="space-y-2">
        {patient.weeklyHistory.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nenhum historico ainda</p>
        ) : (
          [...patient.weeklyHistory].reverse().map((w) => (
            <div key={w.week} className="flex items-center justify-between rounded-lg bg-card p-3">
              <div className="flex items-center gap-3">
                {getChangeIcon(w.levelChange)}
                <div>
                  <p className="text-sm font-medium text-foreground">Semana {w.week} - {w.completion}%</p>
                  <p className="text-xs text-muted-foreground">{getChangeLabel(w.levelChange, w.newLevel)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
