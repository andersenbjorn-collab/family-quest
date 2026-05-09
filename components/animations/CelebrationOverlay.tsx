'use client';
import { useEffect, useState } from 'react';
import type { AnimationType } from '@/types';

interface Props {
  type: AnimationType;
  onDone: () => void;
  goalTitle?: string;
}

const COLORS = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#1dd1a1'];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function CelebrationOverlay({ type, onDone, goalTitle }: Props) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; size: number; angle: number; speed: number; rotation: number }[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const count = type === 'fireworks' ? 80 : type === 'confetti' ? 100 : type === 'stars' ? 60 : 40;
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: randomBetween(5, 95),
        y: randomBetween(5, 95),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: randomBetween(8, 24),
        angle: randomBetween(0, 360),
        speed: randomBetween(0.5, 2),
        rotation: randomBetween(-180, 180),
      }))
    );
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 500); }, 3500);
    return () => clearTimeout(t);
  }, [type, onDone]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-black/60 pointer-events-auto flex items-center justify-center" onClick={onDone}>
        <div className="text-center animate-scale-up">
          <div className="text-7xl mb-4">
            {type === 'fireworks' && '🎆'}
            {type === 'confetti' && '🎉'}
            {type === 'stars' && '⭐'}
            {type === 'levelup' && '🆙'}
          </div>
          <h2 className="text-4xl font-black text-white mb-2">MÅL NÅDD!</h2>
          {goalTitle && <p className="text-2xl text-yellow-300 font-bold">{goalTitle}</p>}
          <p className="text-white/70 mt-3 text-lg">Trykk for å fortsette</p>
        </div>
      </div>

      {particles.map(p => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            color: p.color,
            fontSize: `${p.size}px`,
            animation: `particleFall ${p.speed * 2 + 1}s ease-in forwards`,
            transform: `rotate(${p.rotation}deg)`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        >
          {type === 'confetti' && ['🎊', '🎈', '🎀', '✨'][Math.floor(Math.random() * 4)]}
          {type === 'stars' && ['⭐', '🌟', '💫', '✨'][Math.floor(Math.random() * 4)]}
          {type === 'fireworks' && ['💥', '✨', '🔥', '⚡'][Math.floor(Math.random() * 4)]}
          {type === 'levelup' && ['🆙', '⬆️', '🏆', '👑'][Math.floor(Math.random() * 4)]}
        </div>
      ))}

      <style jsx>{`
        @keyframes particleFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
