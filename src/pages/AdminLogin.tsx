import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

const ADMIN_EMAIL = 'kishkisupermarket@hotmail.com';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState(ADMIN_EMAIL);
  const [sending, setSending] = useState(false);
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

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setInfo('');
    setSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: 'https://fresh-finds-online.vercel.app/admin/reset-password',
    });
    setSending(false);
    if (error) {
      setError(`Failed to send reset link: ${error.message}`);
    } else {
      setInfo('Check your email for the reset link');
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
          {!showForgot ? (
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
              <button
                type="button"
                className="w-full text-sm text-primary hover:underline"
                onClick={() => { setShowForgot(true); setError(''); setInfo(''); setForgotEmail(email || ADMIN_EMAIL); }}
              >
                Forgot Password?
              </button>
            </form>
          ) : (
            <form onSubmit={handleSendReset} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {info && <p className="text-sm text-primary">{info}</p>}
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <button
                type="button"
                className="w-full text-sm text-muted-foreground hover:underline"
                onClick={() => { setShowForgot(false); setError(''); setInfo(''); }}
              >
                Back to login
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
