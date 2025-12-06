import React, { useState } from 'react';
import { Plus, Send, MessageSquare, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { useApp, BudgetVersion } from '../AppContext';
import { Breadcrumb } from './Breadcrumb';
import { DiscussionThread } from './DiscussionThread';
import { BudgetItemRow } from './BudgetItemRow';
import { VersionHistory } from './VersionHistory';
import { VersionComparison } from './VersionComparison';
import { getUnitHierarchy, getAllDescendantUnits, BudgetItem } from '../mockData';

export function BudgetEntryView() {
  const { currentUser, units, budgetItems, addBudgetItem, submitBudget, getBudgetVersions } = useApp();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedItemForDiscussion, setSelectedItemForDiscussion] = useState<BudgetItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedVersionForComparison, setSelectedVersionForComparison] = useState<BudgetVersion | null>(null);

  if (!currentUser) return null;

  const currentUnit = units.find(u => u.id === currentUser.unitId);
  const hierarchy = currentUnit ? getUnitHierarchy(currentUnit.id, units) : [];
  const descendantUnits = currentUnit ? getAllDescendantUnits(currentUnit.id, units) : [];
  const hasSubordinates = descendantUnits.length > 0;

  const userBudgetItems = budgetItems.filter(item => item.unitId === currentUser.unitId);
  const hasDraftItems = userBudgetItems.some(item => item.status === 'draft');
  const hasParent = currentUnit?.parentId !== null;

  const handleAddNew = () => {
    setIsAddingNew(true);
  };

  const handleSaveNew = (data: Omit<BudgetItem, 'id' | 'unitId' | 'status' | 'clarificationStatus'>) => {
    addBudgetItem({
      unitId: currentUser.unitId,
      ...data,
      status: 'draft',
      clarificationStatus: 'none',
    });
    setIsAddingNew(false);
  };

  const handleCancelNew = () => {
    setIsAddingNew(false);
  };

  const handleSubmitForApproval = () => {
    if (confirm('Czy na pewno chcesz przesłać budżet do zatwierdzenia?')) {
      submitBudget(currentUser.unitId);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
    }).format(amount);
  };

  const totalAmount = userBudgetItems.reduce((sum, item) => sum + item.amount, 0);
  const draftAmount = userBudgetItems
    .filter(item => item.status === 'draft')
    .reduce((sum, item) => sum + item.amount, 0);

  const itemsNeedingClarification = userBudgetItems.filter(
    item => item.clarificationStatus === 'requested' || item.clarificationStatus === 'responded'
  );
  const itemsWithUnreadComments = userBudgetItems.filter(item => item.hasUnreadComments);

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb hierarchy={hierarchy} />
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Zarządzanie budżetem</h1>
        <p className="text-gray-600 mt-2">
          Twórz i zarządzaj wnioskami budżetowymi dla {currentUnit?.name}
        </p>
      </div>

      {showSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-emerald-900">Budżet przesłany pomyślnie!</p>
            <p className="text-sm text-emerald-700 mt-1">
              Pozycje budżetowe zostały przekazane do jednostki nadrzędnej.
            </p>
            <p className="text-sm text-emerald-700 mt-2 font-medium">
              Aby zobaczyć przesłane pozycje: przełącz się na użytkownika z jednostki nadrzędnej i otwórz zakładkę "Zatwierdzanie".
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600">Łączna wartość</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalAmount)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600">Do zatwierdzenia</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(draftAmount)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600">Liczba pozycji</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{userBudgetItems.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600">Wymaga wyjaśnienia</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {itemsNeedingClarification.length}
            {itemsWithUnreadComments.length > 0 && (
              <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                {itemsWithUnreadComments.length} nowe
              </span>
            )}
          </div>
        </div>
      </div>

      {itemsNeedingClarification.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-900">
                Elementy wymagające wyjaśnienia ({itemsNeedingClarification.length})
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Jednostka nadrzędna poprosiła o wyjaśnienie niektórych pozycji budżetowych. Odpowiedz na pytania w sekcji dyskusji.
              </p>
              <div className="mt-3 space-y-2">
                {itemsNeedingClarification.map(item => (
                  <div
                    key={item.id}
                    className="bg-white rounded-md p-3 border border-amber-200 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">{item.category}</p>
                        <ClarificationBadge
                          status={item.clarificationStatus}
                          hasUnreadComments={item.hasUnreadComments}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <button
                      onClick={() => setSelectedItemForDiscussion(item)}
                      className="ml-4 px-3 py-1 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 transition-colors flex items-center space-x-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Odpowiedz</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {hasSubordinates && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-900">Jednostka nadrzędna</p>
            <p className="text-sm text-blue-700 mt-1">
              Ta jednostka ma {descendantUnits.length} jednostek podległych. Nie możesz dodawać własnych pozycji budżetowych.
              Użyj zakładki "Zatwierdzanie" aby zarządzać budżetami z jednostek podległych.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Pozycje budżetowe</h2>
          {!hasSubordinates && (
            <div className="flex items-center space-x-3">
              {hasDraftItems && hasParent && (
                <button
                  onClick={handleSubmitForApproval}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Prześlij do zatwierdzenia</span>
                </button>
              )}
              <button
                onClick={handleAddNew}
                disabled={isAddingNew}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>Dodaj pozycję</span>
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Część budżetowa
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Dział
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rozdział
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Kategoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Opis
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rok
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Kwota
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Wyjaśnienia
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Dyskusja
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Komentarz
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isAddingNew && (
                <BudgetItemRow
                  isEditing={true}
                  isNew={true}
                  onSave={handleSaveNew}
                  onCancel={handleCancelNew}
                  formatCurrency={formatCurrency}
                />
              )}
              {userBudgetItems.length === 0 && !isAddingNew ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-lg font-medium">Brak pozycji budżetowych</p>
                    <p className="text-sm mt-1">Kliknij "Dodaj pozycję" aby rozpocząć</p>
                  </td>
                </tr>
              ) : (
                userBudgetItems.map(item => (
                  <BudgetItemRow
                    key={item.id}
                    item={item}
                    isEditing={false}
                    onSave={() => {}}
                    onCancel={() => {}}
                    onDiscussion={setSelectedItemForDiscussion}
                    formatCurrency={formatCurrency}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {currentUser && (
        <VersionHistory
          unitId={currentUser.unitId}
          getBudgetVersions={getBudgetVersions}
          onCompare={setSelectedVersionForComparison}
        />
      )}

      {selectedItemForDiscussion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Dyskusja o pozycji budżetowej</h3>
              <button
                onClick={() => setSelectedItemForDiscussion(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <DiscussionThread
                budgetItem={selectedItemForDiscussion}
                onClose={() => setSelectedItemForDiscussion(null)}
                showResolveButton={false}
              />
            </div>
          </div>
        </div>
      )}

      {selectedVersionForComparison && (
        <VersionComparison
          currentItems={userBudgetItems}
          selectedVersion={selectedVersionForComparison}
          onClose={() => setSelectedVersionForComparison(null)}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}
