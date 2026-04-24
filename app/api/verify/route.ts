import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/waitlist?error=missing_token', request.url));
  }

  const supabase = createServiceClient();

  // Look up the waitlist row with this verification token
  const { data: row, error: selectError } = await supabase
    .from('waitlist')
    .select('id, verified_at')
    .eq('verification_token', token)
    .single();

  if (selectError || !row) {
    return NextResponse.redirect(new URL('/waitlist?error=invalid_token', request.url));
  }

  // If already verified, still redirect to success — idempotent
  if (!row.verified_at) {
    const { error: updateError } = await supabase
      .from('waitlist')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', row.id);

    if (updateError) {
      console.error('verify: failed to update verified_at:', updateError);
      return NextResponse.redirect(new URL('/waitlist?error=server_error', request.url));
    }
  }

  return NextResponse.redirect(new URL('/waitlist/verified', request.url));
}
