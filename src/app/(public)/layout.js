"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function PublicLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const navLinks = [
    { href: "/ingressos", label: "Ingressos" },
    { href: "/agenda", label: "Agenda" },
    { href: "/faq", label: "FAQ" },
  ];
  return (
    <div className="min-h-screen flex flex-col">
      <header className="relative bg-black text-white p-4 flex items-center w-full justify-between md:justify-center md:items-center">
        {/* Mobile: logo à esquerda, menu à direita */}
        <Link href="/" className="flex items-center justify-center md:hidden">
          <img src="/logo-smf.png" alt="MotoFest" className="h-10 w-auto" />
        </Link>
        <button
          className="md:hidden z-30"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {menuOpen ? (
            <span className="text-white text-3xl font-bold">&times;</span>
          ) : (
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              className="fill-white"
            >
              <rect x="4" y="6" width="16" height="2" rx="1" />
              <rect x="4" y="11" width="16" height="2" rx="1" />
              <rect x="4" y="16" width="16" height="2" rx="1" />
            </svg>
          )}
        </button>
        {/* Desktop: logo e links centralizados juntos */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="flex items-center justify-center">
            <img
              src="/logo-smf.png"
              alt="MotoFest"
              className="h-16 w-auto mr-4"
            />
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-bold px-2 pb-1 transition border-b-2 uppercase ${
                pathname.startsWith(link.href)
                  ? "border-red-600 text-white"
                  : "border-transparent hover:text-red-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        {/* Menu mobile: dropdown ocupa toda a largura, altura do conteúdo */}
        {menuOpen && (
          <div className="absolute left-0 top-full w-screen bg-[#222] border-b border-gray-800 shadow-lg z-40 animate-fade-in-down">
            <nav className="flex flex-col items-center gap-4 py-4">
              <Link
                href="/ingressos"
                className="text-white text-lg font-bold uppercase tracking-wide hover:text-red-600 transition"
                onClick={() => setMenuOpen(false)}
              >
                Ingressos
              </Link>
              <Link
                href="/shows"
                className="text-white text-lg font-bold uppercase tracking-wide hover:text-red-600 transition"
                onClick={() => setMenuOpen(false)}
              >
                Shows
              </Link>
              <Link
                href="/atracoes"
                className="text-white text-lg font-bold uppercase tracking-wide hover:text-red-600 transition"
                onClick={() => setMenuOpen(false)}
              >
                Atrações
              </Link>
              <Link
                href="/agenda"
                className="text-white text-lg font-bold uppercase tracking-wide hover:text-red-600 transition"
                onClick={() => setMenuOpen(false)}
              >
                Agenda
              </Link>
              <Link
                href="/faq"
                className="text-white text-lg font-bold uppercase tracking-wide hover:text-red-600 transition"
                onClick={() => setMenuOpen(false)}
              >
                FAQ
              </Link>
            </nav>
          </div>
        )}
      </header>
      <main className="flex-1 w-full">{children}</main>
      <footer className="bg-gray-900 text-gray-300 text-center p-4 text-sm mt-auto">
        &copy; {new Date().getFullYear()} MotoFest. Todos os direitos
        reservados.
      </footer>
    </div>
  );
}
