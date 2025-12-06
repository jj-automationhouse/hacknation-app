import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';
import {
  searchBudgetChapters,
  formatBudgetChapter,
  extractDzialCodeFromBudgetDivision,
} from '../data/budgetChapters';

interface BudgetChapterSelectProps {
  value: string;
  onChange: (value: string) => void;
  budgetDivision: string;
  disabled?: boolean;
  required?: boolean;
}

export function BudgetChapterSelect({
  value,
  onChange,
  budgetDivision,
  disabled = false,
  required = false
}: BudgetChapterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const dzialCode = extractDzialCodeFromBudgetDivision(budgetDivision);
  const isDisabledDueToNoDzial = !dzialCode;
  const isEffectivelyDisabled = disabled || isDisabledDueToNoDzial;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredChapters = searchBudgetChapters(searchQuery, dzialCode);

  const handleSelect = (code: string, label: string) => {
    const formattedValue = formatBudgetChapter(code, label);
    onChange(formattedValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onChange('');
    setSearchQuery('');
  };

  const displayValue = value || '';
  const placeholderText = isDisabledDueToNoDzial
    ? 'Najpierw wybierz dział'
    : 'Wybierz rozdział (zależny od wybranego działu)';

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Rozdział {required && <span className="text-red-600">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => !isEffectivelyDisabled && setIsOpen(!isOpen)}
          disabled={isEffectivelyDisabled}
          className={`w-full px-3 py-2 border rounded-md text-left focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isEffectivelyDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'
          } ${value ? 'text-gray-900' : 'text-gray-400'} border-gray-300`}
        >
          <div className="flex items-center justify-between">
            <span className="truncate">
              {displayValue || placeholderText}
            </span>
            <div className="flex items-center space-x-1 ml-2">
              {value && !isEffectivelyDisabled && (
                <X
                  className="w-4 h-4 text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                />
              )}
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-hidden flex flex-col">
            <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Szukaj po kodzie lub nazwie..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-80">
              {filteredChapters.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">
                  {dzialCode ? 'Nie znaleziono wyników' : 'Najpierw wybierz dział budżetowy'}
                </div>
              ) : (
                filteredChapters.map((chapter) => (
                  <button
                    key={chapter.code}
                    type="button"
                    onClick={() => handleSelect(chapter.code, chapter.label)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{chapter.code}</div>
                    <div className="text-gray-600">{chapter.label}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
