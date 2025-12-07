import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  convertInchesToTwip,
  VerticalAlign,
  ShadingType,
} from "docx";
// Types for the input data needed to generate the document
export interface BudgetRecord {
  partCode: string; // Część budżetowa (e.g. "27")
  deptCode: string; // Dział (e.g. "750")
  chapterCode: string; // Rozdział (e.g. "75001")
  group: string; // Grupa wydatków (text)
  amount2026: number;
  amount2027: number;
  amount2028: number;
  amount2029: number;
}

export interface BudgetDocData {
  records: BudgetRecord[];
}

export const createBudgetDoc = (data: BudgetDocData): Document => {
  // ... (Logic remains identical)
  // Constants
  const FONT_FAMILY = "Arial";
  // ... (Abbreviated content, I will keep the logic intact but showing intent here)
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
              }
          },
          spacing: {
              after: 200,
          }
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
          spacing: { before: 200 }
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
                  text: "informuję, iż w ramach wskazanego przez Ministra Finansów limitu wydatków budżetu państwa na lata 2026-2029, decyzją Kierownictwa Ministerstwa Cyfryzacji przyznano dla ",
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
      })
  ];


  // --- Table ---
  const tableHeaders = [
      "Część budżetowa",
      "Dział",
      "Rozdział",
      "Grupa wydatków",
      "2026 rok",
      "2027 rok",
      "2028 rok",
      "2029 rok",
  ];

  // Helper for cell creation
  const createCell = (text: string, bold = false, align: any = AlignmentType.LEFT, fill?: string) => {
      return new TableCell({
          verticalAlign: VerticalAlign.CENTER,
          shading: fill ? {
              fill: fill,
              type: ShadingType.CLEAR,
              color: "auto",
          } : undefined,
          children: [
              new Paragraph({
                  alignment: align,
                  children: [
                      new TextRun({
                          text: text,
                          bold: bold,
                          font: FONT_FAMILY,
                          size: bold ? 18 : 20
                      }),
                  ],
              }),
          ],
          margins: {
              top: 100, // Twips
              bottom: 100,
              left: 100,
              right: 100
          }
      });
  };

  const headerRow = new TableRow({
      children: tableHeaders.map((header) =>
          createCell(header, true, AlignmentType.CENTER, HEADER_COLOR)
      ),
  });

  const dataRows = data.records.map((record) => {
      // Amount formatting? Python script had plain strings "45", "2".
      // We accept numbers but should format them. Assuming integers as per "w tys. zł".
      return new TableRow({
          children: [
              createCell(record.partCode, false, AlignmentType.CENTER),
              createCell(record.deptCode, false, AlignmentType.CENTER),
              createCell(record.chapterCode, false, AlignmentType.CENTER),
              createCell(record.group, false, AlignmentType.LEFT),
              createCell(record.amount2026.toString(), false, AlignmentType.RIGHT),
              createCell(record.amount2027.toString(), false, AlignmentType.RIGHT),
              createCell(record.amount2028.toString(), false, AlignmentType.RIGHT),
              createCell(record.amount2029.toString(), false, AlignmentType.RIGHT),
          ],
      });
  });

  // Total
  const total2026 = data.records.reduce((sum, r) => sum + r.amount2026, 0);
  const total2027 = data.records.reduce((sum, r) => sum + r.amount2027, 0);
  const total2028 = data.records.reduce((sum, r) => sum + r.amount2028, 0);
  const total2029 = data.records.reduce((sum, r) => sum + r.amount2029, 0);

  const totalRow = new TableRow({
      children: [
          createCell("x", true, AlignmentType.CENTER, HEADER_COLOR),
          createCell("x", true, AlignmentType.CENTER, HEADER_COLOR),
          createCell("x", true, AlignmentType.CENTER, HEADER_COLOR),
          createCell("OGÓŁEM:", true, AlignmentType.LEFT, HEADER_COLOR),
          createCell(total2026.toString(), true, AlignmentType.RIGHT, HEADER_COLOR),
          createCell(total2027.toString(), true, AlignmentType.RIGHT, HEADER_COLOR),
          createCell(total2028.toString(), true, AlignmentType.RIGHT, HEADER_COLOR),
          createCell(total2029.toString(), true, AlignmentType.RIGHT, HEADER_COLOR),
      ]
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
          spacing: { before: 200, after: 200 }
      }), // Spacer
      new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
                text: "W związku z powyższym, uprzejmie proszę o rozdysponowanie podanych wielkości we wskazanych grupach wydatków na zadania, które powinny zostać sfinansowane w latach 2026-2029, w szczególnych paragrafach klasyfikacji budżetowej.",
                font: FONT_FAMILY,
                size: 22,
            }),
          ]
      })
  ];


  // --- Assemble Document ---
  return new Document({
    sections: [
      {
        properties: {
            page: {
                margin: MARGINS,
            }
        },
        children: [
            ...headerParagraphs,
            ...addressParagraphs,
            ...bodyParagraphs,
            table,
            ...closingParagraphs
        ],
      },
    ],
  });
};

export const generateBudgetDoc = async (data: BudgetDocData) => {
  const doc = createBudgetDoc(data);
  // Generate and Download
  const buffer = await Packer.toBlob(doc);
  // Dynamic import to avoid SSR/Node issues
  const { saveAs } = await import("file-saver");
  saveAs(buffer, "Pismo_Budzetowe.docx");
  return buffer;
};
