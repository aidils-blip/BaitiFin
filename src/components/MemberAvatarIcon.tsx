import React from 'react';
import { User, Heart, Home, Users, Smile } from 'lucide-react';
import { MemberIconType } from '../types/finance';

interface MemberAvatarIconProps {
  icon?: MemberIconType | string;
  className?: string;
}

export const MemberAvatarIcon: React.FC<MemberAvatarIconProps> = ({
  icon = 'user',
  className = 'w-3.5 h-3.5',
}) => {
  switch (icon) {
    case 'heart':
      return <Heart className={`${className} text-rose-500`} />;
    case 'home':
      return <Home className={`${className} text-sky-500`} />;
    case 'users':
      return <Users className={`${className} text-teal-500`} />;
    case 'smile':
      return <Smile className={`${className} text-amber-500`} />;
    case 'user':
    default:
      return <User className={`${className} text-emerald-500`} />;
  }
};
