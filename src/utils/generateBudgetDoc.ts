import {
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
  Document,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";
import { BudgetItem } from "../mockData";

// Types for the input data needed to generate the document
export interface BudgetRecord {
  partCode: string; // Część budżetowa (e.g. "27")
  deptCode: string; // Dział (e.g. "750")
  chapterCode: string; // Rozdział (e.g. "75001")
  group: string; // Grupa wydatków (text)
  amounts: { [year: number]: number }; // Kwoty dla różnych lat (dynamiczne)
}

export interface BudgetDocData {
  records: BudgetRecord[];
  years: number[]; // Lata występujące w danych (np. [2024, 2025, 2026])
}

/**
 * Wyciąga kod z formatu "XX – Opis" lub "XX/YY – Opis"
 */
function extractCode(value: string): string {
  if (!value) return "";
  const match = value.match(/^([0-9/]+)/);
  return match ? match[1].split("/")[0] : "";
}

/**
 * Przekształca BudgetItem[] na { records, years }
 * Grupuje pozycje po części budżetowej, dziale, rozdziale i kategorii
 * Automatycznie wykrywa lata występujące w danych i sumuje kwoty
 * UWAGA: Zakłada, że kwoty w bazie są już w odpowiedniej jednostce (tys. zł)
 */
export function transformBudgetItemsToRecords(items: BudgetItem[]): {
  records: BudgetRecord[];
  years: number[];
} {
  // Zbierz wszystkie unikalne lata z danych
  const yearsSet = new Set<number>();
  items.forEach((item) => {
    yearsSet.add(item.year);
  });
  const years = Array.from(yearsSet).sort((a, b) => a - b);

  // Mapowanie: klucz -> kwoty dla różnych lat
  const grouped = new Map<string, { [year: number]: number }>();

  items.forEach((item) => {
    const partCode = extractCode(item.budgetSection);
    const deptCode = extractCode(item.budgetDivision);
    const chapterCode = extractCode(item.budgetChapter);
    const group = item.category || "";

    // Klucz do grupowania
    const key = `${partCode}|${deptCode}|${chapterCode}|${group}`;

    if (!grouped.has(key)) {
      const amounts: { [year: number]: number } = {};
      years.forEach((year) => {
        amounts[year] = 0;
      });
      grouped.set(key, amounts);
    }

    const amounts = grouped.get(key)!;

    // Przypisanie kwoty do odpowiedniego roku na podstawie pola year z bazy danych
    // Upewniamy się, że amount jest liczbą
    // ZAWSZE używamy amount (kwota wnioskowana), NIE limitAmount (kwota przyznana)
    const itemAmount =
      typeof item.amount === "number" ? item.amount : Number(item.amount) || 0;

    // Konwersja z PLN na tys. zł (dzielenie przez 1000)
    amounts[item.year] += itemAmount / 1000;
  });

  // Konwersja mapy na tablicę BudgetRecord
  const records: BudgetRecord[] = [];
  grouped.forEach((amounts, key) => {
    const [partCode, deptCode, chapterCode, group] = key.split("|");

    // Zaokrąglenie do liczb całkowitych
    const finalAmounts: { [year: number]: number } = {};
    years.forEach((year) => {
      finalAmounts[year] = Math.round(amounts[year]);
    });

    // Debug: loguj wartości (tylko jeśli przynajmniej jedna kwota jest niezerowa)
    const hasNonZero = Object.values(finalAmounts).some((v) => v > 0);
    if (hasNonZero) {
      console.log("Transformacja kwot:", {
        key,
        partCode,
        deptCode,
        chapterCode,
        group,
        "Kwoty (w tys. zł)": finalAmounts,
      });
    }

    records.push({
      partCode,
      deptCode,
      chapterCode,
      group,
      amounts: finalAmounts,
    });
  });

  // Sortowanie: część budżetowa -> dział -> rozdział -> grupa
  records.sort((a, b) => {
    if (a.partCode !== b.partCode) return a.partCode.localeCompare(b.partCode);
    if (a.deptCode !== b.deptCode) return a.deptCode.localeCompare(b.deptCode);
    if (a.chapterCode !== b.chapterCode)
      return a.chapterCode.localeCompare(b.chapterCode);
    return a.group.localeCompare(b.group);
  });

  return { records, years };
}

export const createBudgetDoc = (data: BudgetDocData): Document => {
  const years = data.years || [];
  // Constants
  const FONT_FAMILY = "Arial";
  const MARGINS = {
    top: convertInchesToTwip(0.98), // ~2.5cm
    bottom: convertInchesToTwip(0.98),
    left: convertInchesToTwip(0.98),
    right: convertInchesToTwip(0.98),
  };
  const HEADER_COLOR = "E2EFDA"; // Light green

  // --- Header ---
  const headerParagraphs = [
    new Paragraph({
      children: [
        new TextRun({
          text: "Minister",
          bold: true,
          font: FONT_FAMILY,
          size: 28, // 14pt (docx uses half-points, so 28)
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Cyfryzacji",
          bold: true,
          font: FONT_FAMILY,
          size: 28,
        }),
      ],
      border: {
        bottom: {
          color: "FF0000",
          space: 5,
          style: BorderStyle.SINGLE,
          size: 12, // width of the line
        },
      },
      spacing: {
        after: 200,
      },
    }),
    // "Nr sprawy..."
    new Paragraph({
      children: [
        new TextRun({
          text: "Nr sprawy w EZD",
          font: FONT_FAMILY,
          size: 22, // 11pt
        }),
      ],
      spacing: { before: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Warszawa, data podpisu r.", // Sic: "data podpisu r." from python script/image
          font: FONT_FAMILY,
          size: 22,
        }),
      ],
    }),
  ];

  // --- Address ---
  const addressParagraphs = [
    new Paragraph({
      children: [
        new TextRun({
          text: "Pan",
          bold: true,
          font: FONT_FAMILY,
          size: 22,
          break: 2, // Add some newlines before
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Jan Kowalski",
          bold: true,
          font: FONT_FAMILY,
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Dyrektor Departamentu A",
          bold: true,
          font: FONT_FAMILY,
          size: 22,
        }),
      ],
      spacing: { after: 400 },
    }),
  ];

  // --- Greeting & Body ---
  const bodyParagraphs = [
    new Paragraph({
      children: [
        new TextRun({
          text: "Szanowny Panie Dyrektorze,",
          italics: true,
          font: FONT_FAMILY,
          size: 22,
        }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: `informuję, iż w ramach wskazanego przez Ministra Finansów limitu wydatków budżetu państwa na lata ${
            years.length > 0 ? years.join("-") : "2026-2029"
          }, decyzją Kierownictwa Ministerstwa Cyfryzacji przyznano dla `,
          font: FONT_FAMILY,
          size: 22,
        }),
        new TextRun({
          text: "DK",
          bold: true,
          font: FONT_FAMILY,
          size: 22,
        }),
        new TextRun({
          text: " następujący limit wydatków w poszczególnych grupach wydatków:",
          font: FONT_FAMILY,
          size: 22,
        }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: "w tys. zł",
          italics: true,
          font: FONT_FAMILY,
          size: 18, // 9pt
        }),
      ],
      spacing: { after: 100 },
    }),
  ];

  // --- Table ---
  const tableHeaders = [
    "Część budżetowa",
    "Dział",
    "Rozdział",
    "Grupa wydatków",
    ...years.map((year) => `${year} rok`),
  ];

  // Helper for cell creation
  const createCell = (
    text: string,
    bold = false,
    align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT,
    fill?: string
  ) => {
    return new TableCell({
      verticalAlign: VerticalAlign.CENTER,
      shading: fill
        ? {
            fill: fill,
            type: ShadingType.CLEAR,
            color: "auto",
          }
        : undefined,
      children: [
        new Paragraph({
          alignment: align,
          children: [
            new TextRun({
              text: text,
              bold: bold,
              font: FONT_FAMILY,
              size: bold ? 18 : 20,
            }),
          ],
        }),
      ],
      margins: {
        top: 100, // Twips
        bottom: 100,
        left: 100,
        right: 100,
      },
    });
  };

  const headerRow = new TableRow({
    children: tableHeaders.map((header) =>
      createCell(header, true, AlignmentType.CENTER, HEADER_COLOR)
    ),
  });

  const dataRows = data.records.map((record) => {
    return new TableRow({
      children: [
        createCell(record.partCode, false, AlignmentType.CENTER),
        createCell(record.deptCode, false, AlignmentType.CENTER),
        createCell(record.chapterCode, false, AlignmentType.CENTER),
        createCell(record.group, false, AlignmentType.LEFT),
        ...years.map((year) =>
          createCell(
            (record.amounts[year] || 0).toString(),
            false,
            AlignmentType.RIGHT
          )
        ),
      ],
    });
  });

  // Total - oblicz sumy dla każdego roku
  const totals: { [year: number]: number } = {};
  years.forEach((year) => {
    totals[year] = data.records.reduce(
      (sum, r) => sum + (r.amounts[year] || 0),
      0
    );
  });

  const totalRow = new TableRow({
    children: [
      createCell("x", true, AlignmentType.CENTER, HEADER_COLOR),
      createCell("x", true, AlignmentType.CENTER, HEADER_COLOR),
      createCell("x", true, AlignmentType.CENTER, HEADER_COLOR),
      createCell("OGÓŁEM:", true, AlignmentType.LEFT, HEADER_COLOR),
      ...years.map((year) =>
        createCell(
          totals[year].toString(),
          true,
          AlignmentType.RIGHT,
          HEADER_COLOR
        )
      ),
    ],
  });

  const table = new Table({
    rows: [headerRow, ...dataRows, totalRow],
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
  });

  // --- Closing ---
  const closingParagraphs = [
    new Paragraph({
      text: "",
      spacing: { before: 200, after: 200 },
    }), // Spacer
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: `W związku z powyższym, uprzejmie proszę o rozdysponowanie podanych wielkości we wskazanych grupach wydatków na zadania, które powinny zostać sfinansowane w latach ${
            years.length > 0 ? years.join("-") : "2026-2029"
          }, w szczególnych paragrafach klasyfikacji budżetowej.`,
          font: FONT_FAMILY,
          size: 22,
        }),
      ],
    }),
  ];

  // --- Assemble Document ---
  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: MARGINS,
          },
        },
        children: [
          ...headerParagraphs,
          ...addressParagraphs,
          ...bodyParagraphs,
          table,
          ...closingParagraphs,
        ],
      },
    ],
  });
};

export const generateBudgetDoc = async (data: BudgetDocData) => {
  const doc = createBudgetDoc(data);
  // Generate and Download
  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, "Pismo_Budzetowe.docx");
  return buffer;
};
