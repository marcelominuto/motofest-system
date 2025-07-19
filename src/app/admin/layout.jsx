"use client";

import Sidebar from "@/components/admin/Sidebar";
import { useState } from "react";
import { Menu } from "lucide-react";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Passar prop para Sidebar para fechar o drawer ao clicar em um link no mobile
  return (
    <div className="flex min-h-screen relative">
      {/* Sidebar fixa no desktop, drawer no mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {/* Botão hamburger no mobile */}
      <button
        className="fixed top-4 left-4 z-[110] md:hidden bg-white border border-gray-200 rounded-md p-2 shadow-lg"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menu"
        style={{ pointerEvents: sidebarOpen ? "none" : "auto" }}
      >
        <Menu className="w-7 h-7 text-red-600" />
      </button>
      {/* Drawer mobile */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar */}
          <div className="fixed left-0 top-0 h-full w-4/5 max-w-xs bg-white shadow-xl z-50 overflow-y-auto p-4">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 z-60"
              onClick={() => setSidebarOpen(false)}
              aria-label="Fechar menu"
            >
              <span className="text-3xl">&times;</span>
            </button>
            <Sidebar onLinkClick={() => setSidebarOpen(false)} />
          </div>
        </>
      )}
      {/* Conteúdo principal */}
      <main className="flex-1 p-4 md:p-8 bg-gray-50 min-h-screen overflow-x-auto">
        {children}
      </main>
    </div>
  );
}
