import React, { useState } from 'react';
import { Check, X, MessageSquare, Send, AlertCircle, ArrowUp, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';
import { useApp } from '../AppContext';
import { StatusBadge } from './StatusBadge';
import { Breadcrumb } from './Breadcrumb';
import { ClarificationBadge } from './ClarificationBadge';
import { DiscussionThread } from './DiscussionThread';
import { getUnitHierarchy, getAllDescendantUnits, BudgetItem } from '../mockData';

interface BudgetGroup {
  unitId: string;
  unitName: string;
  year: number;
  items: BudgetItem[];
  totalAmount: number;
  itemCount: number;
}

export function ApprovalView() {
  const {
    currentUser,
    units,
    budgetItems,
    approveBudgetGroup,
    rejectBudgetGroup,
    returnBudgetGroupToChild,
    forwardBudgetToParent,
    requestClarification,
  } = useApp();

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [commentModalGroup, setCommentModalGroup] = useState<BudgetGroup | null>(null);
  const [comment, setComment] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'return' | 'clarify'>('approve');
  const [selectedItemForDiscussion, setSelectedItemForDiscussion] = useState<BudgetItem | null>(null);

  if (!currentUser) return null;

  const currentUnit = units.find(u => u.id === currentUser.unitId);
  const hierarchy = currentUnit ? getUnitHierarchy(currentUnit.id, units) : [];
  const hasParent = currentUnit?.parentId !== null;

  const descendantUnits = currentUnit ? getAllDescendantUnits(currentUnit.id, units) : [];
  const descendantUnitIds = descendantUnits.map(u => u.id);

  const subordinateBudgetItems = budgetItems.filter(
    item =>
      descendantUnitIds.includes(item.unitId) &&
      item.submittedTo === currentUser.unitId &&
      (item.status === 'pending' || item.status === 'approved')
  );

  const groupBudgetItems = (items: BudgetItem[], status: 'pending' | 'approved'): BudgetGroup[] => {
    const filtered = items.filter(item => item.status === status);
    const grouped = new Map<string, BudgetGroup>();

    filtered.forEach(item => {
      const key = `${item.unitId}-${item.year}`;
      const unit = units.find(u => u.id === item.unitId);

      if (!grouped.has(key)) {
        grouped.set(key, {
          unitId: item.unitId,
          unitName: unit?.name || 'Unknown',
          year: item.year,
          items: [],
          totalAmount: 0,
          itemCount: 0,
        });
      }

      const group = grouped.get(key)!;
      group.items.push(item);
      group.totalAmount += item.amount;
      group.itemCount += 1;
    });

    return Array.from(grouped.values()).sort((a, b) => {
      if (a.unitName !== b.unitName) return a.unitName.localeCompare(b.unitName);
      return b.year - a.year;
    });
  };

  const pendingGroups = groupBudgetItems(subordinateBudgetItems, 'pending');
  const approvedGroups = groupBudgetItems(subordinateBudgetItems, 'approved');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
    }).format(amount);
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const getGroupKey = (group: BudgetGroup) => `${group.unitId}-${group.year}`;

  const hasUnresolvedDiscussions = (group: BudgetGroup) => {
    return group.items.some(
      item => item.clarificationStatus === 'requested' || item.clarificationStatus === 'responded'
    );
  };

  const getUnresolvedItems = (group: BudgetGroup) => {
    return group.items.filter(
      item => item.clarificationStatus === 'requested' || item.clarificationStatus === 'responded'
    );
  };

  const handleApprove = (group: BudgetGroup) => {
    const unresolvedItems = getUnresolvedItems(group);

    if (unresolvedItems.length > 0) {
      const itemsList = unresolvedItems.map(item => `- ${item.category}: ${item.description}`).join('\n');
      alert(
        `Nie można zatwierdzić budżetu.\n\nNastępujące pozycje mają nierozwiązane dyskusje:\n\n${itemsList}\n\nNależy najpierw rozwiązać wszystkie dyskusje.`
      );
      return;
    }

    setCommentModalGroup(group);
    setActionType('approve');
    setComment('');
  };

  const handleReject = (group: BudgetGroup) => {
    setCommentModalGroup(group);
    setActionType('reject');
    setComment('');
  };

  const handleReturn = (group: BudgetGroup) => {
    setCommentModalGroup(group);
    setActionType('return');
    setComment('');
  };

  const handleConfirmAction = () => {
    if (!commentModalGroup) return;

    if (actionType === 'approve') {
      approveBudgetGroup(commentModalGroup.unitId, commentModalGroup.year, comment || undefined);
    } else if (actionType === 'reject') {
      if (!comment.trim()) {
        alert('Komentarz jest wymagany przy odrzucaniu pozycji');
        return;
      }
      rejectBudgetGroup(commentModalGroup.unitId, commentModalGroup.year, comment);
    } else if (actionType === 'return') {
      if (!comment.trim()) {
        alert('Komentarz jest wymagany przy zwracaniu pozycji');
        return;
      }
      returnBudgetGroupToChild(commentModalGroup.unitId, commentModalGroup.year, comment);
    }

    setCommentModalGroup(null);
    setComment('');
  };

  const handleForwardToParent = () => {
    if (approvedGroups.length === 0) {
      alert('Brak zatwierdzonych pozycji do przekazania');
      return;
    }

    if (confirm('Czy na pewno chcesz przekazać zatwierdzone budżety do jednostki nadrzędnej?')) {
      forwardBudgetToParent(currentUser.unitId);
    }
  };

  const totalPending = pendingGroups.reduce((sum, group) => sum + group.totalAmount, 0);
  const totalApproved = approvedGroups.reduce((sum, group) => sum + group.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb hierarchy={hierarchy} />
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Zatwierdzanie budżetów</h1>
        <p className="text-gray-600 mt-2">
          Przeglądaj i zatwierdzaj budżety z jednostek podległych (grupowane według jednostki i roku)
        </p>
        {descendantUnits.length > 0 && (
          <div className="mt-3 text-sm text-gray-500">
            Jednostki podległe: {descendantUnits.map(u => u.name).join(', ')}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600">Oczekuje na decyzję</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(totalPending)}</div>
          <div className="text-xs text-gray-500 mt-1">{pendingGroups.length} grup</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600">Zatwierdzone</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(totalApproved)}</div>
          <div className="text-xs text-gray-500 mt-1">{approvedGroups.length} grup</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600">Jednostek podległych</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{descendantUnits.length}</div>
        </div>
      </div>

      {hasParent && approvedGroups.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Przekaż zatwierdzone budżety</h3>
              <p className="text-sm text-blue-700 mt-1">
                Masz {approvedGroups.length} zatwierdzonych grup gotowych do przekazania do jednostki nadrzędnej
              </p>
            </div>
            <button
              onClick={handleForwardToParent}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <ArrowUp className="w-4 h-4" />
              <span>Przekaż wyżej</span>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Budżety do zatwierdzenia ({pendingGroups.length} grup)
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {pendingGroups.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-lg font-medium">Brak budżetów do zatwierdzenia</p>
              <p className="text-sm mt-1">
                Budżety z jednostek podległych pojawią się tutaj po przesłaniu
              </p>
            </div>
          ) : (
            pendingGroups.map(group => {
              const groupKey = getGroupKey(group);
              const isExpanded = expandedGroups.has(groupKey);

              const hasUnresolved = hasUnresolvedDiscussions(group);
              const unresolvedCount = getUnresolvedItems(group).length;

              return (
                <div key={groupKey} className={`hover:bg-gray-50 ${hasUnresolved ? 'bg-amber-50' : ''}`}>
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleGroup(groupKey)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900">{group.unitName}</h3>
                            {hasUnresolved && (
                              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full flex items-center space-x-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>{unresolvedCount} nierozwiązanych dyskusji</span>
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Rok {group.year} • {group.itemCount} pozycji • {formatCurrency(group.totalAmount)}
                          </p>
                          {hasUnresolved && (
                            <p className="text-xs text-amber-700 mt-2 font-medium">
                              Należy rozwiązać wszystkie dyskusje przed zatwierdzeniem
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleApprove(group)}
                        disabled={hasUnresolved}
                        className={`p-2 rounded-md transition-colors ${
                          hasUnresolved
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={hasUnresolved ? 'Rozwiąż dyskusje aby zatwierdzić' : 'Zatwierdź grupę'}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleReturn(group)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                        title="Zwróć do poprawy"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleReject(group)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Odrzuć grupę"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Szczegółowe pozycje</h4>
                        <div className="space-y-3">
                          {group.items.map(item => (
                            <div
                              key={item.id}
                              className="bg-white rounded-md p-3 border border-gray-200"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <p className="font-medium text-gray-900">{item.category}</p>
                                    <ClarificationBadge
                                      status={item.clarificationStatus}
                                      hasUnreadComments={item.hasUnreadComments}
                                    />
                                  </div>
                                  <p className="text-sm text-gray-600">{item.description}</p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <button
                                      onClick={() => setSelectedItemForDiscussion(item)}
                                      className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors flex items-center space-x-1"
                                    >
                                      <MessageSquare className="w-3 h-3" />
                                      <span>Dyskusja</span>
                                    </button>
                                    {item.clarificationStatus === 'none' && (
                                      <button
                                        onClick={() => {
                                          setSelectedItemForDiscussion(item);
                                          setActionType('clarify');
                                        }}
                                        className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 transition-colors flex items-center space-x-1"
                                      >
                                        <HelpCircle className="w-3 h-3" />
                                        <span>Poproś o wyjaśnienie</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="font-semibold text-gray-900">{formatCurrency(item.amount)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {approvedGroups.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Zatwierdzone budżety ({approvedGroups.length} grup)
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {approvedGroups.map(group => {
              const groupKey = getGroupKey(group);
              const isExpanded = expandedGroups.has(groupKey);

              return (
                <div key={groupKey} className="hover:bg-gray-50">
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleGroup(groupKey)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{group.unitName}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Rok {group.year} • {group.itemCount} pozycji • {formatCurrency(group.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status="approved" />
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Szczegółowe pozycje</h4>
                        <div className="space-y-3">
                          {group.items.map(item => (
                            <div
                              key={item.id}
                              className="bg-white rounded-md p-3 border border-gray-200"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{item.category}</p>
                                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                  {item.comment && (
                                    <p className="text-sm text-blue-600 mt-2 flex items-start space-x-2">
                                      <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                      <span>{item.comment}</span>
                                    </p>
                                  )}
                                </div>
                                <div className="text-right ml-4">
                                  <p className="font-semibold text-gray-900">{formatCurrency(item.amount)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {commentModalGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {actionType === 'approve' && 'Zatwierdź grupę budżetową'}
                {actionType === 'reject' && 'Odrzuć grupę budżetową'}
                {actionType === 'return' && 'Zwróć grupę do poprawy'}
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Jednostka:</strong> {commentModalGroup.unitName}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Rok:</strong> {commentModalGroup.year}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Liczba pozycji:</strong> {commentModalGroup.itemCount}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Łączna kwota:</strong> {formatCurrency(commentModalGroup.totalAmount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Komentarz {actionType !== 'approve' && '(wymagany)'}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder={
                    actionType === 'approve'
                      ? 'Opcjonalny komentarz do zatwierdzenia'
                      : 'Wyjaśnij powód decyzji'
                  }
                />
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setCommentModalGroup(null);
                  setComment('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 text-white rounded-md transition-colors ${
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : actionType === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {actionType === 'approve' && 'Zatwierdź'}
                {actionType === 'reject' && 'Odrzuć'}
                {actionType === 'return' && 'Zwróć'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedItemForDiscussion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {actionType === 'clarify' ? 'Poproś o wyjaśnienie' : 'Dyskusja o pozycji budżetowej'}
              </h3>
              <button
                onClick={() => {
                  setSelectedItemForDiscussion(null);
                  setActionType('approve');
                  setComment('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {actionType === 'clarify' ? (
                <div className="p-6">
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Kategoria:</strong> {selectedItemForDiscussion.category}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Opis:</strong> {selectedItemForDiscussion.description}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Kwota:</strong> {formatCurrency(selectedItemForDiscussion.amount)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Treść prośby o wyjaśnienie (wymagana)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Opisz co wymaga wyjaśnienia..."
                    />
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setSelectedItemForDiscussion(null);
                        setActionType('approve');
                        setComment('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={() => {
                        if (!comment.trim()) {
                          alert('Treść prośby jest wymagana');
                          return;
                        }
                        requestClarification(selectedItemForDiscussion.id, comment);
                        setSelectedItemForDiscussion(null);
                        setComment('');
                        setActionType('approve');
                      }}
                      className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                    >
                      Wyślij prośbę
                    </button>
                  </div>
                </div>
              ) : (
                <DiscussionThread
                  budgetItem={selectedItemForDiscussion}
                  onClose={() => setSelectedItemForDiscussion(null)}
                  showResolveButton={true}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
