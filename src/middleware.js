import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const method = request.method;
  const token = request.cookies.get("auth_token")?.value;

  console.log("MIDDLEWARE:", { pathname, method, token });

  // APIs públicas permitidas (não requerem autenticação):
  // - /api/login (para fazer login)
  // - /api/pagarme/webhook e /api/stripe/webhook (webhooks externos)
  const publicAPIs = [
    "/api/login",
    "/api/pagarme/webhook",
    "/api/stripe/webhook",
  ];
  const isPublicAPI = publicAPIs.some((route) => pathname === route);

  // Se não for uma API pública permitida, verificar autenticação
  if (pathname.startsWith("/api") && !isPublicAPI) {
    // Dashboard/admin sempre protegido (mas já tem verificação abaixo)
    if (
      pathname.startsWith("/api/dashboard") ||
      pathname.startsWith("/api/seed-admin")
    ) {
      if (!token) {
        return NextResponse.json(
          { error: "Não autorizado. Acesso restrito a administradores." },
          { status: 401 }
        );
      }
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jwtVerify(token, secret);
        return NextResponse.next();
      } catch {
        return NextResponse.json({ error: "Token inválido" }, { status: 401 });
      }
    }

    // Todas as outras APIs requerem autenticação
    if (!token) {
      return NextResponse.json(
        { error: "Não autorizado. Acesso restrito a administradores." },
        { status: 401 }
      );
    }
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
  }

  // Dashboard/admin sempre protegido (rotas não-API)
  if (pathname.startsWith("/admin")) {
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

  // Redirecionar todas as rotas públicas para /agradecimento (exceto a própria página de agradecimento, admin e api)
  // Não redirecionar arquivos estáticos (imagens, CSS, JS, etc.)
  const isStaticFile =
    pathname.match(
      /\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/i
    ) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico");

  if (
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/login") &&
    pathname !== "/agradecimento" &&
    !isStaticFile
  ) {
    return NextResponse.redirect(new URL("/agradecimento", request.url));
  }

  // Demais rotas são públicas
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin",
    "/admin/:path*",
    "/login",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
