import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';

export function ResetPassword() {
  const [location] = useLocation();
  
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');

  // Extrair token da URL
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      // Validar token
      validateToken(tokenParam);
    } else {
      setTokenValid(false);
    }
  }, [location]);

  const validateToken = async (tokenParam: string) => {
    try {
      const result = await (trpc.password.validateToken as any).query({ token: tokenParam });
      if (result?.valid) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
      }
    } catch (error) {
      setTokenValid(false);
      setMessage('Token inválido ou expirado');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 8) {
      setMessage('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      const result = await (trpc.password.resetPassword as any).mutate({
        token,
        newPassword,
      });

      setMessage('Senha alterada com sucesso! Redirecionando...');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      setMessage('Falha ao alterar senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-6">
          <p className="text-center">Validando token...</p>
        </Card>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-6">
          <h1 className="text-2xl font-bold mb-4">Link Inválido</h1>
          <p className="text-muted-foreground mb-6">
            {message || 'O link de reset de senha é inválido ou expirou. Solicite um novo link.'}
          </p>
          <Button onClick={() => window.location.href = '/'} className="w-full">
            Voltar para Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-2">Redefinir Senha</h1>
        <p className="text-muted-foreground mb-6">
          Digite sua nova senha abaixo
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
              Nova Senha
            </label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Confirmar Senha
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          {message && (
            <div className={`p-3 rounded text-sm ${
              message.includes('sucesso') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
