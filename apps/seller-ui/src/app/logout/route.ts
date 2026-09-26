import { NextResponse } from "next/server";

/*
  GET /logout
  - Attempts to call the auth-service logout endpoint to clear server-side cookies.
  - Then redirects the browser to "/", preventing a 404 when visiting /logout.
  - Configure the backend URL via NEXT_PUBLIC_AUTH_URL (e.g. "http://localhost:4000").
*/

export async function GET() {
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:5000";
  const logoutUrl = `${authUrl.replace(/\/+$/, "")}/logout`;

  try {
    // call backend logout to clear HttpOnly cookies (if backend is reachable)
    await fetch(logoutUrl, {
      method: "GET",
      credentials: "include",
      // forward headers if needed; keep minimal here
    });
  } catch (err) {
    // ignore network errors — still redirect the user
    // (backend may be on a different port or not running during development)
    console.warn("Auth logout proxy failed:", err);
  }

  // redirect back to homepage
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
}
