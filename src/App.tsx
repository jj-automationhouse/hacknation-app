import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Shield, Menu, X } from 'lucide-react';
import { AppProvider, useApp } from './AppContext';
import { RoleSwitcher } from './components/RoleSwitcher';
import { OrganizationTree } from './components/OrganizationTree';
import { BudgetEntryView } from './components/BudgetEntryView';
import { ApprovalView } from './components/ApprovalView';
import { AdminView } from './components/AdminView';

type ViewType = 'budget' | 'approval' | 'admin';

function AppContent() {
  const { currentUser, loading } = useApp();
  const [currentView, setCurrentView] = useState<ViewType>('budget');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const canAccessApproval = currentUser?.role === 'approver' || currentUser?.role === 'admin';
  const canAccessAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (!currentUser) return;
    if (currentView === 'approval' && !canAccessApproval) {
      setCurrentView('budget');
    } else if (currentView === 'admin' && !canAccessAdmin) {
      setCurrentView('budget');
    }
  }, [currentUser, canAccessApproval, canAccessAdmin, currentView]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie danych...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Brak użytkowników w systemie</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                  System Budżetowania Jednostek Publicznych
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
                  Wielopoziomowy system zatwierdzania budżetów
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                <div className="text-xs text-gray-500">
                  {currentUser.role === 'basic' && 'Użytkownik podstawowy'}
                  {currentUser.role === 'approver' && 'Akceptujący'}
                  {currentUser.role === 'admin' && 'Administrator'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed top-0 left-0 h-screen w-80 bg-white border-r border-gray-200 p-6 space-y-6 overflow-y-auto transition-transform z-40`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => {
                setCurrentView('budget');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                currentView === 'budget'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Mój budżet</span>
            </button>

            {canAccessApproval && (
              <button
                onClick={() => {
                  setCurrentView('approval');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                  currentView === 'approval'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>Zatwierdzanie</span>
              </button>
            )}

            {canAccessAdmin && (
              <button
                onClick={() => {
                  setCurrentView('admin');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                  currentView === 'admin'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Przegląd</span>
              </button>
            )}
          </nav>

          <RoleSwitcher />
          <OrganizationTree />
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
          {currentView === 'budget' && <BudgetEntryView />}
          {currentView === 'approval' && canAccessApproval && <ApprovalView />}
          {currentView === 'admin' && canAccessAdmin && <AdminView />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
