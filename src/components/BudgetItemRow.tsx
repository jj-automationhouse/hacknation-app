import React, { useState, useEffect } from 'react';
import { Check, X, MessageSquare, Edit2 } from 'lucide-react';
import { BudgetItem } from '../mockData';
import { StatusBadge } from './StatusBadge';
import { ClarificationBadge } from './ClarificationBadge';
import { BudgetSectionSelect } from './BudgetSectionSelect';
import { BudgetDivisionSelect } from './BudgetDivisionSelect';
import { BudgetChapterSelect } from './BudgetChapterSelect';

interface BudgetItemRowProps {
  item?: BudgetItem;
  isEditing: boolean;
  isNew?: boolean;
  onSave: (data: Omit<BudgetItem, 'id' | 'unitId' | 'status' | 'clarificationStatus'>) => void;
  onCancel: () => void;
  onEdit?: (item: BudgetItem) => void;
  onDiscussion?: (item: BudgetItem) => void;
  formatCurrency: (amount: number) => string;
}

export function BudgetItemRow({
  item,
  isEditing,
  isNew = false,
  onSave,
  onCancel,
  onEdit,
  onDiscussion,
  formatCurrency,
}: BudgetItemRowProps) {
  const [formData, setFormData] = useState({
    budgetSection: item?.budgetSection || '',
    budgetDivision: item?.budgetDivision || '',
    budgetChapter: item?.budgetChapter || '',
    category: item?.category || '',
    description: item?.description || '',
    amount: item?.amount?.toString() || '',
    year: item?.year || new Date().getFullYear(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setFormData({
        budgetSection: item.budgetSection,
        budgetDivision: item.budgetDivision,
        budgetChapter: item.budgetChapter,
        category: item.category,
        description: item.description,
        amount: item.amount.toString(),
        year: item.year,
      });
    }
  }, [item]);

  const handleDivisionChange = (value: string) => {
    setFormData({
      ...formData,
      budgetDivision: value,
      budgetChapter: '',
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.budgetSection.trim()) {
      newErrors.budgetSection = 'Wymagane';
    }
    if (!formData.budgetDivision.trim()) {
      newErrors.budgetDivision = 'Wymagane';
    }
    if (!formData.budgetChapter.trim()) {
      newErrors.budgetChapter = 'Wymagane';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Wymagane';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Wymagane';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Kwota > 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({
        budgetSection: formData.budgetSection,
        budgetDivision: formData.budgetDivision,
        budgetChapter: formData.budgetChapter,
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
        year: formData.year,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!isEditing && item) {
    const canEdit = item.status !== 'approved';

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
          {item.budgetSection}
        </td>
        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
          {item.budgetDivision}
        </td>
        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
          {item.budgetChapter}
        </td>
        <td className="px-6 py-4 text-sm font-medium text-gray-900">
          {item.category}
        </td>
        <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
          {item.description}
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">{item.year}</td>
        <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
          {formatCurrency(item.amount)}
        </td>
        <td className="px-6 py-4 text-center">
          <StatusBadge status={item.status} />
        </td>
        <td className="px-6 py-4 text-center">
          <ClarificationBadge
            status={item.clarificationStatus}
            hasUnreadComments={item.hasUnreadComments}
          />
        </td>
        <td className="px-6 py-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(item)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
                title="Edytuj"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => onDiscussion && onDiscussion(item)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title="Otwórz dyskusję"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </td>
        <td className="px-6 py-4">
          {item.comment && (
            <div className="flex items-start space-x-2 text-sm">
              <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{item.comment}</span>
            </div>
          )}
        </td>
      </tr>
    );
  }

  return (
    <tr
      className={`${isNew ? 'bg-blue-50' : 'bg-yellow-50'} border-2 ${isNew ? 'border-blue-200' : 'border-yellow-200'}`}
      onKeyDown={handleKeyDown}
    >
      <td className="px-3 py-3">
        <div className="space-y-1">
          <BudgetSectionSelect
            value={formData.budgetSection}
            onChange={(value) => setFormData({ ...formData, budgetSection: value })}
            required
          />
          {errors.budgetSection && (
            <p className="text-xs text-red-600">{errors.budgetSection}</p>
          )}
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="space-y-1">
          <BudgetDivisionSelect
            value={formData.budgetDivision}
            onChange={handleDivisionChange}
            required
          />
          {errors.budgetDivision && (
            <p className="text-xs text-red-600">{errors.budgetDivision}</p>
          )}
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="space-y-1">
          <BudgetChapterSelect
            value={formData.budgetChapter}
            onChange={(value) => setFormData({ ...formData, budgetChapter: value })}
            budgetDivision={formData.budgetDivision}
            required
          />
          {errors.budgetChapter && (
            <p className="text-xs text-red-600">{errors.budgetChapter}</p>
          )}
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="space-y-1">
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Kategoria"
          />
          {errors.category && (
            <p className="text-xs text-red-600">{errors.category}</p>
          )}
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="space-y-1">
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
            placeholder="Opis"
          />
          {errors.description && (
            <p className="text-xs text-red-600">{errors.description}</p>
          )}
        </div>
      </td>
      <td className="px-3 py-3">
        <input
          type="number"
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </td>
      <td className="px-3 py-3">
        <div className="space-y-1">
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            placeholder="0.00"
          />
          {errors.amount && (
            <p className="text-xs text-red-600">{errors.amount}</p>
          )}
        </div>
      </td>
      <td className="px-3 py-3 text-center" colSpan={3}>
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={handleSave}
            className="p-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
            title="Zapisz"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={onCancel}
            className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            title="Anuluj"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </td>
      <td className="px-3 py-3 text-center text-xs text-gray-500">
        {isNew ? 'Nowa pozycja' : 'Edycja'}
      </td>
    </tr>
  );
}
