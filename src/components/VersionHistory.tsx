import React, { useEffect, useState } from 'react';
import { Clock, GitCompare, CheckCircle, XCircle, CornerUpLeft, Edit3 } from 'lucide-react';
import { BudgetVersion } from '../AppContext';

interface VersionHistoryProps {
  unitId: string;
  getBudgetVersions: (unitId: string) => Promise<BudgetVersion[]>;
  onCompare: (version: BudgetVersion) => void;
}

export function VersionHistory({ unitId, getBudgetVersions, onCompare }: VersionHistoryProps) {
  const [versions, setVersions] = useState<BudgetVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVersions();
  }, [unitId]);

  const loadVersions = async () => {
    setLoading(true);
    const data = await getBudgetVersions(unitId);
    setVersions(data);
    setLoading(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'submitted':
        return 'Przesłano do akceptacji';
      case 'approved':
        return 'Zatwierdzono';
      case 'returned':
        return 'Zwrócono do poprawy';
      case 'edited':
        return 'Edytowano';
      default:
        return action;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'submitted':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'returned':
        return <CornerUpLeft className="w-5 h-5 text-amber-600" />;
      case 'edited':
        return <Edit3 className="w-5 h-5 text-purple-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'returned':
        return 'bg-amber-100 text-amber-800';
      case 'edited':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historia wersji</h3>
        <p className="text-gray-500">Ładowanie...</p>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historia wersji</h3>
        <p className="text-gray-500">Brak wersji historycznych. Wersje są tworzone automatycznie po przesłaniu budżetu do zatwierdzenia.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Historia wersji</h3>
        <p className="text-sm text-gray-600 mt-1">
          Przeglądaj historię zmian i porównuj wersje budżetu
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Data i czas
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Użytkownik
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Akcja
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Liczba pozycji
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Porównaj
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {versions.map((version, index) => (
              <tr key={version.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatDate(version.createdAt)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {version.createdByName || 'Nieznany użytkownik'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {getActionIcon(version.action)}
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getActionBadgeColor(
                        version.action
                      )}`}
                    >
                      {getActionLabel(version.action)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-900">
                  {version.itemsSnapshot.length}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => onCompare(version)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    <GitCompare className="w-4 h-4" />
                    <span>Porównaj</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
