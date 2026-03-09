import { Patient, PatientRequest, ChatThread } from "@/types/doctor";

export const mockPatients: Patient[] = [
  {
    id: "p1",
    name: "Alice Johnson",
    level: "Gold",
    weeklyCompletion: 82,
    goals: [
      { id: "g1", title: "Walk 10,000 steps", frequency: "Daily" },
      { id: "g2", title: "Drink 2L of water", frequency: "Daily" },
      { id: "g3", title: "Meditate for 10 min", frequency: "Daily" },
      { id: "g4", title: "Sleep 7+ hours", frequency: "Daily" },
      { id: "g5", title: "Eat 5 servings of vegetables", frequency: "Daily" },
    ],
    weeklyHistory: [
      { week: 1, completion: 65, levelChange: "maintained", newLevel: "Silver" },
      { week: 2, completion: 72, levelChange: "promoted", newLevel: "Gold" },
      { week: 3, completion: 78, levelChange: "maintained", newLevel: "Gold" },
      { week: 4, completion: 82, levelChange: "maintained", newLevel: "Gold" },
    ],
  },
  {
    id: "p2",
    name: "Bob Martinez",
    level: "Silver",
    weeklyCompletion: 64,
    goals: [
      { id: "g6", title: "Take medication on time", frequency: "Daily" },
      { id: "g7", title: "30 min exercise", frequency: "3x/week" },
      { id: "g8", title: "No sugary drinks", frequency: "Daily" },
    ],
    weeklyHistory: [
      { week: 1, completion: 50, levelChange: "maintained", newLevel: "Bronze" },
      { week: 2, completion: 58, levelChange: "promoted", newLevel: "Silver" },
      { week: 3, completion: 70, levelChange: "maintained", newLevel: "Silver" },
      { week: 4, completion: 64, levelChange: "maintained", newLevel: "Silver" },
    ],
  },
  {
    id: "p3",
    name: "Clara Nguyen",
    level: "Platinum",
    weeklyCompletion: 95,
    goals: [
      { id: "g9", title: "Morning yoga", frequency: "Daily" },
      { id: "g10", title: "Journaling", frequency: "Daily" },
      { id: "g11", title: "Healthy meal prep", frequency: "Weekly" },
      { id: "g12", title: "Blood pressure check", frequency: "Daily" },
    ],
    weeklyHistory: [
      { week: 1, completion: 88, levelChange: "promoted", newLevel: "Gold" },
      { week: 2, completion: 91, levelChange: "promoted", newLevel: "Platinum" },
      { week: 3, completion: 93, levelChange: "maintained", newLevel: "Platinum" },
      { week: 4, completion: 95, levelChange: "maintained", newLevel: "Platinum" },
    ],
  },
  {
    id: "p4",
    name: "David Kim",
    level: "Bronze",
    weeklyCompletion: 38,
    goals: [
      { id: "g13", title: "Walk 5,000 steps", frequency: "Daily" },
      { id: "g14", title: "Avoid fast food", frequency: "Daily" },
    ],
    weeklyHistory: [
      { week: 1, completion: 45, levelChange: "maintained", newLevel: "Bronze" },
      { week: 2, completion: 40, levelChange: "maintained", newLevel: "Bronze" },
      { week: 3, completion: 42, levelChange: "maintained", newLevel: "Bronze" },
      { week: 4, completion: 38, levelChange: "maintained", newLevel: "Bronze" },
    ],
  },
  {
    id: "p5",
    name: "Emma Wilson",
    level: "Gold",
    weeklyCompletion: 75,
    goals: [
      { id: "g15", title: "Stretching routine", frequency: "Daily" },
      { id: "g16", title: "Read health articles", frequency: "Weekly" },
      { id: "g17", title: "Limit screen time", frequency: "Daily" },
    ],
    weeklyHistory: [
      { week: 1, completion: 60, levelChange: "maintained", newLevel: "Silver" },
      { week: 2, completion: 68, levelChange: "promoted", newLevel: "Gold" },
      { week: 3, completion: 81, levelChange: "maintained", newLevel: "Gold" },
      { week: 4, completion: 75, levelChange: "maintained", newLevel: "Gold" },
    ],
  },
];

export const mockRequests: PatientRequest[] = [
  { id: "r1", patientName: "Frank Lee", level: "Bronze", requestDate: "2026-03-07" },
  { id: "r2", patientName: "Grace Park", level: "Silver", requestDate: "2026-03-08" },
  { id: "r3", patientName: "Henry Costa", level: "Bronze", requestDate: "2026-03-09" },
];

export const mockChats: ChatThread[] = [
  {
    patientId: "p1",
    patientName: "Alice Johnson",
    messages: [
      { id: "m1", senderId: "doc", senderType: "doctor", text: "Hi Alice, great progress this week!", timestamp: "2026-03-08T10:00:00" },
      { id: "m2", senderId: "p1", senderType: "patient", text: "Thank you, Dr. Smith! I've been really consistent with my walks.", timestamp: "2026-03-08T10:05:00" },
      { id: "m3", senderId: "doc", senderType: "doctor", text: "Keep it up. Let's aim for 85% next week.", timestamp: "2026-03-08T10:10:00" },
    ],
  },
  {
    patientId: "p2",
    patientName: "Bob Martinez",
    messages: [
      { id: "m4", senderId: "doc", senderType: "doctor", text: "Bob, I noticed your exercise frequency dropped. Everything okay?", timestamp: "2026-03-07T14:00:00" },
      { id: "m5", senderId: "p2", senderType: "patient", text: "Had a rough week. Will get back on track.", timestamp: "2026-03-07T15:30:00" },
    ],
  },
  {
    patientId: "p3",
    patientName: "Clara Nguyen",
    messages: [
      { id: "m6", senderId: "p3", senderType: "patient", text: "Dr. Smith, should I increase my yoga duration?", timestamp: "2026-03-09T08:00:00" },
      { id: "m7", senderId: "doc", senderType: "doctor", text: "Yes, try 20 minutes starting next week. You're doing amazing!", timestamp: "2026-03-09T09:15:00" },
    ],
  },
];
