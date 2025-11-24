import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import gisicfLogo from "@/assets/gisicf-logo.png";

export default function Auth() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    email: "", 
    password: "", 
    phoneNumber: "", 
    researcherCode: "" 
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
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-mesh-gradient"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-mesh-gradient animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-mesh-gradient animation-delay-4000"></div>
      </div>

      {/* Left side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center flex flex-col items-center"
        >
          <motion.img 
            src={gisicfLogo} 
            alt="GISICF Logo" 
            className="w-48 h-auto mb-6 rounded-lg shadow-2xl"
            animate={{ 
              y: [0, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
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
        >
          <Card className="border-2 border-primary/20 shadow-2xl backdrop-blur-sm bg-card/95 relative overflow-hidden">
            <div className="absolute inset-0 rounded-lg opacity-75">
              <div className="absolute inset-[-2px] bg-gradient-to-r from-primary via-accent to-primary rounded-lg blur-sm animate-[spin_3s_linear_infinite]"></div>
            </div>
            
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
                    <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                    <TabsTrigger value="register">Registrarse</TabsTrigger>
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
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary"
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
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Button 
                          type="submit" 
                          className="w-full relative overflow-hidden group" 
                          disabled={loading}
                        >
                          <span className="relative z-10">
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
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary"
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
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary"
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
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary"
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
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Button 
                          type="submit" 
                          className="w-full relative overflow-hidden group" 
                          disabled={loading}
                        >
                          <span className="relative z-10">
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