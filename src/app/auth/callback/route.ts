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
      // Check allowed emails if configured
      const allowedEmailsStr = process.env.ALLOWED_ADMIN_EMAILS;
      if (allowedEmailsStr) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          const allowedEmails = allowedEmailsStr.split(',').map(e => e.trim().toLowerCase());
          if (!allowedEmails.includes(user.email.toLowerCase())) {
            // Email not allowed -> sign out immediately
            await supabase.auth.signOut();
            return NextResponse.redirect(`${origin}/admin/dang-nhap?error=unauthorized_email`);
          }
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Nếu lỗi → redirect về login
  return NextResponse.redirect(`${origin}/admin/dang-nhap?error=auth_failed`);
}
