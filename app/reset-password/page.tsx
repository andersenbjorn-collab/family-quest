'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, Loader, CheckCircle } from 'lucide-react';
import AppLogo from '@/components/AppLogo';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts the session from the magic link into the URL hash — detect it
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (password.length < 6) { setError('Passordet må være minst 6 tegn'); return; }
    if (password !== confirm) { setError('Passordene er ikke like'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
    setTimeout(() => { window.location.href = '/'; }, 2500);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle size={56} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="text-white font-black text-xl mb-2">Passord oppdatert!</h2>
          <p className="text-gray-400 text-sm">Du blir nå sendt til appen...</p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Loader size={40} className="text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Validerer lenke...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
            <AppLogo logo="shield" size={48} />
          </div>
          <h1 className="text-2xl font-black text-white">Nytt passord</h1>
          <p className="text-gray-500 mt-1 text-sm">Velg et nytt passord for kontoen din</p>
        </div>

        <div className="card p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 flex items-center gap-1 block">
              <Lock size={11} /> Nytt passord
            </label>
            <input
              className="input"
              type="password"
              placeholder="Minst 6 tegn"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 flex items-center gap-1 block">
              <Lock size={11} /> Bekreft passord
            </label>
            <input
              className="input"
              type="password"
              placeholder="Skriv passordet igjen"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
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
            {loading ? <><Loader size={18} className="animate-spin" /> Lagrer...</> : 'Lagre nytt passord'}
          </button>
        </div>
      </div>
    </div>
  );
}
