export type MemberRole = 'head' | 'spouse' | 'household' | 'other';

export type MemberIconType = 'user' | 'heart' | 'home' | 'users' | 'smile';

export interface FamilyMember {
  id: string;
  name: string;
  role: MemberRole;
  roleLabel: string;
  avatarColor: string;
  avatarIcon: MemberIconType;
}

export type IncomeCategory =
  | 'salary'        // เงินเดือนประจำ
  | 'freelance'     // ฟรีแลนซ์/รับจ้าง
  | 'business'      // ธุรกิจ/ขายของ
  | 'bonus'         // โบนัส/คอมมิชชั่น
  | 'investment'    // ปันผล/กำไรการลงทุนฮาลาล
  | 'allowance'     // เงินสนับสนุน/คนในบ้าน
  | 'other';        // อื่นๆ

export interface IncomeItem {
  id: string;
  title: string;
  amount: number;
  category: IncomeCategory;
  memberId: string;
  expectedDay: number; // 1-31
  isRecurring: boolean; // เข้าทุกเดือน
  notes?: string;
}

export type DebtCategory =
  | 'home'          // ผ่อนบ้าน/คอนโด (มุรอบะฮะฮ์)
  | 'car'           // ผ่อนรถยนต์/มอเตอร์ไซค์ (อิญาเราะฮ์)
  | 'credit_card'   // ผ่อนบัตร/สินค้า 0%
  | 'personal_loan' // สินเชื่อ/การเงินร่วม
  | 'student_loan'  // ยืมเรียน/กยศ.
  | 'informal'      // ยืมญาติ/คนรู้จัก (ยืมตามหลักการ์ดฮะซัน/ปลอดริบา)
  | 'other';        // อื่นๆ

export interface DebtItem {
  id: string;
  title: string;
  monthlyAmount: number;     // ค่างวดต่อเดือน
  totalPrincipal?: number;   // ยอดคงเหลือรวม (optional)
  interestRate?: number;     // อัตรากำไร % ต่อปี (Profit Rate)
  dueDay: number;            // วันครบกำหนดจ่าย (1-31)
  category: DebtCategory;
  memberId: string;
  calendarEventId?: string;  // ID ของ Google Calendar event
  reminderDaysBefore: number;// แจ้งเตือนล่วงหน้ากี่วัน (default 1)
  paidMonths: string[];      // รายการเดือนที่จ่ายแล้ว เช่น ["2026-10", "2026-11"]
  notes?: string;
}

export type ExpenseCategory =
  | 'utilities'      // ค่าน้ำ ค่าไฟ อินเทอร์เน็ต ค่าโทรศัพท์
  | 'food'           // ค่ากินอยู่ อาหาร
  | 'living'         // ของใช้ในบ้าน ซูเปอร์มาร์เก็ต
  | 'travel'         // เดินทาง ค่าน้ำมัน ทางด่วน
  | 'education'      // ค่าเทอมลูก การศึกษา
  | 'insurance'      // ประกันชีวิต/สุขภาพ/รถ
  | 'medical'        // สุขภาพ ยา
  | 'shopping'       // ช้อปปิ้ง บันเทิง
  | 'savings'        // เงินออมฉุกเฉิน / ลงทุน
  | 'other';

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  isFixed: boolean;          // ค่าใช้จ่ายคงที่ หรือ ผันแปร
  dueDay?: number;           // วันครบกำหนดจ่าย (ถ้ามี)
  memberId: string;
  paidMonths: string[];      // รายการเดือนที่จ่ายแล้ว เช่น ["2026-10"]
  notes?: string;
}

export interface FinancialHealthMetrics {
  totalIncome: number;
  totalDebts: number;
  totalFixedExpenses: number;
  totalVariableExpenses: number;
  totalCommittedExpenses: number; // debts + fixed
  netSurplus: number;             // เงินคงเหลือสุทธิ (Income - Debts - All Expenses)
  debtToIncomeRatio: number;      // % (Debts / Income)
  fixedRatio: number;             // % (Committed / Income)
  healthStatus: 'healthy' | 'moderate' | 'warning' | 'danger';
  healthLabel: string;
  shortAdvice: string;
}
