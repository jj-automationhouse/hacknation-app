export interface BudgetDivision {
  code: string;
  label: string;
}

export const BUDGET_DIVISIONS: BudgetDivision[] = [
  { code: '400', label: 'Wytwarzanie i zaopatrywanie w energię elektryczną, gaz i wodę' },
  { code: '500', label: 'Handel' },
  { code: '550', label: 'Hotele i restauracje' },
  { code: '600', label: 'Transport i łączność' },
  { code: '630', label: 'Turystyka' },
  { code: '700', label: 'Gospodarka mieszkaniowa' },
  { code: '710', label: 'Działalność usługowa' },
  { code: '720', label: 'Informatyka' },
  { code: '730', label: 'Szkolnictwo wyższe i nauka' },
  { code: '750', label: 'Administracja publiczna' },
  { code: '751', label: 'Urzędy naczelnych organów władzy państwowej, kontroli i ochrony prawa oraz sądownictwa' },
  { code: '752', label: 'Obrona narodowa' },
  { code: '753', label: 'Obowiązkowe ubezpieczenia społeczne' },
  { code: '754', label: 'Bezpieczeństwo publiczne i ochrona przeciwpożarowa' },
  { code: '755', label: 'Wymiar sprawiedliwości' },
  { code: '756', label: 'Dochody podatkowe i wydatki związane z ich poborem' },
  { code: '757', label: 'Obsługa długu publicznego' },
  { code: '758', label: 'Różne rozliczenia' },
  { code: '801', label: 'Oświata i wychowanie' },
  { code: '851', label: 'Ochrona zdrowia' },
  { code: '852', label: 'Pomoc społeczna' },
  { code: '853', label: 'Pozostałe zadania w zakresie polityki społecznej' },
  { code: '854', label: 'Edukacyjna opieka wychowawcza' },
  { code: '855', label: 'Rodzina' },
];

export function formatBudgetDivision(code: string, label: string): string {
  return `${code} – ${label}`;
}

export function searchBudgetDivisions(query: string): BudgetDivision[] {
  if (!query) return BUDGET_DIVISIONS;

  const lowerQuery = query.toLowerCase();
  return BUDGET_DIVISIONS.filter(division =>
    division.code.includes(lowerQuery) ||
    division.label.toLowerCase().includes(lowerQuery)
  );
}

export function parseBudgetDivision(value: string): { code: string; label: string } | null {
  if (!value) return null;

  const parts = value.split(' – ');
  if (parts.length >= 2) {
    return {
      code: parts[0],
      label: parts.slice(1).join(' – '),
    };
  }

  return null;
}
