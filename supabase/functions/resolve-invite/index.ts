import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

import { buildAppDeepLink } from '../_shared/deepLink.ts';
import { corsHeaders } from '../_shared/cors.ts';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parseInviteId(request: Request): string | null {
  const url = new URL(request.url);
  const queryId = url.searchParams.get('id')?.trim();
  if (queryId) {
    return queryId;
  }

  const segments = url.pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  if (!lastSegment || lastSegment === 'resolve-invite') {
    return null;
  }

  return lastSegment;
}

function renderLandingPage(inviteId: string, gameId: string): string {
  const deepLink = escapeHtml(buildAppDeepLink(gameId, inviteId));
  const title = gameId === 'word-hunt' ? 'Can you guess my Gridly word?' : 'Open this puzzle in Gridly';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Gridly</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #1e1b2e;
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 24px;
      }
      main {
        max-width: 420px;
        text-align: center;
      }
      h1 {
        font-size: 1.5rem;
        margin-bottom: 0.75rem;
      }
      p {
        color: #cbd5e1;
        line-height: 1.5;
      }
      a.button {
        display: inline-block;
        margin-top: 1.5rem;
        padding: 0.85rem 1.25rem;
        border-radius: 10px;
        background: #f97316;
        color: #1e1b2e;
        font-weight: 700;
        text-decoration: none;
      }
    </style>
    <script>
      window.addEventListener('DOMContentLoaded', function () {
        window.location.href = '${deepLink}';
      });
    </script>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(title)}</h1>
      <p>Opening Gridly…</p>
      <a class="button" href="${deepLink}">Open in Gridly</a>
      <p>If nothing happens, install Gridly on your phone and try again.</p>
    </main>
  </body>
</html>`;
}

function renderNotFoundPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Gridly</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #1e1b2e;
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 24px;
      }
      main { max-width: 420px; text-align: center; }
      p { color: #cbd5e1; line-height: 1.5; }
    </style>
  </head>
  <body>
    <main>
      <h1>Puzzle not found</h1>
      <p>This invite link is invalid or has expired.</p>
    </main>
  </body>
</html>`;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const inviteId = parseInviteId(request);
  if (!inviteId) {
    return new Response(renderNotFoundPage(), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(renderNotFoundPage(), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await adminClient
    .from('game_invites')
    .select('id, game_id, expires_at')
    .eq('id', inviteId)
    .maybeSingle();

  if (error || !data) {
    return new Response(renderNotFoundPage(), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  if (data.expires_at && new Date(data.expires_at) <= new Date()) {
    return new Response(renderNotFoundPage(), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  return new Response(renderLandingPage(data.id, data.game_id), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
  });
});
