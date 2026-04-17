import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Patient, Goal, PatientLevel, WeekRecord, DailyGoal } from '@/types/doctor';
import { format } from 'date-fns';

const LEVEL_MAP: Record<string, PatientLevel> = {
  bronze: 'Bronze',
  prata: 'Silver',
  ouro: 'Gold',
  platina: 'Platinum',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
};

function normalizeLevel(level: string): PatientLevel {
  return LEVEL_MAP[level.toLowerCase()] ?? 'Bronze';
}

export function usePatients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = useCallback(async () => {
    if (!user) return;

    // Get all accepted connections for this doctor
    const { data: connections, error: connError } = await supabase
      .from('doctor_connections')
      .select('id, user_id, doctor_name, custom_goals')
      .eq('doctor_user_id', user.id)
      .eq('status', 'accepted');

    if (connError || !connections) {
      setLoading(false);
      return;
    }

    if (connections.length === 0) {
      setPatients([]);
      setLoading(false);
      return;
    }

    // Get patient profiles
    const patientIds = connections.map(c => c.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, level, week_start_date, avatar_url')
      .in('id', patientIds);

    // Get goals for all patients
    const connectionIds = connections.map(c => c.id);
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .in('connection_id', connectionIds)
      .eq('is_active', true);

    // Get daily records (for weekly completion + today's tasks)
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data: dailyRecords } = await supabase
      .from('daily_records')
      .select('user_id, record_date, goals')
      .in('user_id', patientIds);

    // Get weekly summaries for history
    const { data: weeklySummaries } = await supabase
      .from('weekly_summaries')
      .select('*')
      .in('user_id', patientIds)
      .order('week_start', { ascending: true });

    const patientList: Patient[] = connections.map(conn => {
      const profile = profiles?.find(p => p.id === conn.user_id);
      const patientGoals = goals?.filter(g => g.patient_id === conn.user_id) ?? [];

      // Compute weekly completion from daily records
      const weekStart = profile?.week_start_date ?? today;
      const patientRecords = (dailyRecords ?? []).filter(
        r => r.user_id === conn.user_id
      );
      let totalCompleted = 0;
      let totalGoals = 0;
      patientRecords.forEach(r => {
        const g = r.goals as { id: string; text: string; completed: boolean }[];
        totalCompleted += g.filter(goal => goal.completed).length;
        totalGoals += g.length;
      });
      const weeklyCompletion = totalGoals > 0 ? Math.round((totalCompleted / totalGoals) * 100) : 0;

      // Map weekly summaries to history
      const patientSummaries = (weeklySummaries ?? []).filter(s => s.user_id === conn.user_id);
      const weeklyHistory: WeekRecord[] = patientSummaries.map((s, i) => ({
        week: i + 1,
        completion: s.percentage,
        levelChange: s.status === 'maintained' ? undefined : s.status as 'promoted' | 'demoted',
        newLevel: normalizeLevel(s.level_after),
      }));

      // Get today's daily goals for this patient
      const todayRecord = (dailyRecords ?? []).find(
        r => r.user_id === conn.user_id && r.record_date === today
      );
      const todayGoals: DailyGoal[] = todayRecord
        ? (todayRecord.goals as DailyGoal[])
        : [];

      return {
        id: conn.user_id,
        connectionId: conn.id,
        name: profile?.name ?? 'Paciente',
        avatarUrl: profile?.avatar_url ?? null,
        level: normalizeLevel(profile?.level ?? 'bronze'),
        weeklyCompletion,
        goals: patientGoals.map(g => ({
          id: g.id,
          title: g.title,
          description: g.description ?? undefined,
          frequency: g.frequency,
        })),
        todayGoals,
        weeklyHistory,
      };
    });

    setPatients(patientList);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const updateGoals = useCallback(async (patientId: string, updatedGoals: Goal[]) => {
    if (!user) return;

    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    // Find connection for this patient
    const { data: conn } = await supabase
      .from('doctor_connections')
      .select('id')
      .eq('doctor_user_id', user.id)
      .eq('user_id', patientId)
      .eq('status', 'accepted')
      .single();

    if (!conn) return;

    const currentGoalIds = patient.goals.map(g => g.id);
    const newGoalIds = updatedGoals.map(g => g.id);

    // Delete removed goals
    const removedIds = currentGoalIds.filter(id => !newGoalIds.includes(id));
    if (removedIds.length > 0) {
      await supabase.from('goals').delete().in('id', removedIds);
    }

    // Upsert remaining goals
    for (const goal of updatedGoals) {
      if (currentGoalIds.includes(goal.id)) {
        // Update existing
        await supabase.from('goals').update({
          title: goal.title,
          description: goal.description ?? null,
          frequency: goal.frequency,
          updated_at: new Date().toISOString(),
        }).eq('id', goal.id);
      } else {
        // Insert new
        await supabase.from('goals').insert({
          doctor_id: user.id,
          patient_id: patientId,
          connection_id: conn.id,
          title: goal.title,
          description: goal.description ?? null,
          frequency: goal.frequency,
        });
      }
    }

    // Refresh
    await fetchPatients();
  }, [user, patients, fetchPatients]);

  const updateDailyGoals = useCallback(async (patientId: string, updatedGoals: DailyGoal[]) => {
    if (!user) return;

    const today = format(new Date(), 'yyyy-MM-dd');

    await supabase.from('daily_records').update({
      goals: updatedGoals as any,
      updated_at: new Date().toISOString(),
    }).eq('user_id', patientId).eq('record_date', today);

    // Optimistic update
    setPatients(prev => prev.map(p =>
      p.id === patientId ? { ...p, todayGoals: updatedGoals } : p
    ));
  }, [user]);

  return { patients, loading, updateGoals, updateDailyGoals, refetch: fetchPatients };
}
