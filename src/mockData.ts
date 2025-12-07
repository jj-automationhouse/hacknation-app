export type UnitType = "voivodeship" | "county" | "municipality" | "institution";
export type UserRole = "basic" | "approver" | "admin";
export type BudgetStatus = "draft" | "pending" | "approved" | "rejected";
export type SubmissionStatus = "draft" | "pending" | "approved" | "returned";
export type ClarificationStatus = "none" | "requested" | "responded" | "resolved";
export type LimitStatus = "not_assigned" | "limits_assigned" | "limits_distributed";

export interface OrganizationalUnit {
  id: string;
  name: string;
  type: UnitType;
  parentId: string | null;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  unitId: string;
}

export interface BudgetComment {
  id: string;
  budgetItemId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  isResponse?: boolean;
  parentCommentId?: string;
}

export interface BudgetItem {
  id: string;
  unitId: string;
  budgetSection: string;
  budgetDivision: string;
  budgetChapter: string;
  category: string;
  description: string;
  year: number;
  amount: number;
  status: BudgetStatus;
  comment?: string;
  submittedTo?: string;
  clarificationStatus: ClarificationStatus;
  hasUnreadComments?: boolean;
  limitAmount?: number;
  limitStatus: LimitStatus;
}

export interface BudgetSubmission {
  id: string;
  fromUnitId: string;
  toUnitId: string;
  status: SubmissionStatus;
  budgetItemIds: string[];
  submittedAt?: Date;
}

export const organizationalUnits: OrganizationalUnit[] = [
  { id: "voi-1", name: "Województwo Mazowieckie", type: "voivodeship", parentId: null },
  { id: "cou-1", name: "Powiat Warszawski", type: "county", parentId: "voi-1" },
  { id: "cou-2", name: "Powiat Radomski", type: "county", parentId: "voi-1" },
  { id: "mun-1", name: "Gmina Pruszków", type: "municipality", parentId: "cou-1" },
  { id: "mun-2", name: "Gmina Piaseczno", type: "municipality", parentId: "cou-1" },
  { id: "mun-3", name: "Gmina Radom", type: "municipality", parentId: "cou-2" },
  { id: "inst-1", name: "Szkoła Podstawowa nr 5", type: "institution", parentId: "mun-1" },
  { id: "inst-2", name: "Szpital Powiatowy", type: "institution", parentId: "mun-1" },
  { id: "inst-3", name: "Urząd Gminy Piaseczno", type: "institution", parentId: "mun-2" },
  { id: "inst-4", name: "Szkoła Podstawowa nr 12", type: "institution", parentId: "mun-3" },
];

export const users: User[] = [
  { id: "u-1", name: "Jan Kowalski", role: "basic", unitId: "inst-1" },
  { id: "u-2", name: "Anna Nowak", role: "basic", unitId: "inst-2" },
  { id: "u-3", name: "Piotr Wiśniewski", role: "basic", unitId: "inst-3" },
  { id: "u-4", name: "Maria Wójcik", role: "basic", unitId: "inst-4" },
  { id: "u-5", name: "Krzysztof Kamiński", role: "approver", unitId: "mun-1" },
  { id: "u-6", name: "Ewa Lewandowska", role: "approver", unitId: "mun-2" },
  { id: "u-7", name: "Tomasz Zieliński", role: "approver", unitId: "mun-3" },
  { id: "u-8", name: "Katarzyna Szymańska", role: "approver", unitId: "cou-1" },
  { id: "u-9", name: "Marek Woźniak", role: "approver", unitId: "cou-2" },
  { id: "u-10", name: "Agnieszka Dąbrowska", role: "admin", unitId: "voi-1" },
];

