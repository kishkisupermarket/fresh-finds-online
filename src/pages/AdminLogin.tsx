import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setInfo('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(`Login failed: ${error.message}`);
    } else {
      navigate('/admin');
    }
  };

  const handleReset = async () => {
    setError(''); setInfo('');
    setResetting(true);
    const targetEmail = email || 'kishkisupermarket@hotmail.com';
    const targetPassword = 'Kishki2026';
    const { data, error } = await supabase.functions.invoke('reset-admin', {
      body: { email: targetEmail, password: targetPassword },
    });
    setResetting(false);
    console.log('[reset-admin]', { data, error });
    if (error) {
      setError(`Reset failed: ${error.message}`);
    } else {
      setInfo(`Password reset for ${targetEmail}. Try logging in with Kishki2026.`);
      setEmail(targetEmail);
      setPassword(targetPassword);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <p className="text-sm text-muted-foreground">Kishki Halal Supermarket</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@kishki.ca" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {info && <p className="text-sm text-primary">{info}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleReset}
              disabled={resetting}
            >
              {resetting ? 'Resetting...' : 'Reset Admin Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

