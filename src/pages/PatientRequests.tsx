import { Loader2, Check, X } from "lucide-react";
import { LevelBadge } from "@/components/LevelBadge";
import { useRequests } from "@/hooks/useRequests";
import { usePatients } from "@/hooks/usePatients";

export default function PatientRequests() {
  const { requests, loading, acceptRequest, rejectRequest } = useRequests();
  const { refetch: refetchPatients } = usePatients();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleAccept = async (id: string) => {
    await acceptRequest(id);
    await refetchPatients();
  };

  const handleReject = async (id: string) => {
    await rejectRequest(id);
  };

  return (
    <div className="min-h-screen bg-background px-4 pb-safe-24 pt-safe-6">
      <h1 className="mb-1 text-2xl font-bold text-foreground">Solicitacoes</h1>
      <p className="mb-6 text-sm text-muted-foreground">{requests.length} pendentes</p>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-sm">Nenhuma solicitação pendente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="rounded-lg bg-card p-4">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground">{req.patientName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{req.requestDate}</p>
                </div>
                <LevelBadge level={req.level} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(req.id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Check className="h-4 w-4" /> Aceitar
                </button>
                <button
                  onClick={() => handleReject(req.id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-destructive/10 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
                >
                  <X className="h-4 w-4" /> Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
