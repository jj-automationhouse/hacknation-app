import { BudgetItem } from '../mockData';

export interface ItemComparison {
  id: string;
  status: 'new' | 'removed' | 'modified' | 'unchanged';
  oldItem?: BudgetItem;
  newItem?: BudgetItem;
  changes?: FieldChange[];
}

export interface FieldChange {
  field: string;
  fieldLabel: string;
  oldValue: any;
  newValue: any;
}

export function compareVersions(
  oldItems: BudgetItem[],
  newItems: BudgetItem[]
): ItemComparison[] {
  const comparisons: ItemComparison[] = [];
  const oldItemsMap = new Map(oldItems.map(item => [item.id, item]));
  const newItemsMap = new Map(newItems.map(item => [item.id, item]));
  const allIds = new Set([...oldItemsMap.keys(), ...newItemsMap.keys()]);

  allIds.forEach(id => {
    const oldItem = oldItemsMap.get(id);
    const newItem = newItemsMap.get(id);

    if (!oldItem && newItem) {
      comparisons.push({
        id,
        status: 'new',
        newItem,
      });
    } else if (oldItem && !newItem) {
      comparisons.push({
        id,
        status: 'removed',
        oldItem,
      });
    } else if (oldItem && newItem) {
      const changes = getItemChanges(oldItem, newItem);
      comparisons.push({
        id,
        status: changes.length > 0 ? 'modified' : 'unchanged',
        oldItem,
        newItem,
        changes,
      });
    }
  });

  return comparisons;
}

function getItemChanges(oldItem: BudgetItem, newItem: BudgetItem): FieldChange[] {
  const changes: FieldChange[] = [];
  const fieldsToCompare: Array<{
    key: keyof BudgetItem;
    label: string;
  }> = [
    { key: 'budgetSection', label: 'Część budżetowa' },
    { key: 'budgetDivision', label: 'Dział' },
    { key: 'budgetChapter', label: 'Rozdział' },
    { key: 'category', label: 'Kategoria' },
    { key: 'description', label: 'Opis' },
    { key: 'amount', label: 'Kwota' },
    { key: 'year', label: 'Rok' },
    { key: 'status', label: 'Status' },
  ];

  fieldsToCompare.forEach(({ key, label }) => {
    if (oldItem[key] !== newItem[key]) {
      changes.push({
        field: key,
        fieldLabel: label,
        oldValue: oldItem[key],
        newValue: newItem[key],
      });
    }
  });

  return changes;
}
