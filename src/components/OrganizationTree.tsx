import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Building2, MapPin, Home, School } from 'lucide-react';
import { OrganizationalUnit, getChildUnits } from '../mockData';
import { useApp } from '../AppContext';

interface TreeNodeProps {
  unit: OrganizationalUnit;
  level: number;
}

function TreeNode({ unit, level }: TreeNodeProps) {
  const { units, currentUser } = useApp();
  const [isExpanded, setIsExpanded] = useState(true);
  const children = getChildUnits(unit.id, units);
  const hasChildren = children.length > 0;
  const isCurrentUnit = currentUser?.unitId === unit.id;

  const getIcon = (type: string) => {
    switch (type) {
      case 'voivodeship':
        return <Building2 className="w-4 h-4" />;
      case 'county':
        return <MapPin className="w-4 h-4" />;
      case 'municipality':
        return <Home className="w-4 h-4" />;
      case 'institution':
        return <School className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'voivodeship':
        return 'Województwo';
      case 'county':
        return 'Powiat';
      case 'municipality':
        return 'Gmina';
      case 'institution':
        return 'Instytucja';
      default:
        return type;
    }
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-gray-50 cursor-pointer ${
          isCurrentUnit ? 'bg-blue-50 border border-blue-200' : ''
        }`}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )
        ) : (
          <div className="w-4" />
        )}
        <div className="text-gray-500">{getIcon(unit.type)}</div>
        <div className="flex-1">
          <div className={`text-sm font-medium ${isCurrentUnit ? 'text-blue-900' : 'text-gray-900'}`}>
            {unit.name}
          </div>
          <div className="text-xs text-gray-500">{getTypeLabel(unit.type)}</div>
        </div>
        {isCurrentUnit && (
          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Twoja jednostka</span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {children.map(child => (
            <TreeNode key={child.id} unit={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function OrganizationTree() {
  const { units } = useApp();
  const rootUnits = units.filter(u => u.parentId === null);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Struktura organizacyjna</h3>
      <div className="space-y-1">
        {rootUnits.map(unit => (
          <TreeNode key={unit.id} unit={unit} level={0} />
        ))}
      </div>
    </div>
  );
}
