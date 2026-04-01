import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Patient, Goal, PatientLevel } from '@/types/doctor';

function normalizeLevel(level: string): PatientLevel {
  const capitalized = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
  if (capitalized === 'Bronze' || capitalized === 'Silver' || capitalized === 'Gold' || capitalized === 'Platinum') {
    return capitalized;
  }
  return 'Bronze';
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
      .select('id, name, level')
      .in('id', patientIds);

    // Get goals for all patients
    const connectionIds = connections.map(c => c.id);
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .in('connection_id', connectionIds)
      .eq('is_active', true);

    const patientList: Patient[] = connections.map(conn => {
      const profile = profiles?.find(p => p.id === conn.user_id);
      const patientGoals = goals?.filter(g => g.patient_id === conn.user_id) ?? [];

      return {
        id: conn.user_id,
        connectionId: conn.id,
        name: profile?.name ?? 'Paciente',
        level: normalizeLevel(profile?.level ?? 'bronze'),
        weeklyCompletion: 0, // TODO: compute from patient's daily records once migrated
        goals: patientGoals.map(g => ({
          id: g.id,
          title: g.title,
          description: g.description ?? undefined,
          frequency: g.frequency,
        })),
        weeklyHistory: [], // TODO: populate from patient data once migrated
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

  return { patients, loading, updateGoals, refetch: fetchPatients };
}
