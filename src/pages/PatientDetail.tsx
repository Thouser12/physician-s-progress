import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, BarChart3, Loader2, CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { Goal, PatientLevel, DailyGoal } from "@/types/doctor";
import { LevelBadge } from "@/components/LevelBadge";
import { Progress } from "@/components/ui/progress";
import { usePatients } from "@/hooks/usePatients";

const LEVEL_ORDER: PatientLevel[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];

const LEVEL_LABELS: Record<PatientLevel, string> = {
  Bronze: 'Bronze',
  Silver: 'Prata',
  Gold: 'Ouro',
  Platinum: 'Platina',
};

const LEVEL_GOALS: Record<PatientLevel, string[]> = {
  Bronze: [
    'Beber pelo menos 6 copos de agua',
    'Caminhar por 15 minutos',
    'Comer uma fruta',
    'Dormir antes das 23h',
    'Evitar refrigerante',
    'Fazer 5 minutos de alongamento',
    'Tomar cafe da manha saudavel',
    'Registrar suas refeicoes',
    'Praticar 3 minutos de respiracao consciente',
    'Ler 10 paginas de um livro',
  ],
  Silver: [
    'Beber pelo menos 8 copos de agua',
    'Caminhar por 30 minutos',
    'Comer 2 porcoes de frutas',
    'Dormir antes das 22h30',
    'Evitar alimentos ultraprocessados',
    'Fazer 10 minutos de exercicio',
    'Preparar uma refeicao saudavel',
    'Registrar humor e energia do dia',
    'Meditar por 5 minutos',
    'Reduzir tempo de tela em 30 minutos',
  ],
  Gold: [
    'Beber pelo menos 10 copos de agua',
    'Praticar 30 minutos de exercicio fisico',
    'Comer 3 porcoes de vegetais',
    'Dormir 7-8 horas completas',
    'Cozinhar todas as refeicoes do dia',
    'Fazer 15 minutos de treino funcional',
    'Planejar refeicoes do dia seguinte',
    'Praticar gratidao (3 itens)',
    'Meditar por 10 minutos',
    'Ler por 30 minutos',
  ],
  Platinum: [
    'Beber 12 copos de agua',
    'Treinar por 45 minutos',
    'Seguir plano alimentar completo',
    'Manter rotina de sono consistente',
    'Zero ultraprocessados no dia',
    'Fazer treino de forca ou resistencia',
    'Preparar marmitas saudaveis',
    'Journaling: reflexao diaria escrita',
    'Meditar por 15 minutos',
    'Ensinar um habito saudavel a alguem',
  ],
};

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients, loading, updateGoals, updateDailyGoals } = usePatients();
  const patient = patients.find((p) => p.id === id);

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [showLevels, setShowLevels] = useState(false);
  const [expandedLevel, setExpandedLevel] = useState<PatientLevel | null>(null);
  const [editingDaily, setEditingDaily] = useState<DailyGoal | null>(null);
  const [showAddDaily, setShowAddDaily] = useState(false);
  const [newDailyText, setNewDailyText] = useState("");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Paciente nao encontrado
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
    updateGoals(patient.id, [...patient.goals, goal]);
    setNewTitle("");
    setNewDesc("");
    setShowAddForm(false);
  };

  const handleRemoveGoal = (goalId: string) => {
    updateGoals(patient.id, patient.goals.filter((g) => g.id !== goalId));
  };

  const handleEditSave = () => {
    if (!editingGoal) return;
    updateGoals(
      patient.id,
      patient.goals.map((g) => (g.id === editingGoal.id ? editingGoal : g))
    );
    setEditingGoal(null);
  };

  const todayCompleted = patient.todayGoals.filter(g => g.completed).length;
  const todayTotal = patient.todayGoals.length;
  const currentLevelIdx = LEVEL_ORDER.indexOf(patient.level);

  const handleEditDaily = (goal: DailyGoal) => {
    setEditingDaily({ ...goal });
  };

  const handleSaveDaily = () => {
    if (!editingDaily) return;
    const updated = patient.todayGoals.map(g =>
      g.id === editingDaily.id ? { ...g, text: editingDaily.text } : g
    );
    updateDailyGoals(patient.id, updated);
    setEditingDaily(null);
  };

  const handleRemoveDaily = (goalId: string) => {
    const updated = patient.todayGoals.filter(g => g.id !== goalId);
    updateDailyGoals(patient.id, updated);
  };

  const handleToggleDaily = (goalId: string) => {
    const updated = patient.todayGoals.map(g =>
      g.id === goalId ? { ...g, completed: !g.completed } : g
    );
    updateDailyGoals(patient.id, updated);
  };

  const handleAddDaily = () => {
    if (!newDailyText.trim()) return;
    const newGoal: DailyGoal = {
      id: `goal-${Date.now()}`,
      text: newDailyText.trim(),
      completed: false,
    };
    updateDailyGoals(patient.id, [...patient.todayGoals, newGoal]);
    setNewDailyText("");
    setShowAddDaily(false);
  };

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      <button onClick={() => navigate("/patients")} className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

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

      <div className="mb-6 rounded-lg bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progresso Semanal</span>
          <span className="font-semibold text-foreground">{patient.weeklyCompletion}%</span>
        </div>
        <Progress value={patient.weeklyCompletion} className="h-2 bg-secondary" />
      </div>

      {/* Today's Tasks */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Tarefas de Hoje {todayTotal > 0 && `(${todayCompleted}/${todayTotal})`}
          </h2>
          {todayTotal > 0 && (
            <button
              onClick={() => setShowAddDaily(true)}
              className="flex items-center gap-1 text-xs font-medium text-primary"
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </button>
          )}
        </div>

        {showAddDaily && (
          <div className="mb-3 rounded-lg bg-card p-4 space-y-3">
            <input
              placeholder="Nova tarefa"
              value={newDailyText}
              onChange={(e) => setNewDailyText(e.target.value)}
              className="w-full rounded-md bg-secondary p-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2">
              <button onClick={handleAddDaily} className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground">
                Salvar
              </button>
              <button onClick={() => { setShowAddDaily(false); setNewDailyText(""); }} className="flex-1 rounded-md bg-secondary py-2 text-sm font-medium text-muted-foreground">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {editingDaily && (
          <div className="mb-3 rounded-lg bg-card p-4 space-y-3 border border-primary/30">
            <input
              value={editingDaily.text}
              onChange={(e) => setEditingDaily({ ...editingDaily, text: e.target.value })}
              className="w-full rounded-md bg-secondary p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2">
              <button onClick={handleSaveDaily} className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground">
                Atualizar
              </button>
              <button onClick={() => setEditingDaily(null)} className="flex-1 rounded-md bg-secondary py-2 text-sm font-medium text-muted-foreground">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {todayTotal > 0 ? (
          <div className="space-y-1.5">
            {patient.todayGoals.map(goal => (
              <div
                key={goal.id}
                className={`flex items-center justify-between rounded-lg p-3 ${
                  goal.completed ? 'bg-success/5 border border-success/20' : 'bg-card'
                }`}
              >
                <button
                  onClick={() => handleToggleDaily(goal.id)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  {goal.completed ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className={`text-sm ${goal.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {goal.text}
                  </span>
                </button>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditDaily(goal)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemoveDaily(goal.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-card p-4 text-center">
            <p className="text-sm text-muted-foreground">Paciente ainda nao abriu o app hoje</p>
          </div>
        )}
      </div>

      {/* Doctor-assigned Goals */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Metas Personalizadas ({patient.goals.length}/10)
        </h2>
        {patient.goals.length < 10 && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 text-xs font-medium text-primary"
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="mb-3 rounded-lg bg-card p-4 space-y-3">
          <input
            placeholder="Titulo da meta"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full rounded-md bg-secondary p-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            placeholder="Descricao (opcional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full rounded-md bg-secondary p-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex gap-2">
            <button onClick={handleAddGoal} className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground">
              Salvar
            </button>
            <button onClick={() => setShowAddForm(false)} className="flex-1 rounded-md bg-secondary py-2 text-sm font-medium text-muted-foreground">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {editingGoal && (
        <div className="mb-3 rounded-lg bg-card p-4 space-y-3 border border-primary/30">
          <input
            value={editingGoal.title}
            onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
            className="w-full rounded-md bg-secondary p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            placeholder="Descricao (opcional)"
            value={editingGoal.description || ""}
            onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
            className="w-full rounded-md bg-secondary p-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex gap-2">
            <button onClick={handleEditSave} className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground">
              Atualizar
            </button>
            <button onClick={() => setEditingGoal(null)} className="flex-1 rounded-md bg-secondary py-2 text-sm font-medium text-muted-foreground">
              Cancelar
            </button>
          </div>
        </div>
      )}

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
        {patient.goals.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nenhuma meta personalizada. Use as metas padrao do nivel ou adicione metas customizadas.
          </p>
        )}
      </div>

      {/* Level Tiers Reference */}
      <div className="mt-8">
        <button
          onClick={() => setShowLevels(!showLevels)}
          className="mb-3 flex w-full items-center justify-between text-sm font-semibold uppercase tracking-wider text-muted-foreground"
        >
          <span>Metas por Nivel</span>
          {showLevels ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showLevels && (
          <div className="space-y-2">
            {LEVEL_ORDER.map((level, idx) => {
              const isExpanded = expandedLevel === level;
              const isCurrent = level === patient.level;
              return (
                <div key={level} className={`rounded-lg border ${isCurrent ? 'border-primary/40' : 'border-border'} overflow-hidden`}>
                  <button
                    onClick={() => setExpandedLevel(isExpanded ? null : level)}
                    className={`flex w-full items-center justify-between p-3 text-left ${isCurrent ? 'bg-primary/5' : 'bg-card'}`}
                  >
                    <div className="flex items-center gap-2">
                      <LevelBadge level={level} />
                      <span className="text-sm font-medium text-foreground">{LEVEL_LABELS[level]}</span>
                      {isCurrent && (
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">Atual</span>
                      )}
                      {idx > currentLevelIdx && (
                        <span className="text-[10px] text-muted-foreground">Bloqueado</span>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border bg-background p-3">
                      <ol className="space-y-1.5">
                        {LEVEL_GOALS[level].map((goal, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                            <span className="mt-0.5 text-[10px] font-medium text-muted-foreground">{i + 1}.</span>
                            {goal}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
