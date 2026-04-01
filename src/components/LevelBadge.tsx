import { PatientLevel } from "@/types/doctor";

const levelStyles: Record<PatientLevel, {
  gradient: string;
  border: string;
  shadow: string;
  text: string;
}> = {
  Bronze: {
    gradient: "linear-gradient(145deg, #7B4F2A, #C88A55)",
    border: "rgba(123, 79, 42, 0.4)",
    shadow: "0 1px 4px rgba(123, 79, 42, 0.3), inset 0 1px 0 rgba(200, 138, 85, 0.3)",
    text: "#C88A55",
  },
  Silver: {
    gradient: "linear-gradient(145deg, #8D99A6, #E1E7EE)",
    border: "rgba(141, 153, 166, 0.4)",
    shadow: "0 1px 4px rgba(141, 153, 166, 0.3), inset 0 1px 0 rgba(225, 231, 238, 0.3)",
    text: "#B8C2CC",
  },
  Gold: {
    gradient: "linear-gradient(145deg, #9B7A34, #F2D189)",
    border: "rgba(155, 122, 52, 0.4)",
    shadow: "0 1px 6px rgba(214, 169, 79, 0.35), inset 0 1px 0 rgba(242, 209, 137, 0.3)",
    text: "#D6A94F",
  },
  Platinum: {
    gradient: "linear-gradient(145deg, #5D7F96, #D8F0FF)",
    border: "rgba(93, 127, 150, 0.4)",
    shadow: "0 1px 8px rgba(159, 196, 218, 0.35), inset 0 1px 0 rgba(216, 240, 255, 0.3)",
    text: "#9FC4DA",
  },
};

export function LevelBadge({ level }: { level: PatientLevel }) {
  const style = levelStyles[level];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{
        color: style.text,
        border: `1px solid ${style.border}`,
        boxShadow: style.shadow,
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{
          background: style.gradient,
          boxShadow: `0 0 4px ${style.border}`,
        }}
      />
      {level}
    </span>
  );
}
