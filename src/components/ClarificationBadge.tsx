import React from 'react';
import { AlertCircle, MessageCircle, CheckCircle } from 'lucide-react';
import { ClarificationStatus } from '../mockData';

interface ClarificationBadgeProps {
  status: ClarificationStatus;
  hasUnreadComments?: boolean;
}

export function ClarificationBadge({ status, hasUnreadComments }: ClarificationBadgeProps) {
  if (status === 'none') return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'requested':
        return {
          icon: AlertCircle,
          text: 'Wymaga wyjaśnienia',
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-800',
          iconColor: 'text-amber-600',
        };
      case 'responded':
        return {
          icon: MessageCircle,
          text: 'Wyjaśnienie dodane',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
        };
      case 'resolved':
        return {
          icon: CheckCircle,
          text: 'Rozwiązane',
          bgColor: 'bg-emerald-100',
          textColor: 'text-emerald-800',
          iconColor: 'text-emerald-600',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="relative inline-block">
      <span
        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
      >
        <Icon className={`w-3 h-3 ${config.iconColor}`} />
        <span>{config.text}</span>
      </span>
      {hasUnreadComments && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      )}
    </div>
  );
}
