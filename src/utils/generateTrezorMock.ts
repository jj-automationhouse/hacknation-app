import { BudgetItem } from "../mockData";

export function generateTrezorXml(budgetItems: BudgetItem[]): string {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  // Header part of the XML
  let xml = `<?xml version="1.0"?>
<ns:TREZOR3_REP_ITF xmlns:ns="http://trezor.mf.gov.pl/ReportsSchema">
 <TREZOR3_REP_ITF_LINE>
  <PROCESS_CODE>RB28WPRUE.REP</PROCESS_CODE>
  <PROCESS_STAGE_CODE>RB28WPRUE.REP.VAL</PROCESS_STAGE_CODE>
  <ENTITY_TYPE>TR</ENTITY_TYPE>
  <ENTITY_ID>19484</ENTITY_ID>
  <ENTITY_NAME>33 - DF MRiRW </ENTITY_NAME>
  <PART>33</PART>
  <SYMBOL>-</SYMBOL>
  <YEAR>${new Date().getFullYear()}</YEAR>
  <CUSTOM_VERSION_KEY_COMPONENT>M01.${new Date().getFullYear()}</CUSTOM_VERSION_KEY_COMPONENT>
  <DESCRIPTION>wer. 1 @ ${timestamp}</DESCRIPTION>
  <BALANCE>
`;

  // Generate rows for each budget item
  budgetItems.forEach(item => {
    // Extract chapter code (e.g. "80101" from "80101 – Szkoły podstawowe")
    // If format is different, fallback to empty string or full string
    const chapterMatch = item.budgetChapter.match(/^(\d+)/);
    const chapterCode = chapterMatch ? chapterMatch[1] : "00000";

    // Extract section (e.g. "30" from "30 – Oświata i wychowanie")
    const sectionMatch = item.budgetSection.match(/^(\d+)/);
    const sectionCode = sectionMatch ? sectionMatch[1] : "00";

    // Extract division (e.g. "801" from "801 – Oświata i wychowanie")
    const divisionMatch = item.budgetDivision.match(/^(\d+)/);
    const divisionCode = divisionMatch ? divisionMatch[1] : "000";

    xml += `   <BALANCE_ROW>
    <CHAPTER_CODE>RB28WPRUE.P</CHAPTER_CODE>
    <UATTRIBUTE01>RB28WPRUE.P.1</UATTRIBUTE01>
    <UATTRIBUTE02>WPR</UATTRIBUTE02>
    <UATTRIBUTE03>PROW_2014-2020</UATTRIBUTE03>
    <UATTRIBUTE05>${sectionCode}</UATTRIBUTE05>
    <UATTRIBUTE06>${divisionCode}</UATTRIBUTE06>
    <UATTRIBUTE07>${chapterCode}</UATTRIBUTE07>
    <UATTRIBUTE08>7</UATTRIBUTE08>
    <UATTRIBUTE09>2007</UATTRIBUTE09>
    <UATTRIBUTE10>1</UATTRIBUTE10>
    <AMOUNT01>0.00</AMOUNT01>
    <AMOUNT02>${item.amount.toFixed(2)}</AMOUNT02>
    <AMOUNT03>0.00</AMOUNT03>
   </BALANCE_ROW>
`;
  });

  // Footer part
  xml += `  </BALANCE>
 </TREZOR3_REP_ITF_LINE>
</ns:TREZOR3_REP_ITF>`;

  return xml;
}
