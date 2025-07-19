import { NextResponse } from "next/server";

export function middleware(request) {
  console.log("MIDDLEWARE EXECUTADO", request.nextUrl.pathname);
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  // Protege todas as rotas /admin
  if (pathname.startsWith("/admin")) {
    if (!token && pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Se acessar /admin/login autenticado, redireciona para /admin
    if (pathname === "/admin/login" && token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }
  // Se acessar /login já autenticado, redireciona para /admin
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
