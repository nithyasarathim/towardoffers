import { NextResponse } from "next/server";

function getAppUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}

function getGoogleRedirectUri() {
  return process.env.GOOGLE_REDIRECT_URI || `${getAppUrl()}/api/auth/google/callback`;
}

export async function GET() {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: "Missing GOOGLE_CLIENT_ID in .env" }, { status: 500 });
  }

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
    state,
  });

  const response = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  response.cookies.set("towardsoffer_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: getAppUrl().startsWith("https://"),
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
