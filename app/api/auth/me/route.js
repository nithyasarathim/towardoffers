import { NextResponse } from "next/server";

function decodeSession(value) {
  if (!value) return null;

  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export async function GET(request) {
  const user = decodeSession(request.cookies.get("towardsoffer_user")?.value);
  return NextResponse.json({ user });
}
