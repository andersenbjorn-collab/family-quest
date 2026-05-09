'use client';
import type { User } from '@/types';

interface Props {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES = {
  sm:  { outer: 'w-9 h-9',   text: 'text-lg' },
  md:  { outer: 'w-12 h-12', text: 'text-2xl' },
  lg:  { outer: 'w-16 h-16', text: 'text-3xl' },
  xl:  { outer: 'w-24 h-24', text: 'text-5xl' },
};

export default function UserAvatar({ user, size = 'md', className = '' }: Props) {
  const s = SIZES[size];
  return (
    <div
      className={`${s.outer} rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ background: user.photoData ? undefined : `${user.color}30`, border: `2px solid ${user.color}60` }}
    >
      {user.photoData ? (
        <img src={user.photoData} alt={user.name} className="w-full h-full object-cover" />
      ) : (
        <span className={s.text}>{user.avatar}</span>
      )}
    </div>
  );
}
