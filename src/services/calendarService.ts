import { getAccessToken } from './firebase';
import { DebtItem } from '../types/finance';

export interface CalendarSyncResult {
  success: boolean;
  eventId?: string;
  error?: string;
}

/**
 * Creates or updates a bill/debt payment event on the user's Google Calendar
 */
export async function addDebtPaymentToCalendar(
  debt: DebtItem,
  targetYear: number,
  targetMonth: number // 1-12
): Promise<CalendarSyncResult> {
  const token = await getAccessToken();
  if (!token) {
    return { success: false, error: 'กรุณาเข้าสู่ระบบ Google ก่อนซิงค์ปฏิทิน' };
  }

  try {
    // Format target date (handling month boundaries, e.g. day 31 in short months)
    const lastDayOfMonth = new Date(targetYear, targetMonth, 0).getDate();
    const actualDay = Math.min(debt.dueDay, lastDayOfMonth);
    const dateStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(actualDay).padStart(2, '0')}`;

    const reminderMinutes = (debt.reminderDaysBefore || 1) * 24 * 60; // e.g. 1 day before = 1440 min

    const eventPayload = {
      summary: `[จ่ายหนี้] ${debt.title} - ${debt.monthlyAmount.toLocaleString()} บ.`,
      description: `การแจ้งเตือนจากระบบ HomeFin:\nรายการ: ${debt.title}\nยอดที่ต้องชำระ: ${debt.monthlyAmount.toLocaleString()} บาท\nวันครบกำหนด: วันที่ ${actualDay} ของเดือน\nยอดคงเหลือรวม: ${debt.totalPrincipal ? debt.totalPrincipal.toLocaleString() + ' บาท' : 'ไม่ระบุ'}\nบันทึก: ${debt.notes || '-'}\n(สร้างโดย HomeFin - ระบบการเงินครอบครัว)`,
      start: {
        dateTime: `${dateStr}T09:00:00+07:00`,
        timeZone: 'Asia/Bangkok',
      },
      end: {
        dateTime: `${dateStr}T10:00:00+07:00`,
        timeZone: 'Asia/Bangkok',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: reminderMinutes }, // แจ้งเตือนล่วงหน้า 1-2 วัน
          { method: 'popup', minutes: 60 },              // แจ้งเตือนซ้ำเช้าวันจ่าย 1 ชั่วโมงก่อน
        ],
      },
      colorId: '11', // Red / bold alert color in Google Calendar
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Google Calendar API error: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, eventId: data.id };
  } catch (err: any) {
    console.error('Calendar add error:', err);
    return { success: false, error: err.message || 'ไม่สามารถเพิ่มลงปฏิทินได้' };
  }
}

/**
 * Removes an event from Google Calendar (Requires token)
 */
export async function removeEventFromCalendar(eventId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token || !eventId) return false;

  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.ok || res.status === 404; // 404 means already deleted
  } catch (err) {
    console.error('Failed to remove event from Calendar:', err);
    return false;
  }
}
