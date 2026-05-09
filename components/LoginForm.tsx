'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Star, Mail, Lock, UserPlus, LogIn, Loader } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { setError('Fyll inn e-post og passord'); return; }
    if (password.length < 6) { setError('Passordet må være minst 6 tegn'); return; }
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setDone(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
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

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-white font-black text-xl mb-2">Sjekk e-posten din!</h2>
          <p className="text-gray-400 text-sm">Vi sendte en bekreftelseslenke til <strong className="text-white">{email}</strong>. Klikk på lenken og logg deretter inn.</p>
          <button onClick={() => { setDone(false); setIsSignUp(false); }} className="btn-primary mt-6 w-full">
            Gå til innlogging
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
            <span className="text-5xl">🎮</span>
          </div>
          <h1 className="text-3xl font-black text-white">Family Quest</h1>
          <p className="text-gray-500 mt-1 text-sm">Familiens oppdragssentral</p>
        </div>

        {/* Card */}
        <div className="card p-6 space-y-4">
          <h2 className="text-white font-bold text-lg">
            {isSignUp ? '🚀 Opprett familieprofil' : '👋 Logg inn'}
          </h2>

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
            ) : isSignUp ? (
              <><UserPlus size={18} /> Opprett konto</>
            ) : (
              <><LogIn size={18} /> Logg inn</>
            )}
          </button>

          <button
            onClick={() => { setIsSignUp(s => !s); setError(''); }}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-300 transition-colors py-1"
          >
            {isSignUp
              ? 'Har du allerede konto? Logg inn'
              : 'Ny her? Opprett familieprofil'}
          </button>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6 flex items-center justify-center gap-1">
          <Star size={10} className="text-yellow-500" /> Data lagres trygt og deles i familien
        </p>
      </div>
    </div>
  );
}
