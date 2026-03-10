import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export function LoginBar() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.user) {
        // Redirecionar baseado no perfil
        if (data.user.role === 'admin' || data.user.role === 'contributor') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/intranet';
        }
      }
    },
    onError: (err: any) => {
      setError(err.message || 'Erro ao fazer login');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Preencha e-mail e senha');
      setIsLoading(false);
      return;
    }

    loginMutation.mutate({ email, password });
    setIsLoading(false);
  };

  return (
    <div className="w-full" style={{ backgroundColor: 'var(--degase-blue-medium)' }}>
      <div className="container">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center justify-center gap-2 py-2">
          <div className="flex items-center gap-2 text-white text-sm font-medium hidden md:flex">
            <LogIn size={16} />
            <span>Acesso à Intranet:</span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-1.5 text-sm w-full md:w-40 focus:outline-none focus:ring-2 rounded-l-md"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#333333',
                borderRight: '1px solid var(--degase-gold)',
              }}
              disabled={isLoading}
              aria-label="E-mail para login"
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-1.5 text-sm w-full md:w-40 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#333333',
              }}
              disabled={isLoading}
              aria-label="Senha para login"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1.5 rounded-r-md text-sm font-medium flex items-center gap-1 hover:opacity-90 transition-opacity w-full md:w-auto justify-center"
              style={{
                backgroundColor: '#397ff0',
                color: '#f7f7f7',
              }}
              aria-label="Fazer login"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          {error && (
            <div className="text-xs text-red-300 w-full text-center md:text-left">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
