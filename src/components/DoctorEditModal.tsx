import { useState, useRef, useEffect } from 'react';
import type { Area } from 'react-easy-crop';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cropImageToSquare } from '@/lib/crop-image';
import { ImageCropDialog } from '@/components/ImageCropDialog';
import { setCachedProfile } from '@/lib/profileCache';

interface DoctorEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  currentSpecialty: string | null;
  currentCrm: string | null;
  currentAvatarUrl: string | null;
  onSaved: () => void;
}

export function DoctorEditModal({
  open,
  onOpenChange,
  currentName,
  currentSpecialty,
  currentCrm,
  currentAvatarUrl,
  onSaved,
}: DoctorEditModalProps) {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(currentName);
  const [specialty, setSpecialty] = useState(currentSpecialty ?? '');
  const [crm, setCrm] = useState(currentCrm ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(currentName);
      setSpecialty(currentSpecialty ?? '');
      setCrm(currentCrm ?? '');
      setAvatarUrl(currentAvatarUrl);
    }
  }, [open, currentName, currentSpecialty, currentCrm, currentAvatarUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authUser) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Erro', description: 'Imagem deve ter menos que 10MB', variant: 'destructive' });
      return;
    }

    setPendingFile(file);
    setCropSrc(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropConfirm = async (pixelCrop: Area) => {
    if (!pendingFile || !authUser) return;
    setUploading(true);
    try {
      const cropped = await cropImageToSquare(pendingFile, pixelCrop, 400);
      const fileName = `${authUser.id}/avatar-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, cropped, { upsert: true, contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('profile-pictures').getPublicUrl(fileName);
      setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
      setCropSrc(null);
      setPendingFile(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao fazer upload';
      toast({ title: 'Erro no upload', description: msg, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setPendingFile(null);
  };

  const handleSave = async () => {
    if (!authUser) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('doctor_profiles')
        .update({
          name: name.trim(),
          specialty: specialty.trim() || null,
          crm_number: crm.trim() || null,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUser.id);

      if (error) throw error;

      setCachedProfile(authUser.id, {
        name: name.trim(),
        avatarUrl,
        crmNumber: crm.trim() || null,
        specialty: specialty.trim() || null,
      });

      onSaved();
      onOpenChange(false);
      toast({ title: 'Perfil atualizado' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar';
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl ?? undefined} alt={name} />
                  <AvatarFallback className="bg-accent text-2xl">
                    {name.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor-name">Nome</Label>
              <Input id="doctor-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidade</Label>
              <Input
                id="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Ex: Cardiologia"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="crm">CRM</Label>
              <Input id="crm" value={crm} onChange={(e) => setCrm(e.target.value)} placeholder="Ex: 123456-SP" />
            </div>
          </div>

          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || uploading || !name.trim()}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImageCropDialog
        open={!!cropSrc}
        imageSrc={cropSrc}
        onCancel={handleCropCancel}
        onConfirm={handleCropConfirm}
      />
    </>
  );
}
