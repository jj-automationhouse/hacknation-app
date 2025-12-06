export interface BudgetSectionOption {
  code: string;
  label: string;
  group?: string;
}

export interface BudgetSection {
  code: string;
  label: string;
  group?: string;
  requiresSecondLevel?: boolean;
  secondLevelOptions?: BudgetSectionOption[];
}

const courtsOptions: BudgetSectionOption[] = [
  { code: '15/01', label: 'Ministerstwo Sprawiedliwości' },
  { code: '15/02', label: 'Sąd Apelacyjny w Warszawie' },
  { code: '15/03', label: 'Sąd Apelacyjny w Katowicach' },
  { code: '15/04', label: 'Sąd Apelacyjny w Gdańsku' },
  { code: '15/05', label: 'Sąd Apelacyjny w Poznaniu' },
  { code: '15/06', label: 'Sąd Apelacyjny w Krakowie' },
  { code: '15/07', label: 'Sąd Apelacyjny we Wrocławiu' },
  { code: '15/08', label: 'Sąd Apelacyjny w Łodzi' },
  { code: '15/09', label: 'Sąd Apelacyjny w Białymstoku' },
  { code: '15/10', label: 'Sąd Apelacyjny w Lublinie' },
  { code: '15/11', label: 'Sąd Apelacyjny w Rzeszowie' },
  { code: '15/12', label: 'Sąd Apelacyjny w Szczecinie' },
];

const voivodeshipOptions: BudgetSectionOption[] = [
  { code: '85/02', label: 'Województwo dolnośląskie' },
  { code: '85/04', label: 'Województwo kujawsko-pomorskie' },
  { code: '85/06', label: 'Województwo lubelskie' },
  { code: '85/08', label: 'Województwo lubuskie' },
  { code: '85/10', label: 'Województwo łódzkie' },
  { code: '85/12', label: 'Województwo małopolskie' },
  { code: '85/14', label: 'Województwo mazowieckie' },
  { code: '85/16', label: 'Województwo opolskie' },
  { code: '85/18', label: 'Województwo podkarpackie' },
  { code: '85/20', label: 'Województwo podlaskie' },
  { code: '85/22', label: 'Województwo pomorskie' },
  { code: '85/24', label: 'Województwo śląskie' },
  { code: '85/26', label: 'Województwo świętokrzyskie' },
  { code: '85/28', label: 'Województwo warmińsko-mazurskie' },
  { code: '85/30', label: 'Województwo wielkopolskie' },
  { code: '85/32', label: 'Województwo zachodniopomorskie' },
];

const skoOptions: BudgetSectionOption[] = [
  { code: '86/01', label: 'SKO w Warszawie' },
  { code: '86/03', label: 'SKO w Białej Podlaskiej' },
  { code: '86/05', label: 'SKO w Białymstoku' },
  { code: '86/07', label: 'SKO w Bielsku-Białej' },
  { code: '86/09', label: 'SKO w Bydgoszczy' },
  { code: '86/11', label: 'SKO w Chełmie' },
  { code: '86/13', label: 'SKO w Ciechanowie' },
  { code: '86/15', label: 'SKO w Częstochowie' },
  { code: '86/17', label: 'SKO w Elblągu' },
  { code: '86/19', label: 'SKO w Gdańsku' },
  { code: '86/21', label: 'SKO w Gorzowie Wielkopolskim' },
  { code: '86/23', label: 'SKO w Jeleniej Górze' },
  { code: '86/25', label: 'SKO w Kaliszu' },
  { code: '86/27', label: 'SKO w Katowicach' },
  { code: '86/29', label: 'SKO w Kielcach' },
  { code: '86/31', label: 'SKO w Koninie' },
  { code: '86/33', label: 'SKO w Koszalinie' },
  { code: '86/35', label: 'SKO w Krakowie' },
  { code: '86/37', label: 'SKO w Krośnie' },
  { code: '86/39', label: 'SKO w Lesznie' },
  { code: '86/41', label: 'SKO w Lublinie' },
  { code: '86/43', label: 'SKO w Łomży' },
  { code: '86/45', label: 'SKO w Łodzi' },
  { code: '86/47', label: 'SKO w Nowym Sączu' },
  { code: '86/49', label: 'SKO w Olsztynie' },
  { code: '86/51', label: 'SKO w Opolu' },
  { code: '86/53', label: 'SKO w Ostrołęce' },
  { code: '86/55', label: 'SKO w Pile' },
  { code: '86/57', label: 'SKO w Piotrkowie Trybunalskim' },
  { code: '86/59', label: 'SKO w Płocku' },
  { code: '86/61', label: 'SKO w Poznaniu' },
  { code: '86/63', label: 'SKO w Przemyślu' },
  { code: '86/65', label: 'SKO w Radomiu' },
  { code: '86/67', label: 'SKO w Rzeszowie' },
  { code: '86/69', label: 'SKO w Siedlcach' },
  { code: '86/71', label: 'SKO w Sieradzu' },
  { code: '86/73', label: 'SKO w Skierniewicach' },
  { code: '86/75', label: 'SKO w Słupsku' },
  { code: '86/77', label: 'SKO w Suwałkach' },
  { code: '86/79', label: 'SKO w Szczecinie' },
  { code: '86/81', label: 'SKO w Tarnobrzegu' },
  { code: '86/83', label: 'SKO w Tarnowie' },
  { code: '86/85', label: 'SKO w Toruniu' },
  { code: '86/87', label: 'SKO w Wałbrzychu' },
  { code: '86/89', label: 'SKO w Włocławku' },
  { code: '86/91', label: 'SKO we Włoszczowie' },
  { code: '86/93', label: 'SKO we Wrocławiu' },
  { code: '86/95', label: 'SKO w Zamościu' },
  { code: '86/97', label: 'SKO w Zielonej Górze' },
];

