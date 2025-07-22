import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const method = request.method;
  const token = request.cookies.get("auth_token")?.value;

  console.log("MIDDLEWARE:", { pathname, method, token });

  // Rotas sensíveis: só bloqueia GET sem query, PUT, DELETE
  const sensitiveRoutes = [
    "/api/clientes",
    "/api/agendamentos",
    "/api/pedidos",
    "/api/cortesias",
  ];
  const isSensitive = sensitiveRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isSensitiveMethod = ["PUT", "DELETE"].includes(method);
  const isGetWithoutQuery = method === "GET" && isSensitive && !search;

  if (isSensitive && (isSensitiveMethod || isGetWithoutQuery)) {
    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
  }

  // Dashboard/admin sempre protegido
  if (
    pathname.startsWith("/api/dashboard") ||
    pathname.startsWith("/api/seed-admin") ||
    pathname.startsWith("/admin")
  ) {
    if (!token && pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jwtVerify(token, secret);
        return NextResponse.next();
      } catch {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  }

  // Demais rotas são públicas
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin", "/admin/:path*", "/login"],
};
