import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const pathname = request.nextUrl.pathname;

  if (pathname === "/api/cron") {
    const secret = request.nextUrl.searchParams.get("secret");

    if (!secret || secret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}
