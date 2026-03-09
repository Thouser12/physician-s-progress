import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, BarChart3 } from "lucide-react";
import { Patient, Goal } from "@/types/doctor";
import { LevelBadge } from "@/components/LevelBadge";
import { Progress } from "@/components/ui/progress";

interface Props {
  patients: Patient[];
  onUpdateGoals: (patientId: string, goals: Goal[]) => void;
}

export default function PatientDetail({ patients, onUpdateGoals }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const patient = patients.find((p) => p.id === id);

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Patient not found
      </div>
    );
  }

  const handleAddGoal = () => {
    if (!newTitle.trim() || patient.goals.length >= 10) return;
    const goal: Goal = {
      id: `g-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      frequency: "Daily",
    };
    onUpdateGoals(patient.id, [...patient.goals, goal]);
    setNewTitle("");
    setNewDesc("");
    setShowAddForm(false);
  };

  const handleRemoveGoal = (goalId: string) => {
    onUpdateGoals(patient.id, patient.goals.filter((g) => g.id !== goalId));
  };

  const handleEditSave = () => {
    if (!editingGoal) return;
    onUpdateGoals(
      patient.id,
      patient.goals.map((g) => (g.id === editingGoal.id ? editingGoal : g))
    );
    setEditingGoal(null);
  };

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      {/* Back button */}
      <button onClick={() => navigate("/patients")} className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{patient.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <LevelBadge level={patient.level} />
          </div>
        </div>
        <button
          onClick={() => navigate(`/patients/${patient.id}/progress`)}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
        >
          <BarChart3 className="h-5 w-5" />
        </button>
      </div>

      {/* Progress */}
      <div className="mb-6 rounded-lg bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Weekly Progress</span>
          <span className="font-semibold text-foreground">{patient.weeklyCompletion}%</span>
        </div>
        <Progress value={patient.weeklyCompletion} className="h-2 bg-secondary" />
      </div>

      {/* Goals */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Goals ({patient.goals.length}/10)
        </h2>
        {patient.goals.length < 10 && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 text-xs font-medium text-primary"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="mb-3 rounded-lg bg-card p-4 space-y-3">
          <input
            placeholder="Goal title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full rounded-md bg-secondary p-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            placeholder="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full rounded-md bg-secondary p-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex gap-2">
            <button onClick={handleAddGoal} className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground">
              Save
            </button>
            <button onClick={() => setShowAddForm(false)} className="flex-1 rounded-md bg-secondary py-2 text-sm font-medium text-muted-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit form */}
      {editingGoal && (
        <div className="mb-3 rounded-lg bg-card p-4 space-y-3 border border-primary/30">
          <input
            value={editingGoal.title}
            onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
            className="w-full rounded-md bg-secondary p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            placeholder="Description (optional)"
            value={editingGoal.description || ""}
            onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
            className="w-full rounded-md bg-secondary p-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex gap-2">
            <button onClick={handleEditSave} className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground">
              Update
            </button>
            <button onClick={() => setEditingGoal(null)} className="flex-1 rounded-md bg-secondary py-2 text-sm font-medium text-muted-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Goal list */}
      <div className="space-y-2">
        {patient.goals.map((goal) => (
          <div key={goal.id} className="flex items-center justify-between rounded-lg bg-card p-3">
            <div className="flex-1 mr-2">
              <p className="text-sm font-medium text-foreground">{goal.title}</p>
              {goal.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{goal.description}</p>
              )}
              <p className="mt-0.5 text-[10px] text-primary">{goal.frequency}</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setEditingGoal(goal)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleRemoveGoal(goal.id)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
