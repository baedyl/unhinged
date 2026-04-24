// Setup type definitions for built-in Supabase Runtime APIs
import '@supabase/functions-js/edge-runtime.d.ts';

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface WaitlistRecord {
  id: string;
  email: string;
  neighbourhood: string | null;
  vibe_check: string;
  hot_take: string | null;
  verification_token: string | null;
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: WaitlistRecord;
  old_record: WaitlistRecord | null;
}

/* ─── Email template ────────────────────────────────────────────────────── */
const ORANGE = '#FF7518';

function buildEmailHtml(record: WaitlistRecord, verifyUrl: string): string {
  const hotTakeBlock = record.hot_take
    ? `
    <div style="
      margin: 28px 0;
      padding: 20px 24px;
      background: #1a1a1a;
      border-left: 4px solid ${ORANGE};
      border-radius: 0 8px 8px 0;
    ">
      <p style="color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px;">Your Hot Take</p>
      <p style="color: #fff; font-size: 15px; font-style: italic; margin: 0; line-height: 1.6;">"${record.hot_take}"</p>
    </div>`
    : '';

  const neighbourhoodBadge = record.neighbourhood
    ? `<div style="margin-bottom: 24px;">
        <span style="
          display: inline-block;
          background: ${ORANGE};
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          padding: 4px 12px;
          border-radius: 999px;
        ">&#127960; ${record.neighbourhood}</span>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to the Chaos</title>
</head>
<body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090b;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111113;border:1px solid #27272a;border-radius:16px;overflow:hidden;">

          <!-- Top stripe -->
          <tr>
            <td style="background:${ORANGE};padding:6px 0;text-align:center;">
              <p style="margin:0;color:#fff;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">
                &#128293; You're in. Barely.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">

              <!-- Logo -->
              <p style="margin:0 0 32px;font-size:26px;font-weight:900;letter-spacing:-1px;font-style:italic;">
                <span style="color:${ORANGE};">un</span><span style="color:#fff;">hinged</span>
              </p>

              <!-- Headline -->
              <h1 style="color:#fff;font-size:32px;font-weight:900;line-height:1.15;margin:0 0 16px;letter-spacing:-0.5px;">
                Welcome to<br/>the Chaos &#127754;
              </h1>

              <p style="color:#a1a1aa;font-size:15px;line-height:1.7;margin:0 0 8px;">
                You stumbled in, signed up, and now you're one of us. The unhinged ones.
                Before we let you fully loose in the neighbourhood, confirm your email so we know
                you're a real human with real problems (and not a bot with unresolved attachment issues).
              </p>

              ${neighbourhoodBadge}
              ${hotTakeBlock}

              <!-- CTA -->
              <div style="text-align:center;margin:32px 0;">
                <a href="${verifyUrl}" style="
                  display:inline-block;
                  background:${ORANGE};
                  color:#fff;
                  text-decoration:none;
                  font-size:15px;
                  font-weight:800;
                  letter-spacing:0.5px;
                  padding:16px 40px;
                  border-radius:10px;
                ">
                  &#9989; Verify My Email
                </a>
              </div>

              <p style="color:#52525b;font-size:12px;text-align:center;margin:0 0 12px;">
                Button not working? Copy and paste this link:
              </p>
              <p style="word-break:break-all;background:#18181b;border:1px solid #3f3f46;border-radius:6px;padding:10px 14px;font-size:11px;color:${ORANGE};margin:0 0 32px;">
                ${verifyUrl}
              </p>

              <hr style="border:none;border-top:1px solid #27272a;margin:0 0 24px;" />

              <p style="color:#3f3f46;font-size:11px;line-height:1.6;margin:0;">
                If you didn't sign up for unhinged, feel free to ignore this email.
                We'll be mildly offended but we'll survive.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0c0c0e;border-top:1px solid #27272a;padding:20px 40px;text-align:center;">
              <p style="color:#3f3f46;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0;">
                UNHINGED &middot; MONTREAL &middot; EST. 2025
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ─── Handler ───────────────────────────────────────────────────────────── */
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch (e) {
    console.error('welcome-email: failed to parse JSON body', e);
    return new Response('Bad Request: invalid JSON', { status: 400 });
  }

  console.log('welcome-email: received', payload.type, payload.table);

  // Only handle INSERT on the waitlist table
  if (payload.type !== 'INSERT' || payload.table !== 'waitlist') {
    console.log('welcome-email: ignoring non-INSERT or wrong table');
    return new Response(JSON.stringify({ ignored: true }), { status: 200 });
  }

  const record = payload.record;

  if (!record?.email) {
    console.error('welcome-email: record missing email', record);
    return new Response('Bad Request: missing email in record', { status: 400 });
  }

  if (!record.verification_token) {
    console.error('welcome-email: record missing verification_token — was the migration applied?');
    return new Response('Bad Request: missing verification_token in record', { status: 400 });
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const siteUrl = (Deno.env.get('SITE_URL') ?? '').replace(/\/$/, '');

  if (!resendApiKey) {
    console.error('welcome-email: RESEND_API_KEY secret is not set');
    return new Response('Internal Server Error: RESEND_API_KEY not configured', { status: 500 });
  }

  if (!siteUrl) {
    console.error('welcome-email: SITE_URL secret is not set');
    return new Response('Internal Server Error: SITE_URL not configured', { status: 500 });
  }

  const verifyUrl = `${siteUrl}/api/verify?token=${record.verification_token}`;
  console.log('welcome-email: sending to', record.email, 'verify url:', verifyUrl);

  const htmlBody = buildEmailHtml(record, verifyUrl);

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'unhinged <no-reply@unhinged.app>',
      to: [record.email],
      subject: '🔥 Welcome to the Chaos — Confirm your spot',
      html: htmlBody,
    }),
  });

  const resendBody = await resendRes.json();

  if (!resendRes.ok) {
    console.error('welcome-email: Resend error', resendRes.status, JSON.stringify(resendBody));
    return new Response('Internal Server Error: failed to send email', { status: 500 });
  }

  console.log('welcome-email: email sent, id', resendBody.id);
  return new Response(JSON.stringify({ success: true, emailId: resendBody.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
