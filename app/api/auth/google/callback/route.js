import { NextResponse } from "next/server";

function getAppUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}

function getGoogleRedirectUri() {
  return process.env.GOOGLE_REDIRECT_URI || `${getAppUrl()}/api/auth/google/callback`;
}

function encodeSession(user) {
  return Buffer.from(JSON.stringify(user)).toString("base64url");
}

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = request.cookies.get("towardsoffer_oauth_state")?.value;

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${getAppUrl()}/login?error=oauth_state`);
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(`${getAppUrl()}/login?error=google_env`);
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: getGoogleRedirectUri(),
    }),
  });

  if (!tokenResponse.ok) {
    return NextResponse.redirect(`${getAppUrl()}/login?error=google_token`);
  }

  const tokens = await tokenResponse.json();
  const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userResponse.ok) {
    return NextResponse.redirect(`${getAppUrl()}/login?error=google_user`);
  }

  const profile = await userResponse.json();
  const user = {
    id: profile.sub,
    name: profile.name,
    email: profile.email,
    picture: profile.picture,
  };

  const response = NextResponse.redirect(getAppUrl());
  response.cookies.delete("towardsoffer_oauth_state");
  response.cookies.set("towardsoffer_user", encodeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: getAppUrl().startsWith("https://"),
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
