import React from 'react';
import { User as UserIcon, Shield, Crown } from 'lucide-react';
import { useApp } from '../AppContext';

export function RoleSwitcher() {
  const { currentUser, setCurrentUser, users, units } = useApp();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'basic':
        return <UserIcon className="w-4 h-4" />;
      case 'approver':
        return <Shield className="w-4 h-4" />;
      case 'admin':
        return <Crown className="w-4 h-4" />;
      default:
        return <UserIcon className="w-4 h-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'basic':
        return 'Użytkownik';
      case 'approver':
        return 'Akceptujący';
      case 'admin':
        return 'Administrator';
      default:
        return role;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Przełącz użytkownika (Demo)</h3>
      <select
        value={currentUser?.id || ''}
        onChange={(e) => {
          const user = users.find(u => u.id === e.target.value);
          if (user) setCurrentUser(user);
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      >
        {users.map(user => {
          const unit = units.find(u => u.id === user.unitId);
          return (
            <option key={user.id} value={user.id}>
              {user.name} - {getRoleLabel(user.role)} ({unit?.name})
            </option>
          );
        })}
      </select>

      {currentUser && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Rola:</span>
            <div className="flex items-center space-x-2">
              {getRoleIcon(currentUser.role)}
              <span className="font-medium text-gray-900">{getRoleLabel(currentUser.role)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">Jednostka:</span>
            <span className="font-medium text-gray-900">
              {units.find(u => u.id === currentUser.unitId)?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
