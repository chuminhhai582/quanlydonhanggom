import { google, sheets_v4 } from 'googleapis';

// Khởi tạo Google Sheets API client từ Service Account
function getAuthClient() {
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error('Missing Google Sheets credentials. Set GOOGLE_SHEETS_PRIVATE_KEY and GOOGLE_SHEETS_CLIENT_EMAIL');
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export function getSheetsClient(): sheets_v4.Sheets {
  const auth = getAuthClient();
  return google.sheets({ version: 'v4', auth });
}

export function getSheetId(): string {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error('Missing GOOGLE_SHEET_ID environment variable');
  return id;
}

// ---- Helpers đọc/ghi Sheet ----

/** Đọc toàn bộ dữ liệu từ 1 tab */
export async function readSheetTab(tabName: string): Promise<string[][]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range: `${tabName}!A:Z`,
  });
  return (res.data.values || []) as string[][];
}

/** Ghi toàn bộ dữ liệu vào 1 tab (xóa cũ, ghi mới) */
export async function writeSheetTab(tabName: string, rows: string[][]): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSheetId();

  // Xóa data cũ
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${tabName}!A:Z`,
  });

  // Ghi data mới
  if (rows.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tabName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows },
    });
  }
}

/** Thêm dòng vào cuối tab */
export async function appendSheetRows(tabName: string, rows: string[][]): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSheetId(),
    range: `${tabName}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows },
  });
}

/** Đảm bảo tab tồn tại, nếu chưa thì tạo mới */
export async function ensureTabExists(tabName: string): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSheetId();

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const existingTabs = spreadsheet.data.sheets?.map(s => s.properties?.title) || [];

  if (!existingTabs.includes(tabName)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: { properties: { title: tabName } }
        }]
      }
    });
  }
}
