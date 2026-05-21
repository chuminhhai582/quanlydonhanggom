import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /auth/callback
 * Xử lý redirect sau khi Google OAuth đăng nhập thành công.
 * Supabase gửi code → ta đổi code lấy session.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Nếu lỗi → redirect về login
  return NextResponse.redirect(`${origin}/admin/dang-nhap?error=auth_failed`);
}
