import { FormEvent, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { FlaskConical, ShieldCheck, BrainCircuit, Sparkles } from 'lucide-react';

const ROLES: Role[] = ['Admin', 'Investigator', 'Coordinator', 'Data Manager', 'Safety', 'Regulatory'];

const FEATURES = [
  { icon: FlaskConical, text: 'Protocol upload to trial setup, extracted by AI' },
  { icon: BrainCircuit, text: 'AI Trial Copilot answers questions from live data' },
  { icon: Sparkles, text: 'Data Quality Guardian catches issues automatically' },
  { icon: ShieldCheck, text: 'Role-based access for every stage of a trial' }
];

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Coordinator');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    if (mode === 'signin') {
      const err = await signIn(email, password);
      if (err) setError(err);
    } else {
      const result = await signUp(email, password, fullName, role);
      if (result && result.startsWith('Account created')) setInfo(result);
      else if (result) setError(result);
    }
    setBusy(false);
  }

  return (
    <div className="min-h-screen flex bg-paper">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-teal-dark text-white p-12 flex-col justify-between relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-9 h-9 rounded-lg bg-teal flex items-center justify-center font-serifh">V</div>
            <span className="font-serifh text-xl">VaidyaPariksha</span>
          </div>
          <h1 className="font-serifh text-4xl leading-tight mb-4 max-w-md">
            AI-assisted clinical trial management for AIIA.
          </h1>
          <p className="text-[#bfe0da] max-w-sm text-sm leading-relaxed">
            One dashboard for protocol setup, sites, participants, safety, data quality and analytics — built for
            the Ministry of Ayush's clinical research teams.
          </p>
        </div>
        <div className="relative space-y-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.text} className="flex items-center gap-3 text-sm text-[#dcf0ec]">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </div>
                {f.text}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg bg-teal text-white flex items-center justify-center font-serifh text-sm">V</div>
            <span className="font-serifh text-lg">VaidyaPariksha</span>
          </div>

          <h2 className="font-serifh text-2xl mb-1">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="text-sm text-muted mb-6">
            {mode === 'signin' ? 'Sign in to continue to your dashboard.' : 'Set up access for your role in seconds.'}
          </p>

          <div className="flex gap-1 mb-6 bg-[#ece7d9] p-1 rounded-lg text-sm">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); setInfo(null); }}
              className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${mode === 'signin' ? 'bg-white shadow-card text-ink' : 'text-muted'}`}
            >
              I have an account
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setInfo(null); }}
              className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${mode === 'signup' ? 'bg-white shadow-card text-ink' : 'text-muted'}`}
            >
              Create account
            </button>
          </div>

          <div className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="text-xs font-medium text-muted">Full name</label>
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-line rounded-lg p-2.5 mt-1 text-sm bg-white"
                    placeholder="Dr. R. Menon"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full border border-line rounded-lg p-2.5 mt-1 text-sm bg-white"
                  >
                    {ROLES.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="text-xs font-medium text-muted">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-line rounded-lg p-2.5 mt-1 text-sm bg-white"
                placeholder="you@aiia.gov.in"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-line rounded-lg p-2.5 mt-1 text-sm bg-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red mt-4">{error}</p>}
          {info && <p className="text-sm text-teal-dark mt-4">{info}</p>}

          <button className="btn w-full mt-6 py-2.5" disabled={busy} type="submit">
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>

          <p className="text-xs text-muted mt-5 text-center">
            Accounts are stored in Supabase Auth with a role-linked profile.
          </p>
        </form>
      </div>
    </div>
  );
}
