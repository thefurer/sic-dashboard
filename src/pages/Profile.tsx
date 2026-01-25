import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { User, Phone, FileText, Lock, BadgeCheck, Upload, Eye, Globe, Link as LinkIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSignedUrl } from "@/hooks/useSignedUrl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES, getCountryByCode, detectCountryFromPhone } from "@/lib/countryUtils";
import { OrcidInput } from "@/components/ui/OrcidInput";

export default function Profile() {
  const { user } = useAuth();
  const metadata: any = (user as any)?.user_metadata ?? {};

  const [fullName, setFullName] = useState<string>(metadata.full_name ?? "");
  const [phone, setPhone] = useState<string>(metadata.phone_number ?? "");
  const [researcherCode, setResearcherCode] = useState<string>(metadata.researcher_code ?? "");
  const [orcid, setOrcid] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("EC");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(metadata.avatar_url ?? null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      // Fetch profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, researcher_code, avatar_url, cv_url, orcid, country_code')
        .eq('id', user.id)
        .single();
      
      // Fetch contact info from profile_contacts
      const { data: contactData } = await supabase
        .from('profile_contacts')
        .select('phone')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (profileData) {
        setFullName(profileData.full_name ?? "");
        setResearcherCode(profileData.researcher_code ?? "");
        setAvatarPreview(profileData.avatar_url ?? null);
        setCvUrl(profileData.cv_url ?? null);
        setOrcid(profileData.orcid ?? "");
        setCountryCode(profileData.country_code ?? "EC");
      }
      
      if (contactData) {
        setPhone(contactData.phone ?? "");
        // Auto-detect country from phone if not set
        if (contactData.phone && !profileData?.country_code) {
          const detected = detectCountryFromPhone(contactData.phone);
          setCountryCode(detected);
        }
      }
    };
    
    loadProfile();
  }, [user]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setAvatarFile(f);
    if (f) setAvatarPreview(URL.createObjectURL(f));
  };

  const handleCvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && f.type === 'application/pdf') {
      setCvFile(f);
    } else {
      toast.error('Por favor selecciona un archivo PDF');
    }
  };

  const uploadAvatar = async (file: File, userId: string) => {
    const ext = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from('avatars').upload(filePath, file, { cacheControl: '3600', upsert: true });
    if (error) throw error;

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const uploadCV = async (file: File, userId: string) => {
    const filePath = `${userId}/cv_${Date.now()}.pdf`;

    const { error } = await supabase.storage.from('cvs').upload(filePath, file, { cacheControl: '3600', upsert: true });
    if (error) throw error;

    return filePath;
  };

  const handleViewCV = async () => {
    if (!cvUrl) return;
    const url = await getSignedUrl('cvs', cvUrl);
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.error('Error al abrir el CV');
    }
  };

  const validateOrcid = (value: string): boolean => {
    if (!value) return true; // Optional field
    // ORCID format: 0000-0000-0000-0000 or 0000-0000-0000-000X
    const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
    return orcidRegex.test(value);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate ORCID format
    if (orcid && !validateOrcid(orcid)) {
      toast.error('Formato de ORCID inválido. Ejemplo: 0000-0002-7793-9871');
      return;
    }

    setSaving(true);

    try {
      let avatarUrl = avatarPreview;
      let newCvUrl = cvUrl;

      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile, user.id);
      }

      if (cvFile) {
        newCvUrl = await uploadCV(cvFile, user.id);
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          researcher_code: researcherCode,
          avatar_url: avatarUrl,
          cv_url: newCvUrl,
          orcid: orcid || null,
          country_code: countryCode,
        })
        .eq('id', user.id);

      if (profileError) {
        toast.error(profileError.message || 'Error al actualizar el perfil');
        setSaving(false);
        return;
      }

      // Update contact info
      const { error: contactError } = await supabase
        .from('profile_contacts')
        .upsert({
          user_id: user.id,
          phone: phone,
        }, { onConflict: 'user_id' });

      if (contactError) {
        toast.error(contactError.message || 'Error al actualizar información de contacto');
        setSaving(false);
        return;
      }

      toast.success('Perfil actualizado correctamente');
      setCvFile(null);
      setAvatarFile(null);
      setAvatarPreview(avatarUrl);
      setCvUrl(newCvUrl);
    } catch (err: any) {
      toast.error(err?.message || 'Error al guardar los archivos');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast.error(error.message || 'Error al cambiar la contraseña');
      } else {
        toast.success('Contraseña actualizada correctamente');
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error al cambiar la contraseña');
    } finally {
      setChangingPassword(false);
    }
  };

  const selectedCountry = getCountryByCode(countryCode);

  return (
    <div className="min-h-[70vh]">
      {/* Hero Header with Hexagonal Pattern */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl mb-8 glass-card-dark hex-pattern"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
        <div className="relative p-8 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar with Glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/50 blur-2xl rounded-full scale-110" />
            <Avatar className="w-28 h-28 ring-4 ring-primary/50 relative shadow-2xl">
              <AvatarImage src={avatarPreview || undefined} alt={fullName} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-3xl font-bold">
                {getInitials(fullName || "U")}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* User Info */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{fullName || "Usuario"}</h1>
              <BadgeCheck className="h-6 w-6 text-primary" />
              {selectedCountry && (
                <span className="text-2xl" title={selectedCountry.name}>{selectedCountry.flag}</span>
              )}
            </div>
            <p className="text-slate-400 mt-1">{user?.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
              {researcherCode && (
                <p className="text-sm text-primary font-mono">Código: {researcherCode}</p>
              )}
              {orcid && (
                <a 
                  href={`https://orcid.org/${orcid}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-green-400 hover:text-green-300 font-mono flex items-center gap-1"
                >
                  <LinkIcon className="h-3 w-3" />
                  ORCID: {orcid}
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre completo *</Label>
                  <Input 
                    id="fullName" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    required 
                    className="bg-slate-50 dark:bg-background/50 border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      País *
                    </Label>
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="bg-slate-50 dark:bg-background/50 border-slate-200 dark:border-white/10">
                        <SelectValue placeholder="Seleccionar país" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <span className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.name}</span>
                              <span className="text-muted-foreground text-xs">{country.phoneCode}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Número de celular *
                    </Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-background/30 text-sm text-muted-foreground">
                        {selectedCountry?.phoneCode || '+593'}
                      </span>
                      <Input 
                        id="phone" 
                        type="tel" 
                        value={phone.replace(/^\+\d{2,3}/, '')} 
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setPhone(value);
                        }}
                        onKeyDown={(e) => {
                          // Allow: backspace, delete, tab, escape, enter, arrows
                          if ([8, 9, 27, 13, 46, 37, 38, 39, 40].includes(e.keyCode)) return;
                          // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                          if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
                          // Block if not a number
                          if (!/[0-9]/.test(e.key)) e.preventDefault();
                        }}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="999999999"
                        className="rounded-l-none bg-slate-50 dark:bg-background/50 border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="researcher">Código de investigador *</Label>
                  <Input 
                    id="researcher" 
                    value={researcherCode} 
                    onChange={(e) => setResearcherCode(e.target.value)} 
                    className="bg-slate-50 dark:bg-background/50 border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50 font-mono"
                    placeholder="INV-001"
                  />
                </div>

                <OrcidInput value={orcid} onChange={setOrcid} />

                <div className="space-y-2">
                  <Label>Foto de perfil (opcional)</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={avatarPreview || undefined} />
                      <AvatarFallback className="bg-primary/20">{getInitials(fullName || "U")}</AvatarFallback>
                    </Avatar>
                    <label className="flex-1">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-slate-300 dark:border-white/20 hover:border-primary/50 cursor-pointer transition-colors bg-slate-50/50 dark:bg-transparent">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Cambiar foto</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25"
                  >
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* CV Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Curriculum Vitae
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cvUrl ? (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">CV Cargado</p>
                      <p className="text-xs text-muted-foreground">Documento PDF</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-primary/30 hover:bg-primary/10"
                    onClick={handleViewCV}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-white/20 text-center bg-slate-50/50 dark:bg-transparent">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No hay CV cargado</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Subir nuevo CV (PDF)</Label>
                <label className="block">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-slate-300 dark:border-white/20 hover:border-primary/50 cursor-pointer transition-colors bg-slate-50/50 dark:bg-transparent">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {cvFile ? cvFile.name : 'Seleccionar archivo PDF'}
                    </span>
                  </div>
                  <input type="file" accept=".pdf,application/pdf" onChange={handleCvFile} className="hidden" />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="glass-card mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required 
                    className="bg-slate-50 dark:bg-background/50 border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma tu nueva contraseña"
                    required 
                    className="bg-slate-50 dark:bg-background/50 border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={changingPassword}
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/10"
                >
                  {changingPassword ? 'Cambiando...' : 'Cambiar contraseña'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
