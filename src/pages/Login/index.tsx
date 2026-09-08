import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';
import { useAuth } from '@/hooks/useAuth';
import { isEmail, isRequired } from '@/utils/validators';

export default function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEmail(email) || !isRequired(password)) return;

    login({ id: '1', name: 'Demo User', email, role: 'admin', token: 'token' });
    nav('/');
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-6 py-12">
      <form
        onSubmit={onSubmit}
        className="w-full rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-soft"
      >
        <h1 className="mb-6 text-3xl font-bold text-white">Entrar</h1>
        <div className="space-y-4">
          <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" className="w-full">
            Acessar
          </Button>
        </div>
      </form>
    </section>
  );
}
