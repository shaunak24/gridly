import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

import { corsHeaders } from '../_shared/cors.ts';
import { buildAndroidIntentUrl, buildAppDeepLink } from '../_shared/deepLink.ts';
import { detectClientPlatform, isLinkPreviewCrawler } from '../_shared/inviteClient.ts';
import { buildInviteUrl } from '../_shared/inviteLink.ts';
import { buildFallbackUrl, renderLandingPage, renderNotFoundPage } from '../_shared/landingPage.ts';

const htmlResponseHeaders: Record<string, string> = {
  ...corsHeaders,
  'Content-Type': 'text/html; charset=utf-8',
  'Content-Disposition': 'inline',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store',
};

function htmlResponse(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: htmlResponseHeaders,
  });
}

function redirectResponse(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      ...corsHeaders,
      Location: location,
      'Cache-Control': 'no-store',
    },
  });
}

function parseInviteId(url: URL): string | null {
  const queryId = url.searchParams.get('id')?.trim();
  if (queryId) {
    return queryId;
  }

  const segments = url.pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  if (!lastSegment || lastSegment === 'resolve-invite') {
    return null;
  }

  return decodeURIComponent(lastSegment);
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // HEAD is allowed so link-preview crawlers do not see a 405.
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const inviteId = parseInviteId(url);
  if (!inviteId) {
    return htmlResponse(renderNotFoundPage(), 404);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return htmlResponse(renderNotFoundPage(), 500);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await adminClient
    .from('game_invites')
    .select('id, game_id, expires_at')
    .eq('id', inviteId)
    .maybeSingle();

  if (error || !data) {
    return htmlResponse(renderNotFoundPage(), 404);
  }

  if (data.expires_at && new Date(data.expires_at) <= new Date()) {
    return htmlResponse(renderNotFoundPage(), 404);
  }

  // Never derive this from request.url — inside the edge runtime that is
  // `http://<ref>.supabase.co/resolve-invite/<id>`: wrong scheme, no /functions/v1.
  const canonicalUrl = buildInviteUrl(supabaseUrl, data.id, Deno.env.get('INVITE_LINK_BASE'));

  const userAgent = request.headers.get('user-agent') ?? '';
  const showFallbackState = url.searchParams.get('fallback') === '1';
  const clientPlatform = detectClientPlatform(userAgent);
  const linkPreview = isLinkPreviewCrawler(userAgent);

  // Phone browsers: skip the HTML interstitial entirely. Some clients mishandle the
  // document (show raw markup as text); a 302 to intent:// or gridly:// opens the app directly.
  // Chat link previews and ?fallback=1 still get the branded HTML page.
  if (
    request.method === 'GET' &&
    !showFallbackState &&
    !linkPreview &&
    (clientPlatform === 'android' || clientPlatform === 'ios')
  ) {
    if (clientPlatform === 'android') {
      return redirectResponse(
        buildAndroidIntentUrl(
          data.game_id,
          data.id,
          buildFallbackUrl(canonicalUrl),
        ),
      );
    }
    return redirectResponse(buildAppDeepLink(data.game_id, data.id));
  }

  const landingHtml = renderLandingPage({
    inviteId: data.id,
    gameId: data.game_id,
    canonicalUrl,
    clientPlatform,
    showFallbackState,
    ogImageUrl: Deno.env.get('INVITE_OG_IMAGE_URL'),
    storeLinks: {
      ios: Deno.env.get('INVITE_STORE_URL_IOS'),
      android: Deno.env.get('INVITE_STORE_URL_ANDROID'),
    },
  });

  if (request.method === 'HEAD') {
    return new Response(null, { status: 200, headers: htmlResponseHeaders });
  }

  return htmlResponse(landingHtml, 200);
});
