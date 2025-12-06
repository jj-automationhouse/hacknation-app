import React, { useMemo } from 'react';
import { X, Plus, Minus, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { BudgetItem } from '../mockData';
import { BudgetVersion } from '../AppContext';
import { compareVersions, ItemComparison } from '../lib/versionComparison';

interface VersionComparisonProps {
  currentItems: BudgetItem[];
  selectedVersion: BudgetVersion;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
}

export function VersionComparison({
  currentItems,
  selectedVersion,
  onClose,
  formatCurrency,
}: VersionComparisonProps) {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const comparisons = useMemo(() => {
    return compareVersions(selectedVersion.itemsSnapshot, currentItems);
  }, [selectedVersion, currentItems]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
            <Plus className="w-3 h-3" />
            <span>Nowa pozycja</span>
          </span>
        );
      case 'removed':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
            <Minus className="w-3 h-3" />
            <span>Usunięta</span>
          </span>
        );
      case 'modified':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded bg-amber-100 text-amber-800">
            <Edit className="w-3 h-3" />
            <span>Zmodyfikowana</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getRowClassName = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-green-50';
      case 'removed':
        return 'bg-red-50';
      case 'modified':
        return 'bg-amber-50';
      default:
        return '';
    }
  };

  const newCount = comparisons.filter(c => c.status === 'new').length;
  const removedCount = comparisons.filter(c => c.status === 'removed').length;
  const modifiedCount = comparisons.filter(c => c.status === 'modified').length;

  const formatValue = (field: string, value: any) => {
    if (field === 'amount') {
      return formatCurrency(value);
    }
    return String(value || '');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Porównanie wersji</h2>
            <p className="text-sm text-gray-600 mt-1">
              Porównanie wersji z {formatDate(selectedVersion.createdAt)} z aktualnym stanem budżetu
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Plus className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Nowe pozycje</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{newCount}</div>
            </div>
            <div className="bg-white border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Edit className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-gray-700">Zmodyfikowane</span>
              </div>
              <div className="text-2xl font-bold text-amber-600">{modifiedCount}</div>
            </div>
            <div className="bg-white border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Minus className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-gray-700">Usunięte</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{removedCount}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {comparisons
              .filter(c => c.status !== 'unchanged')
              .map(comparison => {
                const item = comparison.newItem || comparison.oldItem!;
                const isExpanded = expandedItems.has(comparison.id);

                return (
                  <div
                    key={comparison.id}
                    className={`border border-gray-200 rounded-lg overflow-hidden ${getRowClassName(
                      comparison.status
                    )}`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusBadge(comparison.status)}
                            <span className="text-sm font-medium text-gray-900">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        {comparison.status === 'modified' && (
                          <button
                            onClick={() => toggleExpanded(comparison.id)}
                            className="ml-4 p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-600" />
                            )}
                          </button>
                        )}
                      </div>

                      {comparison.status === 'modified' && isExpanded && comparison.changes && (
                        <div className="mt-4 border-t border-gray-200 pt-4">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-xs text-gray-600 uppercase">
                                <th className="text-left pb-2 w-1/4">Pole</th>
                                <th className="text-left pb-2 w-3/8">Poprzednia wersja</th>
                                <th className="text-left pb-2 w-3/8">Aktualna wersja</th>
                              </tr>
                            </thead>
                            <tbody>
                              {comparison.changes.map(change => (
                                <tr key={change.field} className="border-t border-gray-100">
                                  <td className="py-2 font-medium text-gray-700">
                                    {change.fieldLabel}
                                  </td>
                                  <td className="py-2 text-red-700 bg-red-50">
                                    {formatValue(change.field, change.oldValue)}
                                  </td>
                                  <td className="py-2 text-green-700 bg-green-50">
                                    {formatValue(change.field, change.newValue)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {comparisons.filter(c => c.status !== 'unchanged').length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">Brak zmian</p>
              <p className="text-sm mt-1">Ta wersja jest identyczna z aktualnym stanem budżetu</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
