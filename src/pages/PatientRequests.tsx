import { PatientRequest } from "@/types/doctor";
import { LevelBadge } from "@/components/LevelBadge";
import { Check, X } from "lucide-react";

interface Props {
  requests: PatientRequest[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export default function PatientRequests({ requests, onAccept, onReject }: Props) {
  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      <h1 className="mb-1 text-2xl font-bold text-foreground">Requests</h1>
      <p className="mb-6 text-sm text-muted-foreground">{requests.length} pending</p>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-sm">No pending requests</p>
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
                  onClick={() => onAccept(req.id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Check className="h-4 w-4" /> Accept
                </button>
                <button
                  onClick={() => onReject(req.id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-destructive/10 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
                >
                  <X className="h-4 w-4" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
