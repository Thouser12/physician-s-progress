import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDoctor } from '@/hooks/useDoctor';
import { usePatients } from '@/hooks/usePatients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DoctorEditModal } from '@/components/DoctorEditModal';
import { useToast } from '@/hooks/use-toast';
import { Pencil, LogOut, Users, Copy, Loader2, Stethoscope, IdCard } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile, loading, refetch } = useDoctor();
  const { patients } = usePatients();
  const [editOpen, setEditOpen] = useState(false);
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const copyCode = async () => {
    if (!profile) return;
    await navigator.clipboard.writeText(profile.doctor_code);
    toast({ title: 'Código copiado', description: 'Código copiado para a área de transferência' });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Perfil não encontrado
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 pb-safe-24 pt-safe-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Perfil</h1>
          <Button variant="ghost" size="icon" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>

        {/* Profile header */}
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.name} />
            <AvatarFallback className="bg-accent text-3xl font-bold text-foreground">
              {profile.name.charAt(0).toUpperCase() || 'D'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Dr. {profile.name}</h2>
            {profile.specialty && (
              <p className="text-sm text-muted-foreground">{profile.specialty}</p>
            )}
          </div>
        </div>

        {/* Doctor code card */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Seu Código</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Compartilhe este código com seus pacientes para que se vinculem a você.
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <code className="flex-1 text-center text-xl font-bold tracking-widest text-primary">
                {profile.doctor_code}
              </code>
              <Button variant="ghost" size="icon" onClick={copyCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info cards */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <Users className="mb-1 h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">{patients.length}</span>
              <span className="text-xs text-muted-foreground">Pacientes</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <IdCard className="mb-1 h-5 w-5 text-muted-foreground" />
              <span className="truncate text-lg font-bold text-foreground">
                {profile.crm_number || '-'}
              </span>
              <span className="text-xs text-muted-foreground">CRM</span>
            </CardContent>
          </Card>
        </div>

        {/* Details */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Especialidade</p>
                <p className="text-foreground">{profile.specialty || 'Não informada'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <IdCard className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">CRM</p>
                <p className="text-foreground">{profile.crm_number || 'Não informado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>

      <DoctorEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        currentName={profile.name}
        currentSpecialty={profile.specialty}
        currentCrm={profile.crm_number}
        currentAvatarUrl={profile.avatar_url}
        onSaved={refetch}
      />
    </div>
  );
}
