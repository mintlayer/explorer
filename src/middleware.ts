import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (process.env.BASIC_AUTH === undefined) {
    return NextResponse.next();
  }

  const basicAuth = req.headers.get("authorization");
  const url = req.nextUrl;

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    // @ts-ignore
    const [username, password] = process.env.BASIC_AUTH ? process.env.BASIC_AUTH.split(":") : [];

    if (user === username && pwd === password) {
      return NextResponse.next();
    }
  }
  url.pathname = "/api/basicauth";

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: "/:path*",
};