export const initialBudgetItems: BudgetItem[] = [
  {
    id: "b-1",
    unitId: "inst-1",
    budgetSection: "30 – Oświata i wychowanie",
    budgetDivision: "801 – Oświata i wychowanie",
    budgetChapter: "80101 – Szkoły podstawowe",
    category: "Wyposażenie",
    description: "Komputery dla pracowni informatycznej",
    year: 2024,
    amount: 50000,
    status: "draft",
    clarificationStatus: "none",
    limitStatus: "not_assigned",
  },
  {
    id: "b-2",
    unitId: "inst-1",
    budgetSection: "30 – Oświata i wychowanie",
    budgetDivision: "801 – Oświata i wychowanie",
    budgetChapter: "80101 – Szkoły podstawowe",
    category: "Remonty",
    description: "Remont sali gimnastycznej",
    year: 2024,
    amount: 120000,
    status: "draft",
    clarificationStatus: "none",
    limitStatus: "not_assigned",
  },
  {
    id: "b-3",
    unitId: "inst-2",
    budgetSection: "46 – Zdrowie",
    budgetDivision: "851 – Ochrona zdrowia",
    budgetChapter: "85111 – Szpitale ogólne",
    category: "Sprzęt medyczny",
    description: "Zakup aparatu USG",
    year: 2024,
    amount: 200000,
    status: "draft",
    clarificationStatus: "none",
    limitStatus: "not_assigned",
  },
  {
    id: "b-4",
    unitId: "inst-3",
    budgetSection: "27 – Informatyzacja",
    budgetDivision: "720 – Informatyka",
    budgetChapter: "72095 – Pozostała działalność",
    category: "Oprogramowanie",
    description: "Licencje na system obiegu dokumentów",
    year: 2024,
    amount: 30000,
    status: "draft",
    clarificationStatus: "none",
    limitStatus: "not_assigned",
  },
  {
    id: "b-5",
    unitId: "inst-4",
    budgetSection: "30 – Oświata i wychowanie",
    budgetDivision: "801 – Oświata i wychowanie",
    budgetChapter: "80101 – Szkoły podstawowe",
    category: "Wyposażenie",
    description: "Meble do klas",
    year: 2024,
    amount: 45000,
    status: "draft",
    clarificationStatus: "none",
    limitStatus: "not_assigned",
  },
];

export const initialComments: BudgetComment[] = [];

export const initialSubmissions: BudgetSubmission[] = [];

export function getUnitHierarchy(unitId: string, units: OrganizationalUnit[]): OrganizationalUnit[] {
  const hierarchy: OrganizationalUnit[] = [];
  let currentUnit = units.find(u => u.id === unitId);

  while (currentUnit) {
    hierarchy.unshift(currentUnit);
    currentUnit = currentUnit.parentId ? units.find(u => u.id === currentUnit!.parentId) : undefined;
  }

  return hierarchy;
}

export function getChildUnits(unitId: string, units: OrganizationalUnit[]): OrganizationalUnit[] {
  return units.filter(u => u.parentId === unitId);
}

export function getAllDescendantUnits(unitId: string, units: OrganizationalUnit[]): OrganizationalUnit[] {
  const descendants: OrganizationalUnit[] = [];
  const children = getChildUnits(unitId, units);

  for (const child of children) {
    descendants.push(child);
    descendants.push(...getAllDescendantUnits(child.id, units));
  }

  return descendants;
}

export function getParentUnit(unitId: string, units: OrganizationalUnit[]): OrganizationalUnit | undefined {
  const unit = units.find(u => u.id === unitId);
  return unit?.parentId ? units.find(u => u.id === unit.parentId) : undefined;
}

export function findDirectChildUnit(
  itemUnitId: string,
  approvingUnitId: string,
  units: OrganizationalUnit[]
): OrganizationalUnit | undefined {
  let currentUnit = units.find(u => u.id === itemUnitId);

  if (!currentUnit) return undefined;

  if (currentUnit.parentId === approvingUnitId) {
    return currentUnit;
  }

  while (currentUnit && currentUnit.parentId) {
    const parentUnit = units.find(u => u.id === currentUnit!.parentId);
    if (!parentUnit) return undefined;

    if (parentUnit.parentId === approvingUnitId) {
      return parentUnit;
    }

    currentUnit = parentUnit;
  }

  return undefined;
}
