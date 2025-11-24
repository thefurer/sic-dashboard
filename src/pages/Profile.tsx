import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const metadata: any = (user as any)?.user_metadata ?? {};

  const [fullName, setFullName] = useState<string>(metadata.full_name ?? "");
  const [phone, setPhone] = useState<string>(metadata.phone_number ?? "");
  const [researcherCode, setResearcherCode] = useState<string>(metadata.researcher_code ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(metadata.avatar_url ?? null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(metadata.full_name ?? "");
    setPhone(metadata.phone_number ?? "");
    setResearcherCode(metadata.researcher_code ?? "");
    setAvatarPreview(metadata.avatar_url ?? null);
  }, [user]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setAvatarFile(f);
    if (f) setAvatarPreview(URL.createObjectURL(f));
  };

  const uploadAvatar = async (file: File, userId: string) => {
    const ext = file.name.split('.').pop();
    const filePath = `avatars/${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from('avatars').upload(filePath, file, { cacheControl: '3600', upsert: true });
    if (error) throw error;

    // Try to get public URL (requires bucket public)
    try {
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (e) {
      return null;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      let avatarUrl = avatarPreview;

      if (avatarFile) {
        const publicUrl = await uploadAvatar(avatarFile, user.id);
        if (publicUrl) avatarUrl = publicUrl;
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          phone_number: phone,
          researcher_code: researcherCode,
          avatar_url: avatarUrl,
        },
      });

      if (error) {
        toast.error(error.message || 'Error al actualizar el perfil');
      } else {
        toast.success('Perfil actualizado correctamente');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error subiendo la imagen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-start justify-center py-12">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-2xl px-4">
        <Card>
          <CardHeader>
            <CardTitle>Editar Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-2">
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm text-muted-foreground">Sin foto</span>
                    )}
                  </div>
                  <input aria-label="Subir avatar" type="file" accept="image/*" onChange={handleFile} />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Número de celular</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              <div>
                <Label htmlFor="researcher">Código de investigador</Label>
                <Input id="researcher" value={researcherCode} onChange={(e) => setResearcherCode(e.target.value)} />
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
                <Button variant="ghost" onClick={() => { setAvatarFile(null); setAvatarPreview(metadata.avatar_url ?? null); }}>Restaurar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
