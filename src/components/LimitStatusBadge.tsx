import React from 'react';
import { LimitStatus } from '../mockData';

interface LimitStatusBadgeProps {
  status: LimitStatus;
}

export function LimitStatusBadge({ status }: LimitStatusBadgeProps) {
  const styles = {
    not_assigned: 'bg-gray-100 text-gray-700 border-gray-300',
    limits_assigned: 'bg-blue-100 text-blue-800 border-blue-300',
    limits_distributed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  };

  const labels = {
    not_assigned: 'Bez limitu',
    limits_assigned: 'Limity przyznane',
    limits_distributed: 'Limity rozdysponowane',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
