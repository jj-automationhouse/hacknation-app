export interface BudgetChapter {
  code: string;
  label: string;
  dzialCode: string;
}

export const BUDGET_CHAPTERS: BudgetChapter[] = [
  { code: '72001', label: 'Działalność Centrum Informatyki Statystycznej', dzialCode: '720' },
  { code: '72003', label: 'Działalność Funduszu Cyberbezpieczeństwa', dzialCode: '720' },
  { code: '72079', label: 'Pomoc zagraniczna', dzialCode: '720' },
  { code: '72080', label: 'Działalność badawczo-rozwojowa', dzialCode: '720' },
  { code: '72095', label: 'Pozostała działalność', dzialCode: '720' },

  { code: '75001', label: 'Urzędy naczelnych i centralnych organów administracji rządowej', dzialCode: '750' },
  { code: '75002', label: 'Polski Komitet Normalizacyjny', dzialCode: '750' },
  { code: '75003', label: 'Prokuratoria Generalna Rzeczypospolitej Polskiej', dzialCode: '750' },
  { code: '75004', label: 'Państwowa Komisja do spraw przeciwdziałania wykorzystaniu seksualnemu małoletnich poniżej lat 15', dzialCode: '750' },
  { code: '75006', label: 'Rządowe Centrum Legislacji', dzialCode: '750' },
  { code: '75007', label: 'Jednostki terenowe podległe naczelnym i centralnym organom administracji rządowej', dzialCode: '750' },
  { code: '75008', label: 'Działalność izb administracji skarbowej wraz z podległymi urzędami skarbowymi i urzędami celno-skarbowymi', dzialCode: '750' },
  { code: '75011', label: 'Urzędy wojewódzkie', dzialCode: '750' },
  { code: '75014', label: 'Egzekucja administracyjna należności pieniężnych', dzialCode: '750' },
  { code: '75015', label: 'Regionalne izby obrachunkowe', dzialCode: '750' },
  { code: '75016', label: 'Samorządowe kolegia odwoławcze', dzialCode: '750' },
  { code: '75017', label: 'Samorządowe sejmiki województw', dzialCode: '750' },
  { code: '75018', label: 'Urzędy marszałkowskie', dzialCode: '750' },
  { code: '75019', label: 'Rady powiatów', dzialCode: '750' },
  { code: '75020', label: 'Starostwa powiatowe', dzialCode: '750' },
  { code: '75022', label: 'Rady gmin (miast i miast na prawach powiatu)', dzialCode: '750' },
  { code: '75023', label: 'Urzędy gmin (miast i miast na prawach powiatu)', dzialCode: '750' },
  { code: '75024', label: 'Działalność Krajowej Szkoły Skarbowości', dzialCode: '750' },
  { code: '75025', label: 'Zgromadzenie związku metropolitalnego', dzialCode: '750' },
  { code: '75026', label: 'Urząd metropolitalny', dzialCode: '750' },
  { code: '75027', label: 'Działalność Narodowego Instytutu Wolności - Centrum Rozwoju Społeczeństwa Obywatelskiego', dzialCode: '750' },
  { code: '75028', label: 'Działalność Instytutu Współpracy Polsko-Węgierskiej im. Wacława Felczaka', dzialCode: '750' },
  { code: '75029', label: 'Działalność Polskiego Instytutu Ekonomicznego', dzialCode: '750' },
  { code: '75030', label: 'Działalność Rzecznika Małych i Średnich Przedsiębiorców', dzialCode: '750' },
  { code: '75078', label: 'Usuwanie skutków klęsk żywiołowych', dzialCode: '750' },
  { code: '75079', label: 'Pomoc zagraniczna', dzialCode: '750' },
  { code: '75080', label: 'Działalność badawczo-rozwojowa', dzialCode: '750' },
  { code: '75095', label: 'Pozostała działalność', dzialCode: '750' },

  { code: '80101', label: 'Szkoły podstawowe', dzialCode: '801' },
  { code: '80102', label: 'Szkoły podstawowe specjalne', dzialCode: '801' },
  { code: '80103', label: 'Oddziały przedszkolne w szkołach podstawowych', dzialCode: '801' },
  { code: '80104', label: 'Przedszkola', dzialCode: '801' },
  { code: '80105', label: 'Przedszkola specjalne', dzialCode: '801' },
  { code: '80106', label: 'Inne formy wychowania przedszkolnego', dzialCode: '801' },
  { code: '80107', label: 'Świetlice szkolne', dzialCode: '801' },
  { code: '80108', label: 'Szkoły podstawowe dla dorosłych', dzialCode: '801' },
  { code: '80110', label: 'Gimnazja', dzialCode: '801' },
  { code: '80111', label: 'Gimnazja specjalne', dzialCode: '801' },
  { code: '80113', label: 'Dowożenie uczniów do szkół', dzialCode: '801' },
  { code: '80115', label: 'Technika', dzialCode: '801' },
  { code: '80116', label: 'Szkoły policealne', dzialCode: '801' },
  { code: '80117', label: 'Branżowe szkoły I stopnia', dzialCode: '801' },
  { code: '80118', label: 'Branżowe szkoły II stopnia', dzialCode: '801' },
  { code: '80120', label: 'Licea ogólnokształcące', dzialCode: '801' },
  { code: '80121', label: 'Licea ogólnokształcące specjalne', dzialCode: '801' },
  { code: '80122', label: 'Licea ogólnokształcące dla dorosłych', dzialCode: '801' },
  { code: '80130', label: 'Szkoły zawodowe', dzialCode: '801' },
  { code: '80132', label: 'Szkoły artystyczne', dzialCode: '801' },
  { code: '80134', label: 'Szkoły zawodowe specjalne', dzialCode: '801' },
  { code: '80140', label: 'Placówki kształcenia ustawicznego i centra kształcenia zawodowego', dzialCode: '801' },
  { code: '80146', label: 'Dokształcanie i doskonalenie nauczycieli', dzialCode: '801' },
  { code: '80148', label: 'Stołówki szkolne i przedszkolne', dzialCode: '801' },
  { code: '80149', label: 'Realizacja zadań wymagających stosowania specjalnej organizacji nauki i metod pracy dla dzieci w przedszkolach, oddziałach przedszkolnych w szkołach podstawowych i innych formach wychowania przedszkolnego', dzialCode: '801' },
  { code: '80150', label: 'Realizacja zadań wymagających stosowania specjalnej organizacji nauki i metod pracy dla dzieci i młodzieży w szkołach podstawowych', dzialCode: '801' },
  { code: '80178', label: 'Usuwanie skutków klęsk żywiołowych', dzialCode: '801' },
  { code: '80179', label: 'Pomoc zagraniczna', dzialCode: '801' },
  { code: '80180', label: 'Działalność badawczo-rozwojowa', dzialCode: '801' },
  { code: '80195', label: 'Pozostała działalność', dzialCode: '801' },

  { code: '85111', label: 'Szpitale ogólne', dzialCode: '851' },
  { code: '85112', label: 'Szpitale kliniczne', dzialCode: '851' },
  { code: '85115', label: 'Sanatoria', dzialCode: '851' },
  { code: '85116', label: 'Profilaktyczne domy zdrowia', dzialCode: '851' },
  { code: '85117', label: 'Zakłady opiekuńczo-lecznicze i pielęgnacyjno-opiekuńcze', dzialCode: '851' },
  { code: '85118', label: 'Szpitale uzdrowiskowe', dzialCode: '851' },
  { code: '85120', label: 'Lecznictwo psychiatryczne', dzialCode: '851' },
  { code: '85121', label: 'Lecznictwo ambulatoryjne', dzialCode: '851' },
  { code: '85131', label: 'Lecznictwo stomatologiczne', dzialCode: '851' },
  { code: '85132', label: 'Inspekcja Sanitarna', dzialCode: '851' },
  { code: '85136', label: 'Narodowy Fundusz Zdrowia', dzialCode: '851' },
  { code: '85141', label: 'Ratownictwo medyczne', dzialCode: '851' },
  { code: '85149', label: 'Programy polityki zdrowotnej', dzialCode: '851' },
  { code: '85151', label: 'Świadczenia wysokospecjalistyczne', dzialCode: '851' },
  { code: '85154', label: 'Przeciwdziałanie alkoholizmowi', dzialCode: '851' },
  { code: '85178', label: 'Usuwanie skutków klęsk żywiołowych', dzialCode: '851' },
  { code: '85179', label: 'Pomoc zagraniczna', dzialCode: '851' },
  { code: '85180', label: 'Działalność badawczo-rozwojowa', dzialCode: '851' },
  { code: '85195', label: 'Pozostała działalność', dzialCode: '851' },

  { code: '85202', label: 'Domy pomocy społecznej', dzialCode: '852' },
  { code: '85203', label: 'Ośrodki wsparcia', dzialCode: '852' },
  { code: '85214', label: 'Zasiłki okresowe, celowe i pomoc w naturze oraz składki na ubezpieczenia emerytalne i rentowe', dzialCode: '852' },
  { code: '85215', label: 'Dodatki mieszkaniowe', dzialCode: '852' },
  { code: '85216', label: 'Zasiłki stałe', dzialCode: '852' },
  { code: '85219', label: 'Ośrodki pomocy społecznej', dzialCode: '852' },
  { code: '85228', label: 'Usługi opiekuńcze i specjalistyczne usługi opiekuńcze', dzialCode: '852' },
  { code: '85230', label: 'Pomoc w zakresie dożywiania', dzialCode: '852' },
  { code: '85278', label: 'Usuwanie skutków klęsk żywiołowych', dzialCode: '852' },
  { code: '85279', label: 'Pomoc zagraniczna', dzialCode: '852' },
  { code: '85280', label: 'Działalność badawczo-rozwojowa', dzialCode: '852' },
  { code: '85295', label: 'Pozostała działalność', dzialCode: '852' },

  { code: '85501', label: 'Świadczenie wychowawcze', dzialCode: '855' },
  { code: '85502', label: 'Świadczenia rodzinne, świadczenie z funduszu alimentacyjnego oraz składki na ubezpieczenia emerytalne i rentowe z ubezpieczenia społecznego', dzialCode: '855' },
  { code: '85503', label: 'Karta Dużej Rodziny', dzialCode: '855' },
  { code: '85504', label: 'Wspieranie rodziny', dzialCode: '855' },
  { code: '85508', label: 'Rodziny zastępcze', dzialCode: '855' },
  { code: '85510', label: 'Działalność placówek opiekuńczo-wychowawczych', dzialCode: '855' },
  { code: '85516', label: 'System opieki nad dziećmi w wieku do lat 3', dzialCode: '855' },
  { code: '85578', label: 'Usuwanie skutków klęsk żywiołowych', dzialCode: '855' },
  { code: '85595', label: 'Pozostała działalność', dzialCode: '855' },
];

export function formatBudgetChapter(code: string, label: string): string {
  return `${code} – ${label}`;
}

export function searchBudgetChapters(query: string, dzialCode: string | null): BudgetChapter[] {
  if (!dzialCode) return [];

  const filtered = BUDGET_CHAPTERS.filter(chapter => chapter.dzialCode === dzialCode);

  if (!query) return filtered;

  const lowerQuery = query.toLowerCase();
  return filtered.filter(chapter =>
    chapter.code.includes(lowerQuery) ||
    chapter.label.toLowerCase().includes(lowerQuery)
  );
}

export function parseBudgetChapter(value: string): { code: string; label: string } | null {
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

export function extractDzialCodeFromBudgetDivision(budgetDivision: string): string | null {
  if (!budgetDivision) return null;

  const parsed = budgetDivision.split(' – ')[0];
  return parsed || null;
}
