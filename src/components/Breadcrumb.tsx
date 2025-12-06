import React from 'react';
import { ChevronRight } from 'lucide-react';
import { OrganizationalUnit } from '../mockData';

interface BreadcrumbProps {
  hierarchy: OrganizationalUnit[];
}

export function Breadcrumb({ hierarchy }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600">
      {hierarchy.map((unit, index) => (
        <React.Fragment key={unit.id}>
          {index > 0 && <ChevronRight className="w-4 h-4" />}
          <span
            className={
              index === hierarchy.length - 1
                ? 'font-semibold text-gray-900'
                : 'hover:text-gray-900'
            }
          >
            {unit.name}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
}
