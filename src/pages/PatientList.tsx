import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Patient } from "@/types/doctor";
import { LevelBadge } from "@/components/LevelBadge";

interface Props {
  patients: Patient[];
}

export default function PatientList({ patients }: Props) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      <h1 className="mb-1 text-2xl font-bold text-foreground">Patients</h1>
      <p className="mb-4 text-sm text-muted-foreground">{patients.length} attached</p>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search patients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((patient) => (
          <button
            key={patient.id}
            onClick={() => navigate(`/patients/${patient.id}`)}
            className="flex w-full items-center justify-between rounded-lg bg-card p-4 text-left transition-colors hover:bg-accent"
          >
            <div>
              <p className="font-semibold text-foreground">{patient.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {patient.weeklyCompletion}% this week
              </p>
            </div>
            <LevelBadge level={patient.level} />
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No patients found</p>
        )}
      </div>
    </div>
  );
}
