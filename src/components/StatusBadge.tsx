import React from 'react';
import { BudgetStatus } from '../mockData';

interface StatusBadgeProps {
  status: BudgetStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    draft: 'bg-gray-100 text-gray-700 border-gray-300',
    pending: 'bg-amber-100 text-amber-800 border-amber-300',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
  };

  const labels = {
    draft: 'Roboczy',
    pending: 'Oczekuje',
    approved: 'Zatwierdzony',
    rejected: 'Odrzucony',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
