import React, { useState, useEffect } from 'react';
import { DollarSign, ChevronDown, ChevronRight, Save, X } from 'lucide-react';
import { useApp } from '../AppContext';
import { supabase } from '../lib/supabase';

interface UnitLimit {
  id: string;
  unitId: string;
  unitName?: string;
  assignedByUnitId: string;
  totalRequested: number;
  limitAssigned: number | null;
  status: 'pending' | 'assigned' | 'distributed';
  fiscalYear: number;
}

interface ChildUnit {
  id: string;
  name: string;
  totalRequested: number;
}

export function LimitsView() {
  const { currentUser, units, budgetItems } = useApp();
  const [receivedLimits, setReceivedLimits] = useState<UnitLimit[]>([]);
  const [childUnits, setChildUnits] = useState<ChildUnit[]>([]);
  const [isDistributing, setIsDistributing] = useState(false);
  const [selectedLimit, setSelectedLimit] = useState<UnitLimit | null>(null);
  const [distributions, setDistributions] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    if (currentUser) {
      loadReceivedLimits();
      loadChildUnits();
    }
  }, [currentUser]);

  const loadReceivedLimits = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('unit_limits')
        .select('*')
        .eq('unit_id', currentUser.unitId)
        .order('fiscal_year', { ascending: false });

      if (error) {
        console.error('Error loading received limits:', error);
        return;
      }

      if (data) {
        const limitsWithNames = data.map(l => {
          const assignedByUnit = units.find(u => u.id === l.assigned_by_unit_id);
          return {
            id: l.id,
            unitId: l.unit_id,
            unitName: assignedByUnit?.name,
            assignedByUnitId: l.assigned_by_unit_id,
            totalRequested: Number(l.total_requested),
            limitAssigned: l.limit_assigned ? Number(l.limit_assigned) : null,
            status: l.status as 'pending' | 'assigned' | 'distributed',
            fiscalYear: l.fiscal_year,
          };
        });
        setReceivedLimits(limitsWithNames);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadChildUnits = async () => {
    if (!currentUser) return;

    const children = units.filter(u => u.parentId === currentUser.unitId);

    const childrenWithRequests = await Promise.all(
      children.map(async (child) => {
        const childBudgetItems = budgetItems.filter(
          item => item.unitId === child.id && item.status === 'approved'
        );
        const totalRequested = childBudgetItems.reduce((sum, item) => sum + item.amount, 0);

        return {
          id: child.id,
          name: child.name,
          totalRequested,
        };
      })
    );

    setChildUnits(childrenWithRequests);
  };

  const handleDistributeLimit = (limit: UnitLimit) => {
    setSelectedLimit(limit);
    setIsDistributing(true);
    const initialDistributions: Record<string, number> = {};
    childUnits.forEach(child => {
      initialDistributions[child.id] = 0;
    });
    setDistributions(initialDistributions);
  };

  const handleDistributionChange = (childUnitId: string, value: number) => {
    setDistributions(prev => ({
      ...prev,
      [childUnitId]: value,
    }));
  };

  const handleSaveDistribution = async () => {
    if (!selectedLimit || !currentUser) return;

    const totalDistributed = Object.values(distributions).reduce((sum, val) => sum + val, 0);
    if (selectedLimit.limitAssigned && totalDistributed > selectedLimit.limitAssigned) {
      alert('Suma rozdzielonych limitów przekracza dostępny limit!');
      return;
    }

    try {
      const limitRecords = Object.entries(distributions)
        .filter(([_, amount]) => amount > 0)
        .map(([childUnitId, amount]) => {
          const child = childUnits.find(c => c.id === childUnitId);
          return {
            unit_id: childUnitId,
            assigned_by_unit_id: currentUser.unitId,
            total_requested: child?.totalRequested || 0,
            limit_assigned: amount,
            status: 'assigned',
            fiscal_year: selectedLimit.fiscalYear,
          };
        });

      if (limitRecords.length === 0) {
        alert('Nie rozdzielono żadnych limitów');
        return;
      }

      const { error } = await supabase
        .from('unit_limits')
        .upsert(limitRecords, {
          onConflict: 'unit_id,assigned_by_unit_id,fiscal_year'
        });

      if (error) {
        console.error('Error saving distributions:', error);
        alert('Błąd podczas zapisywania rozdziału limitów');
        return;
      }

      await supabase
        .from('unit_limits')
        .update({ status: 'distributed' })
        .eq('id', selectedLimit.id);

      setIsDistributing(false);
      setSelectedLimit(null);
      setDistributions({});
      loadReceivedLimits();
      alert('Limity zostały pomyślnie rozdzielone!');
    } catch (error) {
      console.error('Error saving distribution:', error);
      alert('Błąd podczas zapisywania');
    }
  };

  const handleCancelDistribution = () => {
    setIsDistributing(false);
    setSelectedLimit(null);
    setDistributions({});
  };

  const totalDistributed = Object.values(distributions).reduce((sum, val) => sum + val, 0);
  const remainingLimit = selectedLimit?.limitAssigned ? selectedLimit.limitAssigned - totalDistributed : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie limitów...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Zarządzanie limitami</h2>
          <p className="text-gray-600 mt-1">Limity otrzymane i rozdzielanie dla jednostek podległych</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Otrzymane limity
          </h3>
        </div>

        <div className="p-6">
          {receivedLimits.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Brak przyznanych limitów</p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedLimits.map(limit => (
                <div
                  key={limit.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Rok budżetowy: {limit.fiscalYear}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          limit.status === 'distributed'
                            ? 'bg-green-100 text-green-800'
                            : limit.status === 'assigned'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {limit.status === 'distributed' && 'Rozdzielony'}
                          {limit.status === 'assigned' && 'Przyznany'}
                          {limit.status === 'pending' && 'Oczekujący'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Wnioskowana kwota</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(limit.totalRequested)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Przyznany limit</p>
                          <p className="text-lg font-semibold text-green-600">
                            {limit.limitAssigned ? formatCurrency(limit.limitAssigned) : '—'}
                          </p>
                        </div>
                      </div>
                      {limit.unitName && (
                        <p className="text-xs text-gray-500 mt-2">
                          Przyznany przez: {limit.unitName}
                        </p>
                      )}
                    </div>
                    {limit.limitAssigned && limit.status !== 'distributed' && childUnits.length > 0 && (
                      <button
                        onClick={() => handleDistributeLimit(limit)}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Rozdziel limit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isDistributing && selectedLimit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                Rozdziel limit - rok {selectedLimit.fiscalYear}
              </h3>
              <button
                onClick={handleCancelDistribution}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Dostępny limit</p>
                    <p className="text-xl font-bold text-blue-600">
                      {selectedLimit.limitAssigned ? formatCurrency(selectedLimit.limitAssigned) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rozdzielono</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(totalDistributed)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pozostało</p>
                    <p className={`text-xl font-bold ${
                      remainingLimit < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(remainingLimit)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Jednostki podległe</h4>
                {childUnits.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Brak jednostek podległych</p>
                ) : (
                  <div className="space-y-3">
                    {childUnits.map(child => (
                      <div
                        key={child.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-gray-900">{child.name}</p>
                            <p className="text-sm text-gray-500">
                              Wnioskowana kwota: {formatCurrency(child.totalRequested)}
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Przyznaj limit
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={distributions[child.id] || 0}
                            onChange={(e) => handleDistributionChange(child.id, parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0 bg-white">
              <button
                onClick={handleCancelDistribution}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleSaveDistribution}
                disabled={totalDistributed === 0 || remainingLimit < 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Zapisz rozdział</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
