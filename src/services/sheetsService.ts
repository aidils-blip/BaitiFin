import { getAccessToken } from './firebase';
import { DebtItem, ExpenseItem, FamilyMember, FinancialHealthMetrics, IncomeItem } from '../types/finance';

export interface SheetExportResult {
  success: boolean;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  error?: string;
}

/**
 * Creates a brand new Google Spreadsheet containing the full family financial plan
 */
export async function exportToGoogleSheets(
  monthLabel: string,
  metrics: FinancialHealthMetrics,
  members: FamilyMember[],
  incomes: IncomeItem[],
  debts: DebtItem[],
  expenses: ExpenseItem[]
): Promise<SheetExportResult> {
  const token = await getAccessToken();
  if (!token) {
    return { success: false, error: 'กรุณาเข้าสู่ระบบ Google เพื่อส่งออกไปยัง Google Sheets' };
  }

  try {
    // 1. Create Spreadsheet
    const title = `HomeFin - แผนการเงินครอบครัว (${monthLabel})`;
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title,
        },
        sheets: [
          { properties: { title: 'สรุปภาพรวม & คาดการณ์' } },
          { properties: { title: 'รายการหนี้สิน' } },
          { properties: { title: 'ช่องทางรายได้' } },
          { properties: { title: 'ค่าใช้จ่ายประจำ' } },
        ],
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Sheets API Error: ${createRes.status}`);
    }

    const sheetData = await createRes.json();
    const spreadsheetId = sheetData.spreadsheetId;
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    // 2. Populate data using batchUpdate values
    const memberMap = new Map(members.map((m) => [m.id, m.name]));

    const summaryValues = [
      ['ระบบจัดการการเงินครอบครัว HomeFin', '', '', ''],
      ['เดือนที่วิเคราะห์', monthLabel, '', ''],
      ['วันที่ส่งออกข้อมูล', new Date().toLocaleString('th-TH'), '', ''],
      ['', '', '', ''],
      ['ตัวชี้วัดสำคัญ (Key Metrics)', 'จำนวนเงิน (บาท)', 'สัดส่วน / สถานะ', 'คำแนะนำ'],
      ['รายรับรวมทั้งหมด', metrics.totalIncome, '100%', 'ช่องทางรายได้ของทุกคนในบ้าน'],
      ['ภาระหนี้สินรวมต่อเดือน', metrics.totalDebts, `${metrics.debtToIncomeRatio.toFixed(1)}% (DTI)`, metrics.debtToIncomeRatio <= 35 ? 'ปลอดภัย' : 'ควรระวัง'],
      ['ค่าใช้จ่ายคงที่จำเป็น', metrics.totalFixedExpenses, `${metrics.fixedRatio.toFixed(1)}%`, 'ค่าน้ำไฟ ประกัน ฯลฯ'],
      ['ค่ากินอยู่และผันแปร', metrics.totalVariableExpenses, '', 'ค่าครองชีพในบ้าน'],
      ['เงินคงเหลือสุทธิ (คาดการณ์)', metrics.netSurplus, metrics.healthLabel, metrics.shortAdvice],
    ];

    const debtValues = [
      ['รายการหนี้สิน', 'ค่างวด/เดือน (บาท)', 'วันครบกำหนด', 'ผู้รับผิดชอบ', 'ยอดหนี้คงเหลือ', 'หมายเหตุ'],
      ...debts.map((d) => [
        d.title,
        d.monthlyAmount,
        `วันที่ ${d.dueDay}`,
        memberMap.get(d.memberId) || 'ส่วนกลาง',
        d.totalPrincipal || '-',
        d.notes || '-',
      ]),
      ['รวมค่างวดหนี้สินทั้งหมด', metrics.totalDebts, '', '', '', ''],
    ];

    const incomeValues = [
      ['แหล่งรายได้', 'จำนวนเงิน (บาท)', 'วันที่คาดว่าจะเข้า', 'ผู้มีรายได้', 'หมายเหตุ'],
      ...incomes.map((inc) => [
        inc.title,
        inc.amount,
        `วันที่ ${inc.expectedDay}`,
        memberMap.get(inc.memberId) || 'ไม่ระบุ',
        inc.notes || '-',
      ]),
      ['รวมรายรับทั้งหมด', metrics.totalIncome, '', '', ''],
    ];

    const expenseValues = [
      ['รายการค่าใช้จ่าย', 'จำนวนเงิน (บาท)', 'ประเภท', 'วันครบกำหนด (ถ้ามี)', 'ผู้รับผิดชอบ', 'หมายเหตุ'],
      ...expenses.map((e) => [
        e.title,
        e.amount,
        e.isFixed ? 'คงที่ (จำเป็น)' : 'ผันแปร/กินอยู่',
        e.dueDay ? `วันที่ ${e.dueDay}` : '-',
        memberMap.get(e.memberId) || 'ส่วนกลาง',
        e.notes || '-',
      ]),
      ['รวมค่าใช้จ่ายทั้งหมด', metrics.totalFixedExpenses + metrics.totalVariableExpenses, '', '', '', ''],
    ];

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          { range: "'สรุปภาพรวม & คาดการณ์'!A1", values: summaryValues },
          { range: "'รายการหนี้สิน'!A1", values: debtValues },
          { range: "'ช่องทางรายได้'!A1", values: incomeValues },
          { range: "'ค่าใช้จ่ายประจำ'!A1", values: expenseValues },
        ],
      }),
    });

    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl,
    };
  } catch (err: any) {
    console.error('Sheets export error:', err);
    return { success: false, error: err.message || 'ส่งออกไปยัง Google Sheets ไม่สำเร็จ' };
  }
}
