// Supabase PKCE callback: exchanges ?code= for a session cookie, then sends
// the user into the dashboard. The response object must exist BEFORE the
// client so setAll can attach session cookies to the redirect itself.
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  const successResponse = NextResponse.redirect(new URL("/", req.url));
  if (!code) return successResponse;

  const supabase = createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim(),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim(),
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value, options }) =>
            successResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("exchangeCodeForSession failed:", error);
    return NextResponse.redirect(new URL("/login?error=auth", req.url));
  }
  return successResponse;
}
