import { NextResponse } from 'next/server';

/**
 * GET /api/open-sheet
 * Redirects to the configured Google Sheet URL.
 */
export async function GET() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  
  if (sheetId) {
    return NextResponse.redirect(`https://docs.google.com/spreadsheets/d/${sheetId}/edit`);
  }
  
  // Fallback if not configured
  return NextResponse.redirect('https://docs.google.com/spreadsheets');
}
