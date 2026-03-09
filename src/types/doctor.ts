export type PatientLevel = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface Goal {
  id: string;
  title: string;
  description?: string;
  frequency: string;
}

export interface Patient {
  id: string;
  name: string;
  level: PatientLevel;
  weeklyCompletion: number;
  goals: Goal[];
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
  patientName: string;
  messages: ChatMessage[];
}
