import React, { useEffect, useState } from 'react';
import { Clock, GitCompare, CheckCircle, XCircle, CornerUpLeft, Edit3, DollarSign } from 'lucide-react';
import { BudgetVersion } from '../AppContext';

interface VersionHistoryProps {
  unitId: string;
  getBudgetVersions: (unitId: string) => Promise<BudgetVersion[]>;
  onCompare: (version: BudgetVersion) => void;
}

export function VersionHistory({ unitId, getBudgetVersions, onCompare }: VersionHistoryProps) {
  const [versions, setVersions] = useState<BudgetVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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
      case 'limits_assigned':
        return 'Przyznano limity';
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
      case 'limits_assigned':
        return <DollarSign className="w-5 h-5 text-emerald-600" />;
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
      case 'limits_assigned':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCompareClick = async () => {
    setShowModal(true);
    if (versions.length === 0) {
      await loadVersions();
    }
  };

  const handleVersionSelect = (version: BudgetVersion) => {
    setShowModal(false);
    onCompare(version);
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Historia wersji</h3>
            <p className="text-sm text-gray-600 mt-1">
              Porównaj aktualny budżet z wcześniejszymi wersjami
            </p>
          </div>
          <button
            onClick={handleCompareClick}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GitCompare className="w-4 h-4" />
            <span>Porównaj wersje</span>
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Wybierz wersję do porównania</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Kliknij na wersję, aby porównać ją z aktualnym stanem budżetu
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Ładowanie wersji...</div>
              ) : versions.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Brak wersji historycznych. Wersje są tworzone automatycznie po przesłaniu budżetu do zatwierdzenia lub po edycji zatwierdzonych pozycji.
                </div>
              ) : (
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
                          Akcja
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {versions.map((version) => (
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
                              onClick={() => handleVersionSelect(version)}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                            >
                              <GitCompare className="w-4 h-4" />
                              <span>Wybierz</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