export const BUDGET_SECTIONS: BudgetSection[] = [
  { code: '01', label: 'Kancelaria Prezydenta RP' },
  { code: '02', label: 'Kancelaria Sejmu' },
  { code: '03', label: 'Kancelaria Senatu' },
  { code: '04', label: 'Sąd Najwyższy' },
  { code: '05', label: 'Naczelny Sąd Administracyjny' },
  { code: '06', label: 'Trybunał Konstytucyjny' },
  { code: '07', label: 'Najwyższa Izba Kontroli' },
  { code: '08', label: 'Rzecznik Praw Obywatelskich' },
  { code: '09', label: 'Krajowa Rada Radiofonii i Telewizji' },
  { code: '10', label: 'Urząd Ochrony Danych Osobowych' },
  { code: '11', label: 'Krajowe Biuro Wyborcze' },
  { code: '12', label: 'Państwowa Inspekcja Pracy' },
  { code: '13', label: 'Instytut Pamięci Narodowej' },
  { code: '14', label: 'Rzecznik Praw Dziecka' },
  { code: '15/00', label: 'Sądy powszechne', requiresSecondLevel: true, secondLevelOptions: courtsOptions },
  { code: '16', label: 'Kancelaria Prezesa Rady Ministrów' },
  { code: '17', label: 'Administracja publiczna' },
  { code: '18', label: 'Budownictwo i planowanie przestrzenne' },
  { code: '19', label: 'Budżet i finanse publiczne' },
  { code: '20', label: 'Gospodarka' },
  { code: '24', label: 'Kultura i ochrona dziedzictwa narodowego' },
  { code: '27', label: 'Informatyzacja' },
  { code: '29', label: 'Obrona narodowa' },
  { code: '30', label: 'Oświata i wychowanie' },
  { code: '32', label: 'Porządek i bezpieczeństwo publiczne' },
  { code: '34', label: 'Praca' },
  { code: '37', label: 'Rolnictwo i łowiectwo' },
  { code: '39', label: 'Transport' },
  { code: '41', label: 'Sprawy wewnętrzne' },
  { code: '42', label: 'Sprawiedliwość' },
  { code: '43', label: 'Środowisko' },
  { code: '44', label: 'Szkolnictwo wyższe i nauka' },
  { code: '46', label: 'Zdrowie' },
  { code: '47', label: 'Zabezpieczenie społeczne' },
  { code: '51', label: 'Klimat' },
  { code: '52', label: 'Sport' },
  { code: '54', label: 'Sprawy zagraniczne' },
  { code: '55', label: 'Aktywa państwowe' },
  { code: '73', label: 'Zakład Ubezpieczeń Społecznych' },
  { code: '75', label: 'Dotacje dla partii politycznych' },
  { code: '79', label: 'Obsługa długu Skarbu Państwa' },
  { code: '80', label: 'Rezerwy celowe' },
  { code: '81', label: 'Rezerwa ogólna' },
  { code: '82', label: 'Subwencje ogólne dla JST' },
  { code: '83', label: 'Środki własne Unii Europejskiej' },
  { code: '84', label: 'Różne rozliczenia' },
  { code: '85/00', label: 'Województwa', requiresSecondLevel: true, secondLevelOptions: voivodeshipOptions },
  { code: '86/00', label: 'Samorządowe Kolegia Odwoławcze', requiresSecondLevel: true, secondLevelOptions: skoOptions },
];

export function formatBudgetSection(code: string, label: string): string {
  return `${code} – ${label}`;
}

export function searchBudgetSections(query: string, sections: BudgetSection[] = BUDGET_SECTIONS): BudgetSection[] {
  if (!query) return sections;

  const lowerQuery = query.toLowerCase();
  return sections.filter(section =>
    section.code.toLowerCase().includes(lowerQuery) ||
    section.label.toLowerCase().includes(lowerQuery)
  );
}

export function searchSecondLevelOptions(query: string, options: BudgetSectionOption[]): BudgetSectionOption[] {
  if (!query) return options;

  const lowerQuery = query.toLowerCase();
  return options.filter(option =>
    option.code.toLowerCase().includes(lowerQuery) ||
    option.label.toLowerCase().includes(lowerQuery)
  );
}
