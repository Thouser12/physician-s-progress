import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import Dashboard from "@/pages/Dashboard";
import PatientList from "@/pages/PatientList";
import PatientDetail from "@/pages/PatientDetail";
import PatientProgress from "@/pages/PatientProgress";
import PatientRequests from "@/pages/PatientRequests";
import ChatScreen from "@/pages/ChatScreen";
import NotFound from "@/pages/NotFound";
import { mockPatients, mockRequests, mockChats } from "@/data/mockData";
import { Patient, PatientRequest, Goal, ChatThread, ChatMessage } from "@/types/doctor";

const queryClient = new QueryClient();

const App = () => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [requests, setRequests] = useState<PatientRequest[]>(mockRequests);
  const [chats, setChats] = useState<ChatThread[]>(mockChats);

  const handleAcceptRequest = (id: string) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    const newPatient: Patient = {
      id: `p-${Date.now()}`,
      name: req.patientName,
      level: req.level,
      weeklyCompletion: 0,
      goals: [],
      weeklyHistory: [],
    };
    setPatients((prev) => [...prev, newPatient]);
    setChats((prev) => [...prev, { patientId: newPatient.id, patientName: newPatient.name, messages: [] }]);
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRejectRequest = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateGoals = (patientId: string, goals: Goal[]) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, goals } : p))
    );
  };

  const handleSendMessage = (patientId: string, text: string) => {
    const msg: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: "doc",
      senderType: "doctor",
      text,
      timestamp: new Date().toISOString(),
    };
    setChats((prev) =>
      prev.map((c) =>
        c.patientId === patientId ? { ...c, messages: [...c.messages, msg] } : c
      )
    );
  };

  const avgCompletion = patients.length
    ? Math.round(patients.reduce((sum, p) => sum + p.weeklyCompletion, 0) / patients.length)
    : 0;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="mx-auto max-w-lg">
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    totalPatients={patients.length}
                    pendingRequests={requests.length}
                    avgCompletion={avgCompletion}
                  />
                }
              />
              <Route path="/patients" element={<PatientList patients={patients} />} />
              <Route
                path="/patients/:id"
                element={<PatientDetail patients={patients} onUpdateGoals={handleUpdateGoals} />}
              />
              <Route path="/patients/:id/progress" element={<PatientProgress patients={patients} />} />
              <Route
                path="/requests"
                element={
                  <PatientRequests
                    requests={requests}
                    onAccept={handleAcceptRequest}
                    onReject={handleRejectRequest}
                  />
                }
              />
              <Route
                path="/chat"
                element={<ChatScreen chats={chats} onSendMessage={handleSendMessage} />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
