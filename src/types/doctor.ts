export type PatientLevel = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface Goal {
  id: string;
  title: string;
  description?: string;
  frequency: string;
}

export interface DailyGoal {
  id: string;
  text: string;
  completed: boolean;
}

export interface Patient {
  id: string;
  connectionId: string;
  name: string;
  avatarUrl: string | null;
  level: PatientLevel;
  weeklyCompletion: number;
  goals: Goal[];
  todayGoals: DailyGoal[];
  weeklyHistory: WeekRecord[];
}

export interface PatientRequest {
  id: string;
  patientName: string;
  level: PatientLevel;
  requestDate: string;
}

export interface WeekRecord {
  week: number;
  completion: number;
  levelChange?: "promoted" | "demoted" | "maintained";
  newLevel?: PatientLevel;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderType: "doctor" | "patient";
  text: string;
  timestamp: string;
}

export interface ChatThread {
  patientId: string;
  connectionId: string;
  patientName: string;
  patientAvatar: string | null;
  messages: ChatMessage[];
}
