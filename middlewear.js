import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request) {
  const protectedPaths = ["/api/motos", "/api/eventos"]; // add more paths if needed
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (!isProtected) return NextResponse.next();

  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Token missing" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export const config = {
  matcher: ["/api/:path*"],
};
