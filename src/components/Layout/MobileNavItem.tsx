import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface MobileNavItemProps {
  icon: LucideIcon;
  label: string;
  to: string;
}

export default function MobileNavItem({ icon: Icon, label, to }: MobileNavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-1 ${
        isActive ? 'text-blue-600' : 'text-gray-600'
      }`}
    >
      <Icon size={20} />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}