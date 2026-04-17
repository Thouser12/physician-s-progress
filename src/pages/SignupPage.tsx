import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [crmNumber, setCrmNumber] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = name.trim().length > 0 && isValidEmail && password.length >= 6;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError("");
    setIsLoading(true);

    const { error } = await signUp(email, password, name.trim(), crmNumber.trim(), specialty.trim());

    if (error) {
      setError(error);
    } else {
      setSuccess(true);
    }

    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
        <Card className="w-full max-w-sm border-border/50 shadow-lg shadow-black/20">
          <CardContent className="pt-6 text-center space-y-4">
            <img src={logo} alt="Evolve" className="w-16 h-16 object-contain mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Verifique seu email</h2>
            <p className="text-sm text-muted-foreground">
              Enviamos um link de confirmacao para <strong className="text-foreground">{email}</strong>. Clique nele para ativar sua conta.
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="flex flex-col items-center mb-10">
        <img src={logo} alt="Evolve" className="w-24 h-24 object-contain mb-5" />
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Evolve <span className="text-primary">Ascend</span></h1>
        <p className="text-sm text-muted-foreground mt-1.5 text-center max-w-[280px]">
          Crie sua conta de medico.
        </p>
      </div>

      <Card className="w-full max-w-sm border-border/50 shadow-lg shadow-black/20">
        <CardContent className="pt-6">
          <form onSubmit={handleSignup} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground/80 text-xs font-medium uppercase tracking-wider">Nome</Label>
              <Input
                id="name"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 bg-background border-border/60 text-foreground placeholder:text-muted-foreground/50 transition-shadow focus-visible:ring-primary/40 focus-visible:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80 text-xs font-medium uppercase tracking-wider">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-background border-border/60 text-foreground placeholder:text-muted-foreground/50 transition-shadow focus-visible:ring-primary/40 focus-visible:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/80 text-xs font-medium uppercase tracking-wider">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-11 bg-background border-border/60 text-foreground placeholder:text-muted-foreground/50 transition-shadow focus-visible:ring-primary/40 focus-visible:border-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="crm" className="text-foreground/80 text-xs font-medium uppercase tracking-wider">
                CRM <span className="text-muted-foreground font-normal normal-case">(opcional)</span>
              </Label>
              <Input
                id="crm"
                placeholder="Ex: 123456/SP"
                value={crmNumber}
                onChange={(e) => setCrmNumber(e.target.value)}
                className="h-12 bg-background border-border/60 text-foreground placeholder:text-muted-foreground/50 transition-shadow focus-visible:ring-primary/40 focus-visible:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty" className="text-foreground/80 text-xs font-medium uppercase tracking-wider">
                Especialidade <span className="text-muted-foreground font-normal normal-case">(opcional)</span>
              </Label>
              <Input
                id="specialty"
                placeholder="Ex: Clinico Geral"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="h-12 bg-background border-border/60 text-foreground placeholder:text-muted-foreground/50 transition-shadow focus-visible:ring-primary/40 focus-visible:border-primary/50"
              />
            </div>

            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm tracking-wide rounded-xl transition-all disabled:opacity-40"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Criando conta...
                </span>
              ) : (
                "Criar Conta"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">Ja tem uma conta?</span>
        <button onClick={() => navigate("/login")} className="text-primary font-medium hover:underline underline-offset-2 transition-colors">
          Entrar
        </button>
      </div>
    </div>
  );
}
