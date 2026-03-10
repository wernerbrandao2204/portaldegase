import { useState } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Shield, Mail, Lock, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"local" | "oauth">("local");

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Erro ao fazer login");
        return;
      }

      // Login bem-sucedido, redirecionar para o admin
      setLocation("/admin");
    } catch (err) {
      setError("Erro ao conectar ao servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Shield size={48} className="mx-auto mb-4" style={{ color: "var(--degase-blue-dark)" }} />
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--degase-blue-dark)" }}>
            DEGASE
          </h1>
          <p className="text-gray-600">Painel Administrativo</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setLoginMethod("local")}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
              loginMethod === "local"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Email e Senha
          </button>
          <button
            onClick={() => setLoginMethod("oauth")}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
              loginMethod === "oauth"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Login Manus
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex gap-2">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Local Login Form */}
        {loginMethod === "local" && (
          <form onSubmit={handleLocalLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail size={16} className="inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@degase.local"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Lock size={16} className="inline mr-2" />
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              style={{ backgroundColor: "var(--degase-blue-dark)" }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Usuário padrão: admin@degase.local / admin
            </p>
          </form>
        )}

        {/* OAuth Login */}
        {loginMethod === "oauth" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center mb-4">
              Faça login usando sua conta Manus
            </p>
            <Button
              onClick={handleOAuthLogin}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Entrar com Manus
            </Button>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-6 text-center">
          <a href="/" className="text-sm hover:underline" style={{ color: "var(--degase-blue-light)" }}>
            ← Voltar ao site
          </a>
        </div>
      </div>
    </div>
  );
}
