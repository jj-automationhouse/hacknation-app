import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface OrganizationalUnit {
  id: string;
  name: string;
  type: string;
  parent_id: string | null;
}

interface UnitLimitData {
  unitId: string;
  unitName: string;
  totalRequested: number;
  limitAssigned: number | null;
  status: 'pending' | 'assigned' | 'distributed';
  existingLimitId?: string;
}

interface LimitAssignmentViewProps {
  currentUnitId: string;
  formatCurrency: (amount: number) => string;
}

export function LimitAssignmentView({
  currentUnitId,
  formatCurrency,
}: LimitAssignmentViewProps) {
  const [childUnits, setChildUnits] = useState<UnitLimitData[]>([]);
  const [limits, setLimits] = useState<{ [unitId: string]: string }>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildUnitsData();
  }, [currentUnitId]);

  const loadChildUnitsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: units, error: unitsError } = await supabase
        .from('organizational_units')
        .select('id, name, type, parent_id')
        .eq('parent_id', currentUnitId);

      if (unitsError) throw unitsError;
      if (!units || units.length === 0) {
        setChildUnits([]);
        setLoading(false);
        return;
      }

      const unitIds = units.map(u => u.id);

      const { data: budgetItems, error: budgetError } = await supabase
        .from('budget_items')
        .select('unit_id, amount')
        .in('unit_id', unitIds)
        .eq('status', 'approved');

      if (budgetError) throw budgetError;

      const totalsByUnit: { [unitId: string]: number } = {};
      (budgetItems || []).forEach(item => {
        totalsByUnit[item.unit_id] = (totalsByUnit[item.unit_id] || 0) + parseFloat(item.amount.toString());
      });

      const { data: existingLimits, error: limitsError } = await supabase
        .from('unit_limits')
        .select('*')
        .in('unit_id', unitIds)
        .eq('assigned_by_unit_id', currentUnitId)
        .eq('fiscal_year', new Date().getFullYear());

      if (limitsError) throw limitsError;

      const limitsMap: { [unitId: string]: any } = {};
      (existingLimits || []).forEach(limit => {
        limitsMap[limit.unit_id] = limit;
      });

      const unitLimitData: UnitLimitData[] = units.map(unit => {
        const totalRequested = totalsByUnit[unit.id] || 0;
        const existingLimit = limitsMap[unit.id];

        return {
          unitId: unit.id,
          unitName: unit.name,
          totalRequested,
          limitAssigned: existingLimit?.limit_assigned || null,
          status: existingLimit?.status || 'pending',
          existingLimitId: existingLimit?.id,
        };
      }).filter(u => u.totalRequested > 0);

      setChildUnits(unitLimitData);

      const initialLimits: { [unitId: string]: string } = {};
      unitLimitData.forEach(unit => {
        if (unit.limitAssigned !== null) {
          initialLimits[unit.unitId] = unit.limitAssigned.toString();
        } else {
          initialLimits[unit.unitId] = unit.totalRequested.toString();
        }
      });
      setLimits(initialLimits);

    } catch (err) {
      console.error('Error loading child units data:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas ładowania danych');
    } finally {
      setLoading(false);
    }
  };

  const handleLimitChange = (unitId: string, value: string) => {
    setLimits(prev => ({
      ...prev,
      [unitId]: value,
    }));
  };

  const handleSaveLimits = async () => {
    try {
      setSaving(true);
      setError(null);

      const limitsToSave = childUnits.map(unit => {
        const limitAmount = parseFloat(limits[unit.unitId] || '0');

        return {
          id: unit.existingLimitId,
          unit_id: unit.unitId,
          assigned_by_unit_id: currentUnitId,
          total_requested: unit.totalRequested,
          limit_assigned: limitAmount,
          status: 'pending' as const,
          fiscal_year: new Date().getFullYear(),
        };
      });

      for (const limit of limitsToSave) {
        if (limit.id) {
          const { error: updateError } = await supabase
            .from('unit_limits')
            .update({
              limit_assigned: limit.limit_assigned,
              status: limit.status,
            })
            .eq('id', limit.id);

          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from('unit_limits')
            .insert({
              unit_id: limit.unit_id,
              assigned_by_unit_id: limit.assigned_by_unit_id,
              total_requested: limit.total_requested,
              limit_assigned: limit.limit_assigned,
              status: limit.status,
              fiscal_year: limit.fiscal_year,
            });

          if (insertError) throw insertError;
        }
      }

      await loadChildUnitsData();
    } catch (err) {
      console.error('Error saving limits:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas zapisywania limitów');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveLimits = async () => {
    try {
      setSaving(true);
      setError(null);

      const hasEmptyLimits = childUnits.some(unit => !limits[unit.unitId] || parseFloat(limits[unit.unitId]) <= 0);
      if (hasEmptyLimits) {
        setError('Wszystkie jednostki muszą mieć przypisane limity większe od zera');
        setSaving(false);
        return;
      }

      const limitsToApprove = childUnits.map(unit => {
        const limitAmount = parseFloat(limits[unit.unitId] || '0');

        return {
          id: unit.existingLimitId,
          unit_id: unit.unitId,
          assigned_by_unit_id: currentUnitId,
          total_requested: unit.totalRequested,
          limit_assigned: limitAmount,
          status: 'assigned' as const,
          fiscal_year: new Date().getFullYear(),
        };
      });

      for (const limit of limitsToApprove) {
        if (limit.id) {
          const { error: updateError } = await supabase
            .from('unit_limits')
            .update({
              limit_assigned: limit.limit_assigned,
              status: limit.status,
            })
            .eq('id', limit.id);

          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from('unit_limits')
            .insert({
              unit_id: limit.unit_id,
              assigned_by_unit_id: limit.assigned_by_unit_id,
              total_requested: limit.total_requested,
              limit_assigned: limit.limit_assigned,
              status: limit.status,
              fiscal_year: limit.fiscal_year,
            });

          if (insertError) throw insertError;
        }
      }

      await loadChildUnitsData();
    } catch (err) {
      console.error('Error approving limits:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas zatwierdzania limitów');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <p className="text-gray-600">Ładowanie danych...</p>
      </div>
    );
  }

  if (childUnits.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-3 text-gray-600">
          <Building2 className="w-5 h-5" />
          <p>Brak jednostek podległych z zatwierdzonymi wnioskami budżetowymi.</p>
        </div>
      </div>
    );
  }

  const totalRequested = childUnits.reduce((sum, unit) => sum + unit.totalRequested, 0);
  const totalLimits = childUnits.reduce((sum, unit) => {
    const limit = parseFloat(limits[unit.unitId] || '0');
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
              Przydziel limity budżetowe dla jednostek podległych. Każda jednostka otrzyma łączny limit do podziału.
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
                Jednostka organizacyjna
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Suma wnioskowana
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Przydzielony limit
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {childUnits.map(unit => (
              <tr key={unit.unitId} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{unit.unitName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    unit.status === 'assigned'
                      ? 'bg-emerald-100 text-emerald-800'
                      : unit.status === 'distributed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {unit.status === 'assigned' ? 'Przydzielony' : unit.status === 'distributed' ? 'Rozdysponowany' : 'Oczekujący'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">
                  {formatCurrency(unit.totalRequested)}
                </td>
                <td className="px-6 py-4 text-right">
                  <input
                    type="number"
                    value={limits[unit.unitId] || ''}
                    onChange={(e) => handleLimitChange(unit.unitId, e.target.value)}
                    className="w-40 px-3 py-2 border border-gray-300 rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
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
