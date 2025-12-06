import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { BudgetItem } from '../mockData';
import { LimitStatusBadge } from './LimitStatusBadge';

interface LimitAssignmentViewProps {
  budgetItems: BudgetItem[];
  onAssignLimits: (limits: { itemId: string; limitAmount: number }[]) => Promise<void>;
  onApproveLimits: () => Promise<void>;
  formatCurrency: (amount: number) => string;
}

export function LimitAssignmentView({
  budgetItems,
  onAssignLimits,
  onApproveLimits,
  formatCurrency,
}: LimitAssignmentViewProps) {
  const [limits, setLimits] = useState<{ [itemId: string]: string }>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialLimits: { [itemId: string]: string } = {};
    budgetItems.forEach(item => {
      if (item.limitAmount) {
        initialLimits[item.id] = item.limitAmount.toString();
      } else {
        initialLimits[item.id] = item.amount.toString();
      }
    });
    setLimits(initialLimits);
  }, [budgetItems]);

  const handleLimitChange = (itemId: string, value: string) => {
    setLimits(prev => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleSaveLimits = async () => {
    try {
      setSaving(true);
      setError(null);

      const limitsToSave = budgetItems.map(item => ({
        itemId: item.id,
        limitAmount: parseFloat(limits[item.id] || '0'),
      }));

      await onAssignLimits(limitsToSave);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas zapisywania limitów');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveLimits = async () => {
    try {
      setSaving(true);
      setError(null);

      const hasEmptyLimits = budgetItems.some(item => !limits[item.id] || parseFloat(limits[item.id]) <= 0);
      if (hasEmptyLimits) {
        setError('Wszystkie pozycje muszą mieć przypisane limity większe od zera');
        setSaving(false);
        return;
      }

      await handleSaveLimits();
      await onApproveLimits();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas zatwierdzania limitów');
    } finally {
      setSaving(false);
    }
  };

  const totalRequested = budgetItems.reduce((sum, item) => sum + item.amount, 0);
  const totalLimits = budgetItems.reduce((sum, item) => {
    const limit = parseFloat(limits[item.id] || '0');
    return sum + limit;
  }, 0);
  const difference = totalLimits - totalRequested;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Przydzielanie limitów budżetowych</h2>
            <p className="text-sm text-gray-600 mt-1">
              Jako jednostka najwyższego poziomu możesz przypisać limity do zatwierdzonych pozycji budżetowych
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveLimits}
              disabled={saving}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Zapisz limity
            </button>
            <button
              onClick={handleApproveLimits}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Zatwierdź i przekaż limity</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Suma wnioskowanych</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalRequested)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Suma przyznanych limitów</p>
            <p className="text-lg font-semibold text-blue-900">{formatCurrency(totalLimits)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Różnica</p>
            <p className={`text-lg font-semibold ${difference >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {difference >= 0 ? '+' : ''}{formatCurrency(difference)}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Jednostka
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Kategoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Opis
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status limitu
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Kwota wnioskowana
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Limit budżetu
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {budgetItems.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {item.unitId}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {item.category}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.description}
                </td>
                <td className="px-6 py-4">
                  <LimitStatusBadge status={item.limitStatus} />
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">
                  {formatCurrency(item.amount)}
                </td>
                <td className="px-6 py-4 text-right">
                  <input
                    type="number"
                    value={limits[item.id] || ''}
                    onChange={(e) => handleLimitChange(item.id, e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
