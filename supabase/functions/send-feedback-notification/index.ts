import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FEEDBACK_TO_EMAIL = Deno.env.get('FEEDBACK_TO_EMAIL');

interface FeedbackPayload {
  type: 'INSERT';
  table: string;
  record: {
    id: string;
    type: 'feedback' | 'bug';
    message: string;
    contact_email: string | null;
    app_version: string | null;
    platform: string | null;
    user_id: string | null;
    created_at: string;
  };
}

serve(async (request) => {
  if (!RESEND_API_KEY || !FEEDBACK_TO_EMAIL) {
    return new Response(
      JSON.stringify({ ok: false, message: 'Email secrets are not configured.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const payload = (await request.json()) as FeedbackPayload;
  const record = payload.record;
  const subject =
    record.type === 'bug' ? `Gridly bug report (${record.platform ?? 'unknown'})` : 'Gridly feedback';

  const body = [
    `Type: ${record.type}`,
    `Message: ${record.message}`,
    `Contact: ${record.contact_email ?? 'not provided'}`,
    `App version: ${record.app_version ?? 'unknown'}`,
    `Platform: ${record.platform ?? 'unknown'}`,
    `User ID: ${record.user_id ?? 'guest'}`,
    `Submitted: ${record.created_at}`,
  ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Gridly <onboarding@resend.dev>',
      to: [FEEDBACK_TO_EMAIL],
      subject,
      text: body,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return new Response(JSON.stringify({ ok: false, message: errorText }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
