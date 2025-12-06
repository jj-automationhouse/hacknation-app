import React, { useState, useEffect } from 'react';
import { Plus, Send, MessageSquare, AlertCircle, CheckCircle, HelpCircle, X } from 'lucide-react';
import { useApp, BudgetVersion } from '../AppContext';
import { Breadcrumb } from './Breadcrumb';
import { DiscussionThread } from './DiscussionThread';
import { BudgetItemRow } from './BudgetItemRow';
import { VersionHistory } from './VersionHistory';
import { VersionComparison } from './VersionComparison';
import { ClarificationBadge } from './ClarificationBadge';
import { LimitAssignmentView } from './LimitAssignmentView';
import { getUnitHierarchy, getAllDescendantUnits, BudgetItem } from '../mockData';
import { supabase } from '../lib/supabase';

export function BudgetEntryView() {
  const { currentUser, units, budgetItems, addBudgetItem, updateBudgetItem, submitBudget, getBudgetVersions, createBudgetVersion } = useApp();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedItemForDiscussion, setSelectedItemForDiscussion] = useState<BudgetItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [selectedVersionForComparison, setSelectedVersionForComparison] = useState<BudgetVersion | null>(null);
  const [hasReceivedLimit, setHasReceivedLimit] = useState(false);
  const [receivedLimitAmount, setReceivedLimitAmount] = useState<number | null>(null);
  const [totalRequestedAmount, setTotalRequestedAmount] = useState<number | null>(null);
  const [isDistributingLimit, setIsDistributingLimit] = useState(false);
  const [itemLimitAllocations, setItemLimitAllocations] = useState<Record<string, number>>({});

  if (!currentUser) return null;

  const currentUnit = units.find(u => u.id === currentUser.unitId);
  const hierarchy = currentUnit ? getUnitHierarchy(currentUnit.id, units) : [];
  const descendantUnits = currentUnit ? getAllDescendantUnits(currentUnit.id, units) : [];
  const hasSubordinates = descendantUnits.length > 0;

  const userBudgetItems = budgetItems.filter(item => item.unitId === currentUser.unitId);
  const hasDraftItems = userBudgetItems.some(item => item.status === 'draft');
  const hasParent = currentUnit?.parentId !== null;

  const isTopLevel = !hasParent;
  const allDescendantItems = budgetItems.filter(item =>
    item.unitId === currentUser.unitId ||
    descendantUnits.some(u => u.id === item.unitId)
  );
  const allApprovedItems = allDescendantItems.filter(item => item.status === 'approved');

  const submittedToCurrentUnit = budgetItems.filter(
    item => item.submittedTo === currentUser.unitId && (item.status === 'pending' || item.status === 'approved')
  );

  const directChildren = units.filter(u => u.parentId === currentUser.unitId);
  const directChildrenIds = directChildren.map(u => u.id);

  const budgetsFromDirectChildren = budgetItems.filter(
    item => directChildrenIds.includes(item.unitId) && item.submittedTo === currentUser.unitId
  );

  const allChildBudgetsApproved = budgetsFromDirectChildren.length > 0 &&
    budgetsFromDirectChildren.every(item => item.status === 'approved');

  useEffect(() => {
    const checkReceivedLimit = async () => {
      const { data, error } = await supabase
        .from('unit_limits')
        .select('status, limit_assigned, total_requested')
        .eq('unit_id', currentUser.unitId)
        .eq('fiscal_year', new Date().getFullYear())
        .maybeSingle();

      if (!error && data && data.status === 'assigned') {
        setHasReceivedLimit(true);
        setReceivedLimitAmount(data.limit_assigned || null);
        setTotalRequestedAmount(data.total_requested || null);
      } else {
        setHasReceivedLimit(false);
        setReceivedLimitAmount(null);
        setTotalRequestedAmount(null);
      }
    };

    checkReceivedLimit();
  }, [currentUser.unitId, budgetItems]);

  const shouldShowLimitAssignment = hasSubordinates && (isTopLevel ? allChildBudgetsApproved : (hasReceivedLimit && allChildBudgetsApproved));

  const handleAddNew = () => {
    setIsAddingNew(true);
  };

  const handleSaveNew = (data: Omit<BudgetItem, 'id' | 'unitId' | 'status' | 'clarificationStatus' | 'limitStatus'>) => {
    addBudgetItem({
      unitId: currentUser.unitId,
      ...data,
      status: 'draft',
      clarificationStatus: 'none',
      limitStatus: 'not_assigned',
    });
    setIsAddingNew(false);
  };

  const handleCancelNew = () => {
    setIsAddingNew(false);
  };

  const handleEditItem = (item: BudgetItem) => {
    setEditingItemId(item.id);
  };

  const handleSaveEdit = async (data: Omit<BudgetItem, 'id' | 'unitId' | 'status' | 'clarificationStatus' | 'limitStatus' | 'limitAmount' | 'hasUnreadComments' | 'comment' | 'submittedTo'>) => {
    if (editingItemId) {
      const editedItem = budgetItems.find(item => item.id === editingItemId);

      if (editedItem && editedItem.status !== 'draft') {
        await createBudgetVersion(currentUser.unitId, 'edited');
      }

      await updateBudgetItem(editingItemId, {
        budgetSection: data.budgetSection,
        budgetDivision: data.budgetDivision,
        budgetChapter: data.budgetChapter,
        category: data.category,
        description: data.description,
        amount: data.amount,
        year: data.year,
      });
      setEditingItemId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  const handleSubmitForApproval = () => {
    if (confirm('Czy na pewno chcesz przesłać budżet do zatwierdzenia?')) {
      submitBudget(currentUser.unitId);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  const handleStartDistributingLimit = () => {
    const initialAllocations: Record<string, number> = {};
    userBudgetItems.forEach(item => {
      initialAllocations[item.id] = 0;
    });
    setItemLimitAllocations(initialAllocations);
    setIsDistributingLimit(true);
  };

  const handleSaveDistribution = async () => {
    const totalAllocated = Object.values(itemLimitAllocations).reduce((sum, val) => sum + val, 0);

    if (receivedLimitAmount !== null && totalAllocated > receivedLimitAmount) {
      alert(`Łączna kwota przydzielona (${formatCurrency(totalAllocated)}) przekracza dostępny limit (${formatCurrency(receivedLimitAmount)})`);
      return;
    }

    if (totalAllocated === 0) {
      alert('Musisz przydzielić limity przynajmniej jednej pozycji');
      return;
    }

    for (const [itemId, limitAmount] of Object.entries(itemLimitAllocations)) {
      if (limitAmount > 0) {
        await updateBudgetItem(itemId, {
          limitStatus: 'limits_assigned',
          limitAmount: limitAmount,
        });
      }
    }

    await supabase
      .from('unit_limits')
      .update({ status: 'distributed' })
      .eq('unit_id', currentUser.unitId)
      .eq('fiscal_year', new Date().getFullYear());

    setIsDistributingLimit(false);
    setItemLimitAllocations({});
    alert('Limity zostały pomyślnie rozdzielone');
  };

  const handleCancelDistribution = () => {
    setIsDistributingLimit(false);
    setItemLimitAllocations({});
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

      {hasReceivedLimit && receivedLimitAmount !== null && (
        <>
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-emerald-700 uppercase tracking-wide">Limit przyznany</div>
                <div className="text-4xl font-bold text-emerald-900 mt-2">{formatCurrency(receivedLimitAmount)}</div>
                {totalRequestedAmount !== null && (
                  <div className="text-sm text-emerald-700 mt-2">
                    Wnioskowano: {formatCurrency(totalRequestedAmount)}
                  </div>
                )}
              </div>
              <div className="bg-white rounded-full p-4 shadow-sm">
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-emerald-200">
              <p className="text-sm text-emerald-800">
                {hasSubordinates ? (
                  <>
                    Limit otrzymany od jednostki nadrzędnej. Możesz go teraz przydzielić jednostkom podległym w sekcji "Przydzielanie limitów" poniżej.
                  </>
                ) : (
                  <>
                    Limit otrzymany od jednostki nadrzędnej. Twórz pozycje budżetowe w ramach tego limitu.
                  </>
                )}
              </p>
            </div>
          </div>

          {!hasSubordinates && totalAmount > receivedLimitAmount && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Przekroczono przyznany limit!</p>
                <p className="text-sm text-red-700 mt-1">
                  Łączna wartość pozycji budżetowych ({formatCurrency(totalAmount)}) przekracza
                  przyznany limit ({formatCurrency(receivedLimitAmount)}) o {formatCurrency(totalAmount - receivedLimitAmount)}.
                </p>
                <p className="text-sm text-red-700 mt-2">
                  Zmniejsz kwoty w pozycjach budżetowych, aby zmieścić się w limicie przed przesłaniem do zatwierdzenia.
                </p>
              </div>
            </div>
          )}
        </>
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

      {hasReceivedLimit && receivedLimitAmount !== null && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-emerald-900">
                  Otrzymano limit od jednostki nadrzędnej
                </p>
                <p className="text-sm text-emerald-700 mt-1">
                  Dostępny limit: <span className="font-bold">{formatCurrency(receivedLimitAmount)}</span>
                </p>
                <p className="text-xs text-emerald-600 mt-2">
                  Możesz teraz rozdzielić limit między pozycje budżetowe i przekazać je do jednostek podrzędnych.
                </p>
              </div>
            </div>
            {!isDistributingLimit && userBudgetItems.length > 0 && (
              <button
                onClick={handleStartDistributingLimit}
                className="px-4 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Rozdziel limit</span>
              </button>
            )}
          </div>
        </div>
      )}

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

      {shouldShowLimitAssignment && (
        <LimitAssignmentView
          currentUnitId={currentUser.unitId}
          formatCurrency={formatCurrency}
        />
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Pozycje budżetowe</h2>
          {!hasSubordinates && (
            <div className="flex items-center space-x-3">
              {isDistributingLimit ? (
                <>
                  <div className="text-sm text-gray-600">
                    Łączna kwota przydzielona: <span className="font-bold text-emerald-600">
                      {formatCurrency(Object.values(itemLimitAllocations).reduce((sum, val) => sum + val, 0))}
                    </span> / {formatCurrency(receivedLimitAmount || 0)}
                  </div>
                  <button
                    onClick={handleSaveDistribution}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Zapisz rozdział limitów</span>
                  </button>
                  <button
                    onClick={handleCancelDistribution}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Anuluj</span>
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
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
                {isDistributingLimit ? (
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Przydziel limit
                  </th>
                ) : (
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Limit przyznany
                  </th>
                )}
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
                  <td colSpan={12} className="px-6 py-12 text-center text-gray-500">
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
                    isEditing={editingItemId === item.id}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                    onEdit={handleEditItem}
                    onDiscussion={setSelectedItemForDiscussion}
                    formatCurrency={formatCurrency}
                    isDistributingLimit={isDistributingLimit}
                    limitAllocation={itemLimitAllocations[item.id] || 0}
                    onLimitChange={(itemId, value) => {
                      setItemLimitAllocations(prev => ({ ...prev, [itemId]: value }));
                    }}
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
