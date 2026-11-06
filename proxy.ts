import { NextResponse, type NextRequest } from "next/server";

/**
 * እንግሊዝኛ ነባሪ ነው፦ `/accounts` ወደ `/en/accounts` ይጻፋል፣ አማርኛ ደግሞ `/am/accounts` ነው።
 * `x-locale` ለServer Actions ይተላለፋል፣ ምክንያቱም እዚያ next/root-params አይሰራም።
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const target = request.nextUrl.clone();
    target.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(target, 308);
  }

  const headers = new Headers(request.headers);
  if (pathname === "/am" || pathname.startsWith("/am/")) {
    headers.set("x-locale", "am");
    return NextResponse.next({ request: { headers } });
  }

  headers.set("x-locale", "en");
  const target = new URL(`/en${pathname === "/" ? "" : pathname}${search}`, request.url);
  return NextResponse.rewrite(target, { request: { headers } });
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
