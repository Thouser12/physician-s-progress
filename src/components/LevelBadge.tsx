import { PatientLevel } from "@/types/doctor";

import bronzeBadge from '@/assets/badges/bronze.png';
import silverBadge from '@/assets/badges/silver.png';
import goldBadge from '@/assets/badges/gold.png';
import platinumBadge from '@/assets/badges/platinum.png';

const badgeImages: Record<PatientLevel, string> = {
  Bronze: bronzeBadge,
  Silver: silverBadge,
  Gold: goldBadge,
  Platinum: platinumBadge,
};

const levelLabels: Record<PatientLevel, string> = {
  Bronze: 'Bronze',
  Silver: 'Prata',
  Gold: 'Ouro',
  Platinum: 'Platina',
};

export function LevelBadge({ level }: { level: PatientLevel }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold text-foreground">
      <img
        src={badgeImages[level]}
        alt={levelLabels[level]}
        className="h-5 w-5 object-contain"
      />
      {levelLabels[level]}
    </span>
  );
}
