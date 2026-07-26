'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, UserPlus, LogIn, Loader, ArrowLeft } from 'lucide-react';
import AppLogo from '@/components/AppLogo';

type Mode = 'login' | 'signup' | 'forgot';

export default function LoginForm() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const reset = (m: Mode) => { setMode(m); setError(''); setDone(false); };

  const handleSubmit = async () => {
    setError('');
    if (!email) { setError('Fyll inn e-post'); return; }
    if (mode !== 'forgot' && password.length < 6) { setError('Passordet må være minst 6 tegn'); return; }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setDone(true);
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setDone(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Noe gikk galt';
      if (msg.includes('Invalid login')) setError('Feil e-post eller passord');
      else if (msg.includes('already registered')) setError('E-posten er allerede registrert — logg inn istedet');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (done && mode === 'signup') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-white font-black text-xl mb-2">Sjekk e-posten din!</h2>
          <p className="text-gray-400 text-sm">Vi sendte en bekreftelseslenke til <strong className="text-white">{email}</strong>. Klikk på lenken og logg deretter inn.</p>
          <button onClick={() => reset('login')} className="btn-primary mt-6 w-full">
            Gå til innlogging
          </button>
        </div>
      </div>
    );
  }

  if (done && mode === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">📬</div>
          <h2 className="text-white font-black text-xl mb-2">Lenke sendt!</h2>
          <p className="text-gray-400 text-sm">Sjekk innboksen til <strong className="text-white">{email}</strong> og følg lenken for å sette nytt passord.</p>
          <button onClick={() => reset('login')} className="btn-primary mt-6 w-full">
            Tilbake til innlogging
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
            <AppLogo logo="shield" size={48} />
          </div>
          <h1 className="text-3xl font-black text-white">Family Quest</h1>
          <p className="text-gray-500 mt-1 text-sm">Familiens oppdragssentral</p>
        </div>

        {/* Card */}
        <div className="card p-6 space-y-4">
          {mode === 'forgot' ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <button onClick={() => reset('login')} className="text-gray-500 hover:text-white transition-colors">
                  <ArrowLeft size={18} />
                </button>
                <h2 className="text-white font-bold text-lg">🔑 Glemt passord?</h2>
              </div>
              <p className="text-gray-500 text-sm">Skriv inn e-posten din, så sender vi en lenke for å nullstille passordet.</p>
            </>
          ) : (
            <h2 className="text-white font-bold text-lg">
              {mode === 'signup' ? '🚀 Opprett familieprofil' : '👋 Logg inn'}
            </h2>
          )}

          <div>
            <label className="text-xs text-gray-400 mb-1 flex items-center gap-1 block">
              <Mail size={11} /> E-post
            </label>
            <input
              className="input"
              type="email"
              placeholder="din@epost.no"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="text-xs text-gray-400 mb-1 flex items-center gap-1 block">
                <Lock size={11} /> Passord
              </label>
              <input
                className="input"
                type="password"
                placeholder="Minst 6 tegn"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <><Loader size={18} className="animate-spin" /> Laster...</>
            ) : mode === 'signup' ? (
              <><UserPlus size={18} /> Opprett konto</>
            ) : mode === 'forgot' ? (
              <><Mail size={18} /> Send tilbakestillingslenke</>
            ) : (
              <><LogIn size={18} /> Logg inn</>
            )}
          </button>

          {mode === 'login' && (
            <div className="flex flex-col gap-1 pt-1">
              <button
                onClick={() => reset('signup')}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-300 transition-colors py-1"
              >
                Ny her? Opprett familieprofil
              </button>
              <button
                onClick={() => reset('forgot')}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-400 transition-colors py-1"
              >
                Glemt passord?
              </button>
            </div>
          )}

          {mode === 'signup' && (
            <button
              onClick={() => reset('login')}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-300 transition-colors py-1"
            >
              Har du allerede konto? Logg inn
            </button>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Hver familie har sin egen konto — data deles aldri med andre
        </p>
      </div>
    </div>
  );
}
