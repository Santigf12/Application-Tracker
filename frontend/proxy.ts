import { NextRequest, NextResponse } from "next/server";

const formatLog = (req: NextRequest, status: number, duration: number, contentLength?: string) => {
  const now = new Date().toISOString();
  const method = req.method;
  const url = req.nextUrl.pathname + req.nextUrl.search;
  const userAgent = req.headers.get("user-agent") ?? "-";
  const referer = req.headers.get("referer") ?? "-";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? "-";
  const size = contentLength ?? "-";

  console.log(`${ip} - - [${now}] "${method} ${url}" ${status} ${size} "${referer}" "${userAgent}" ${duration}ms`);
};

export async function proxy(req: NextRequest) {
  const start = Date.now();
  const res = NextResponse.next();
  const duration = Date.now() - start;
  const contentLength = res.headers.get("content-length") ?? undefined;
  formatLog(req, res.status, duration, contentLength);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
