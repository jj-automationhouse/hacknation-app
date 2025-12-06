import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';
import {
  BUDGET_SECTIONS,
  BudgetSection,
  BudgetSectionOption,
  formatBudgetSection,
  searchBudgetSections,
  searchSecondLevelOptions,
} from '../data/budgetSections';

interface BudgetSectionSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export function BudgetSectionSelect({ value, onChange, disabled = false, required = false }: BudgetSectionSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrimary, setSelectedPrimary] = useState<BudgetSection | null>(null);
  const [showSecondLevel, setShowSecondLevel] = useState(false);
  const [secondLevelQuery, setSecondLevelQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      const parts = value.split(' – ');
      if (parts.length >= 2) {
        const code = parts[0];
        const baseCode = code.includes('/') ? code.split('/')[0] + '/00' : code;
        const section = BUDGET_SECTIONS.find(s => s.code === baseCode || s.code === code);
        if (section) {
          setSelectedPrimary(section);
        }
      }
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSecondLevel(false);
        setSearchQuery('');
        setSecondLevelQuery('');
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

  const filteredSections = searchBudgetSections(searchQuery);
  const filteredSecondLevel = selectedPrimary?.secondLevelOptions
    ? searchSecondLevelOptions(secondLevelQuery, selectedPrimary.secondLevelOptions)
    : [];

  const handlePrimarySelect = (section: BudgetSection) => {
    if (section.requiresSecondLevel) {
      setSelectedPrimary(section);
      setShowSecondLevel(true);
      setSearchQuery('');
    } else {
      const formattedValue = formatBudgetSection(section.code, section.label);
      onChange(formattedValue);
      setSelectedPrimary(section);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleSecondLevelSelect = (option: BudgetSectionOption) => {
    if (selectedPrimary) {
      const fullLabel = `${selectedPrimary.label} – ${option.label}`;
      const formattedValue = formatBudgetSection(option.code, fullLabel);
      onChange(formattedValue);
      setIsOpen(false);
      setShowSecondLevel(false);
      setSearchQuery('');
      setSecondLevelQuery('');
    }
  };

  const handleClear = () => {
    onChange('');
    setSelectedPrimary(null);
    setShowSecondLevel(false);
    setSearchQuery('');
    setSecondLevelQuery('');
  };

  const handleBackToFirst = () => {
    setShowSecondLevel(false);
    setSecondLevelQuery('');
  };

  const displayValue = value || '';

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Część budżetowa {required && <span className="text-red-600">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md text-left focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'
          } ${value ? 'text-gray-900' : 'text-gray-400'} border-gray-300`}
        >
          <div className="flex items-center justify-between">
            <span className="truncate">{displayValue || 'Wybierz część budżetową...'}</span>
            <div className="flex items-center space-x-1 ml-2">
              {value && !disabled && (
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
            {!showSecondLevel ? (
              <>
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
                  {filteredSections.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 text-center">Nie znaleziono wyników</div>
                  ) : (
                    filteredSections.map((section) => (
                      <button
                        key={section.code}
                        type="button"
                        onClick={() => handlePrimarySelect(section)}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{section.code}</div>
                        <div className="text-gray-600">{section.label}</div>
                        {section.requiresSecondLevel && (
                          <div className="text-xs text-blue-600 mt-1">Wymaga wyboru podkategorii →</div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="p-2 border-b border-gray-200 bg-gray-50">
                  <button
                    type="button"
                    onClick={handleBackToFirst}
                    className="text-sm text-blue-600 hover:text-blue-800 mb-2"
                  >
                    ← Powrót do wyboru głównej części
                  </button>
                  <div className="text-xs text-gray-600 mb-2">
                    Wybrano: <span className="font-medium">{selectedPrimary?.code} – {selectedPrimary?.label}</span>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={secondLevelQuery}
                      onChange={(e) => setSecondLevelQuery(e.target.value)}
                      placeholder="Szukaj podkategorii..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="overflow-y-auto max-h-80">
                  {filteredSecondLevel.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 text-center">Nie znaleziono wyników</div>
                  ) : (
                    filteredSecondLevel.map((option) => (
                      <button
                        key={option.code}
                        type="button"
                        onClick={() => handleSecondLevelSelect(option)}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{option.code}</div>
                        <div className="text-gray-600">{option.label}</div>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
