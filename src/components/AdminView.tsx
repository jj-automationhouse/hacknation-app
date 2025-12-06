import React from 'react';
import { useApp } from '../AppContext';
import { Breadcrumb } from './Breadcrumb';
import { StatusBadge } from './StatusBadge';
import { getUnitHierarchy } from '../mockData';
import { TrendingUp, Building2, FileText, AlertCircle } from 'lucide-react';

export function AdminView() {
  const { currentUser, units, budgetItems } = useApp();

  if (!currentUser) return null;

  const currentUnit = units.find(u => u.id === currentUser.unitId);
  const hierarchy = currentUnit ? getUnitHierarchy(currentUnit.id, units) : [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
    }).format(amount);
  };

  const totalBudget = budgetItems.reduce((sum, item) => sum + item.amount, 0);
  const pendingBudget = budgetItems
    .filter(item => item.status === 'pending')
    .reduce((sum, item) => sum + item.amount, 0);
  const approvedBudget = budgetItems
    .filter(item => item.status === 'approved')
    .reduce((sum, item) => sum + item.amount, 0);
  const rejectedBudget = budgetItems
    .filter(item => item.status === 'rejected')
    .reduce((sum, item) => sum + item.amount, 0);

  const budgetByUnit = units.map(unit => {
    const unitItems = budgetItems.filter(item => item.unitId === unit.id);
    const total = unitItems.reduce((sum, item) => sum + item.amount, 0);
    return {
      unit,
      total,
      items: unitItems,
    };
  }).filter(u => u.items.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb hierarchy={hierarchy} />
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Przegląd administracyjny</h1>
        <p className="text-gray-600 mt-2">
          Całościowy podgląd budżetów w całej strukturze organizacyjnej
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Łączny budżet</div>
              <div className="text-xl font-bold text-gray-900">{formatCurrency(totalBudget)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Oczekuje</div>
              <div className="text-xl font-bold text-amber-600">{formatCurrency(pendingBudget)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Zatwierdzone</div>
              <div className="text-xl font-bold text-emerald-600">{formatCurrency(approvedBudget)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Odrzucone</div>
              <div className="text-xl font-bold text-red-600">{formatCurrency(rejectedBudget)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Budżet według jednostek</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jednostka
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Typ
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Liczba pozycji
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Łączna kwota
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {budgetByUnit.map(({ unit, total, items }) => (
                <tr key={unit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{unit.name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {unit.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{items.length}</td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                    {formatCurrency(total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Wszystkie pozycje budżetowe</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jednostka
                </th>
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
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Kwota
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {budgetItems.map(item => {
                const unit = units.find(u => u.id === item.unitId);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{unit?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">{item.budgetSection}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">{item.budgetDivision}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">{item.budgetChapter}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md">{item.description}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
