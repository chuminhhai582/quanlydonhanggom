import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/sync-config
 * Trả về cấu hình đồng bộ + lịch sử đồng bộ từ Supabase
 */
export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { error: 'Supabase URL is not configured' },
        { status: 500 }
      );
    }

    const supabase = await createAdminClient();

    // Fetch field config
    const { data: fieldConfigs, error: configErr } = await supabase
      .from('sync_field_config')
      .select('*')
      .order('display_order', { ascending: true });

    // Fetch sync logs
    const { data: syncLogs, error: logsErr } = await supabase
      .from('sync_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (configErr) {
      console.error('Sync config query error:', configErr);
    }
    if (logsErr) {
      console.error('Sync logs query error:', logsErr);
    }

    return NextResponse.json({
      fieldConfigs: fieldConfigs || [],
      syncLogs: syncLogs || [],
    });
  } catch (err: any) {
    console.error('API /sync-config error:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi lấy dữ liệu cấu hình đồng bộ' },
      { status: 500 }
    );
  }
}
