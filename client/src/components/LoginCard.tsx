import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LoginCard() {
  const [, setLocation] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success("Login realizado com sucesso!");
      // Redirecionar baseado no perfil
      if (data.role === "admin" || data.role === "contributor") {
        setLocation("/admin");
      } else {
        // Perfil "user" vai para a intranet
        setLocation("/intranet");
      }
    },
    onError: (error) => {
      setLoginError("Email ou senha incorretos");
      toast.error("Erro ao fazer login");
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    if (!loginEmail || !loginPassword) {
      setLoginError("Por favor, preencha todos os campos");
      return;
    }

    setIsLoggingIn(true);
    try {
      await loginMutation.mutateAsync({ email: loginEmail, password: loginPassword });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Não mostrar o card se o usuário já está logado
  if (user) {
    return null;
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-lg p-6 border-t-4 hover:shadow-xl transition-shadow"
      style={{ borderTopColor: "var(--degase-blue-dark)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <LogIn size={20} style={{ color: "var(--degase-blue-dark)" }} />
        <h3 className="text-lg font-bold" style={{ color: "var(--degase-blue-dark)" }}>
          Acesso à Intranet
        </h3>
      </div>

      <form onSubmit={handleLogin} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
            style={{ "--tw-ring-color": "var(--degase-blue-dark)" } as any}
            required
            disabled={isLoggingIn}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
            style={{ "--tw-ring-color": "var(--degase-blue-dark)" } as any}
            required
            disabled={isLoggingIn}
          />
        </div>

        {loginError && (
          <p className="text-red-500 text-sm font-medium">{loginError}</p>
        )}

        <Button
          type="submit"
          disabled={isLoggingIn}
          className="w-full text-white font-medium text-sm transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ backgroundColor: "var(--degase-blue-dark)" }}
        >
          {isLoggingIn ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              <LogIn size={16} />
              Entrar
            </>
          )}
        </Button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
        <p className="text-xs text-blue-700">
          <strong>Demonstração:</strong> Use <code className="bg-blue-100 px-1 rounded">admin@degase.local</code> / <code className="bg-blue-100 px-1 rounded">admin</code>
        </p>
      </div>
    </div>
  );
}
