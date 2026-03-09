import { PatientLevel } from "@/types/doctor";

const levelColorMap: Record<PatientLevel, string> = {
  Bronze: "bg-level-bronze",
  Silver: "bg-level-silver",
  Gold: "bg-level-gold",
  Platinum: "bg-level-platinum",
};

const levelTextMap: Record<PatientLevel, string> = {
  Bronze: "text-level-bronze",
  Silver: "text-level-silver",
  Gold: "text-level-gold",
  Platinum: "text-level-platinum",
};

export function LevelBadge({ level }: { level: PatientLevel }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${levelTextMap[level]} bg-background/40 border border-current/20`}
    >
      <span className={`h-2 w-2 rounded-full ${levelColorMap[level]}`} />
      {level}
    </span>
  );
}
