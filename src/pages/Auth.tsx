import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import gisicfLogo from "@/assets/gisicf-logo.png";

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
      // subtle background haze
      // draw particles
      for (const p of particlesRef.current) {
        // mouse interaction: gentle repulse
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 14000) {
          const force = (14000 - dist2) / 14000;
          p.vx += (dx / Math.sqrt(dist2 + 0.001)) * 0.15 * force;
          p.vy += (dy / Math.sqrt(dist2 + 0.001)) * 0.15 * force;
        }

        // drift
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;

        // wrap
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // draw
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(160,200,255,${p.alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // optional: draw faint connecting lines
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i];
          const b = particlesRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 70) {
            ctx.beginPath();
            const alpha = (0.06 * (1 - d / 70));
            ctx.strokeStyle = `rgba(160,200,255,${alpha})`;
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
      mouseRef.current.x = (e.clientX - rect.left);
      mouseRef.current.y = (e.clientY - rect.top);
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
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    phoneNumber: "",
    researcherCode: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn(loginData.email, loginData.password);
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signUp(
      registerData.email,
      registerData.password,
      registerData.phoneNumber,
      registerData.researcherCode
    );
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-b from-slate-900/40 to-slate-900/60">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/18 via-background to-accent/18 -z-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-mesh-gradient"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-mesh-gradient animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-mesh-gradient animation-delay-4000"></div>
      </div>

      {/* Particle layer (interactive, behind content) */}
      <ParticleBackground count={72} />

      {/* Left side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center flex flex-col items-center"
          whileHover={{ scale: 1.02 }}
        >
          <motion.img
            src={gisicfLogo}
            alt="GISICF Logo"
            className="w-48 h-auto mb-6 rounded-xl shadow-2xl border border-white/10"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.p
            className="text-xl font-medium text-foreground max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Plataforma de Gestión de Investigación
          </motion.p>
          <motion.p
            className="text-sm text-muted-foreground mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Universidad Estatal del Sur de Manabí
          </motion.p>
        </motion.div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md"
          whileHover={{ y: -6, scale: 1.01 }}
        >
          <Card className="border-2 border-primary/20 shadow-2xl backdrop-blur-sm bg-card/95 relative overflow-hidden">
            <div className="absolute inset-0 rounded-lg opacity-60 pointer-events-none"></div>
            <div className="absolute inset-[-2px] bg-gradient-to-r from-primary via-accent to-primary rounded-lg blur-sm animate-[spin_6s_linear_infinite] opacity-30"></div>

            <div className="relative bg-card rounded-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  GISICF - UNESUM
                </CardTitle>
                <CardDescription>
                  Acceso al Sistema de Gestión de Investigación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger className="hover:scale-[1.03] transition-transform" value="login">
                      Iniciar Sesión
                    </TabsTrigger>
                    <TabsTrigger className="hover:scale-[1.03] transition-transform" value="register">
                      Registrarse
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4 mt-4">
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Label htmlFor="login-email">Correo Institucional</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="tu-email@unesum.edu.ec"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          required
                          className="transition-all duration-300 focus:ring-4 focus:ring-primary/30"
                        />
                      </motion.div>
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Label htmlFor="login-password">Contraseña</Label>
                        <Input
                          id="login-password"
                          type="password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                          className="transition-all duration-300 focus:ring-4 focus:ring-primary/30"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Button
                          type="submit"
                          className="w-full relative overflow-hidden group transform-gpu hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                          disabled={loading}
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Iniciando sesión...
                              </>
                            ) : (
                              "Ingresar"
                            )}
                          </span>
                        </Button>
                      </motion.div>
                      <div className="flex items-center justify-center mt-2">
                        <button
                          type="button"
                          onClick={signInWithGoogle}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Iniciar sesión con Google
                        </button>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4 mt-4">
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Label htmlFor="register-email">Correo Institucional</Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="tu-email@unesum.edu.ec"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          required
                          className="transition-all duration-300 focus:ring-4 focus:ring-primary/30"
                        />
                      </motion.div>
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Label htmlFor="register-password">Contraseña</Label>
                        <Input
                          id="register-password"
                          type="password"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          required
                          minLength={6}
                          className="transition-all duration-300 focus:ring-4 focus:ring-primary/30"
                        />
                      </motion.div>
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Label htmlFor="register-phone">Número de Teléfono</Label>
                        <Input
                          id="register-phone"
                          type="tel"
                          placeholder="0991234567"
                          value={registerData.phoneNumber}
                          onChange={(e) => setRegisterData({ ...registerData, phoneNumber: e.target.value })}
                          required
                          className="transition-all duration-300 focus:ring-4 focus:ring-primary/30"
                        />
                      </motion.div>
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Label htmlFor="register-code">Código de Investigador</Label>
                        <Input
                          id="register-code"
                          type="text"
                          placeholder="INV-2024-001"
                          value={registerData.researcherCode}
                          onChange={(e) => setRegisterData({ ...registerData, researcherCode: e.target.value })}
                          required
                          className="transition-all duration-300 focus:ring-4 focus:ring-primary/30"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Button
                          type="submit"
                          className="w-full relative overflow-hidden group transform-gpu hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                          disabled={loading}
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Registrando...
                              </>
                            ) : (
                              "Registrarse"
                            )}
                          </span>
                        </Button>
                      </motion.div>
                      <p className="text-xs text-muted-foreground text-center mt-4">
                        Su cuenta será revisada por el administrador antes de otorgar acceso
                      </p>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}