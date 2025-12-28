import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, Phone, Code, KeyRound, CheckCircle } from "lucide-react";
import gisicfLogo from "@/assets/gisicf-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PasswordStrength } from "@/components/ui/password-strength";

/**
 * Lightweight particle background (no extra deps).
 * Non-blocking, pointer-events none, with subtle mouse interaction.
 */
function ParticleBackground({ count = 60 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<any[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, down: false });

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    let width = 0;
    let height = 0;
    const DPR = Math.max(1, window.devicePixelRatio || 1);

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * DPR);
      canvas.height = Math.floor(height * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function initParticles() {
      particlesRef.current = [];
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          r: 0.8 + Math.random() * 2.2,
          alpha: 0.08 + Math.random() * 0.25,
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      for (const p of particlesRef.current) {
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 14000) {
          const force = (14000 - dist2) / 14000;
          p.vx += (dx / Math.sqrt(dist2 + 0.001)) * 0.15 * force;
          p.vy += (dy / Math.sqrt(dist2 + 0.001)) * 0.15 * force;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(0,122,51,${p.alpha * 0.5})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i];
          const b = particlesRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 70) {
            ctx.beginPath();
            const alpha = 0.06 * (1 - d / 70);
            ctx.strokeStyle = `rgba(0,122,51,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(step);
    }

    resize();
    initParticles();
    step();

    function onMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    }
    function onLeave() {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    }
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

export default function Auth() {
  const { signIn, signUp, signInWithGoogle, user, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    phoneNumber: "",
    researcherCode: "",
  });
  
  // Password reset state
  const [isResetMode, setIsResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  // Check if user came from password reset link
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (accessToken && type === 'recovery') {
      setIsResetMode(true);
    }
  }, []);

  // Redirect to dashboard if already logged in (but not in reset mode)
  useEffect(() => {
    if (user && !isResetMode) {
      navigate("/dashboard");
    }
  }, [user, navigate, isResetMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginData.email, loginData.password);
    if (!error) {
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) return;
    setLoading(true);
    await resetPassword(forgotPasswordEmail);
    setLoading(false);
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signUp(registerData.email, registerData.password, registerData.phoneNumber, registerData.researcherCode);
    setLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) {
        toast.error("Error al actualizar la contraseña: " + error.message);
      } else {
        setResetSuccess(true);
        toast.success("Contraseña actualizada correctamente");
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);
        setTimeout(() => {
          setIsResetMode(false);
          setResetSuccess(false);
          navigate("/dashboard");
        }, 2000);
      }
    } catch (error) {
      toast.error("Error inesperado al actualizar la contraseña");
    }
    setLoading(false);
  };

  // Password Reset Mode UI
  if (isResetMode) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(0,122,51,0.9);stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(10,20,40,0.95);stop-opacity:1" /></linearGradient></defs><rect width="1200" height="800" fill="url(%23grad)"/></svg>')`,
            backgroundAttachment: "fixed",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-slate-900/40 to-blue-900/20"></div>
        </div>

        <ParticleBackground count={80} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-20 w-full px-4 sm:px-6"
        >
          <Card className="w-full max-w-[450px] mx-auto border-0 shadow-2xl"
            style={{
              backdropFilter: "blur(16px)",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
            }}
          >
            <CardHeader className="text-center pb-4 pt-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex justify-center mb-4"
              >
                {resetSuccess ? (
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                    <KeyRound className="w-10 h-10 text-white" />
                  </div>
                )}
              </motion.div>
              <CardTitle className="text-2xl font-bold text-slate-800">
                {resetSuccess ? "¡Contraseña Actualizada!" : "Nueva Contraseña"}
              </CardTitle>
              <CardDescription className="text-slate-600">
                {resetSuccess 
                  ? "Redirigiendo al panel principal..." 
                  : "Ingresa tu nueva contraseña para continuar"}
              </CardDescription>
            </CardHeader>

            {!resetSuccess && (
              <CardContent>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Label htmlFor="new-password" className="text-sm font-medium text-slate-700">
                      Nueva Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-green-600" />
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        className="pl-10 bg-slate-50 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      />
                    </div>
                    <PasswordStrength password={newPassword} />
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <Label htmlFor="confirm-password" className="text-sm font-medium text-slate-700">
                      Confirmar Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-green-600" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="pl-10 bg-slate-50 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      />
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="pt-2"
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                      disabled={loading || newPassword !== confirmPassword}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Actualizando...
                        </>
                      ) : (
                        "Actualizar Contraseña"
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            )}
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Premium Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(0,122,51,0.9);stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(10,20,40,0.95);stop-opacity:1" /></linearGradient></defs><rect width="1200" height="800" fill="url(%23grad)"/></svg>')`,
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-slate-900/40 to-blue-900/20"></div>
      </div>

      {/* Particle layer */}
      <ParticleBackground count={80} />

      {/* Premium Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-20 w-full px-4 sm:px-6"
      >
        <Card className="w-full max-w-[450px] mx-auto border-0 shadow-2xl"
          style={{
            backdropFilter: "blur(16px)",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
          }}
        >
          <div className="relative">
            {/* Header Section */}
            <CardHeader className="text-center pb-4 pt-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex justify-center mb-4"
              >
                <img
                  src={gisicfLogo}
                  alt="GISICF Logo"
                  className="w-20 h-20 object-contain rounded-full"
                />
              </motion.div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-700 to-blue-600 bg-clip-text text-transparent mb-2">
                Bienvenido Investigador
              </CardTitle>
              <CardDescription className="text-base text-slate-600">
                Plataforma de Gestión de Investigación Científica
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                {/* Tab Navigation */}
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 p-1 rounded-lg">
                  <TabsTrigger 
                    value="login"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white rounded-md font-medium transition-all duration-200 hover:scale-105"
                  >
                    Iniciar Sesión
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white rounded-md font-medium transition-all duration-200 hover:scale-105"
                  >
                    Registrarse
                  </TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login" className="mt-0">
                  <motion.form 
                    onSubmit={handleLogin} 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      <Label htmlFor="login-email" className="text-sm font-medium text-slate-700">
                        Correo Institucional
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-green-600" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="tu-email@unesum.edu.ec"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          required
                          className="pl-10 bg-slate-50 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Label htmlFor="login-password" className="text-sm font-medium text-slate-700">
                        Contraseña
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-green-600" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                          className="pl-10 bg-slate-50 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                      className="pt-2 space-y-3"
                    >
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Iniciando sesión...
                          </>
                        ) : (
                          "Ingresar"
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => setShowForgotPassword(true)}
                        className="w-full text-sm text-green-700 hover:text-green-800"
                      >
                        ¿Olvidaste tu contraseña?
                      </Button>
                    </motion.div>
                  </motion.form>

                  {/* Forgot Password Modal */}
                  {showForgotPassword && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                      onClick={() => setShowForgotPassword(false)}
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                          Recuperar Contraseña
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">
                          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                        </p>
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-green-600" />
                            <Input
                              type="email"
                              placeholder="tu-email@unesum.edu.ec"
                              value={forgotPasswordEmail}
                              onChange={(e) => setForgotPasswordEmail(e.target.value)}
                              required
                              className="pl-10 bg-slate-50 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowForgotPassword(false)}
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="submit"
                              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                              disabled={loading}
                            >
                              {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Enviar"
                              )}
                            </Button>
                          </div>
                        </form>
                      </motion.div>
                    </motion.div>
                  )}
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register" className="mt-0">
                  <motion.form 
                    onSubmit={handleRegister} 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      <Label htmlFor="register-email" className="text-sm font-medium text-slate-700">
                        Correo Institucional
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-green-600" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="tu-email@unesum.edu.ec"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          required
                          className="pl-10 bg-slate-50 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Label htmlFor="register-password" className="text-sm font-medium text-slate-700">
                        Contraseña
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-green-600" />
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="••••••••"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          required
                          minLength={6}
                          className="pl-10 bg-slate-50 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                        />
                      </div>
                      <PasswordStrength password={registerData.password} />
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                    >
                      <Label htmlFor="register-phone" className="text-sm font-medium text-slate-700">
                        Número de Teléfono
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-green-600" />
                        <Input
                          id="register-phone"
                          type="tel"
                          placeholder="0991234567"
                          value={registerData.phoneNumber}
                          onChange={(e) => setRegisterData({ ...registerData, phoneNumber: e.target.value })}
                          required
                          className="pl-10 bg-slate-50 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Label htmlFor="register-code" className="text-sm font-medium text-slate-700">
                        Código de Investigador
                      </Label>
                      <div className="relative">
                        <Code className="absolute left-3 top-3 h-5 w-5 text-green-600" />
                        <Input
                          id="register-code"
                          type="text"
                          placeholder="INV-2024-001"
                          value={registerData.researcherCode}
                          onChange={(e) => setRegisterData({ ...registerData, researcherCode: e.target.value })}
                          required
                          className="pl-10 bg-slate-50 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.55 }}
                      className="pt-2"
                    >
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registrando...
                          </>
                        ) : (
                          "Registrarse"
                        )}
                      </Button>
                    </motion.div>

                    <motion.p 
                      className="text-xs text-slate-500 text-center mt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      Su cuenta será revisada por el administrador antes de otorgar acceso
                    </motion.p>
                  </motion.form>
                </TabsContent>
              </Tabs>
            </CardContent>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-500 bg-slate-50/50 rounded-b-2xl"
            >
              © 2025 UNESUM - GISICF
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
