import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/store/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('demo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      navigate('/');
    } catch {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-app-bg p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.2),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(34,197,94,0.16),transparent_35%)]" />
      <Card className="relative z-10 w-full max-w-md p-6">
        <p className="mb-1 text-sm uppercase tracking-widest text-slate-400">Refrigeration Monitoring</p>
        <h1 className="mb-6 text-3xl font-semibold">ColdChain Control</h1>

        <form className="space-y-4" onSubmit={submit}>
          <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Enter Platform'}
          </Button>
        </form>

        <p className="mt-4 text-xs text-slate-400">Demo credentials: demo / demo</p>
      </Card>
    </div>
  );
}
