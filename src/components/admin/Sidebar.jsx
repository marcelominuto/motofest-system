"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Agendamentos", href: "/admin/agendamentos" },
  { label: "Clientes", href: "/admin/clientes" },
  { label: "Ingressos", href: "/admin/ingressos" },
  { label: "Eventos", href: "/admin/eventos" },
  { label: "Marcas", href: "/admin/marcas" },
  { label: "Modelos", href: "/admin/motos" },
  { label: "Horários", href: "/admin/horarios" },
  { label: "Cortesias", href: "/admin/cortesias" },
  { label: "Pedidos", href: "/admin/pedidos" },
  { label: "Sair", href: "/admin/logout" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-red-600 mb-8">Moto Fest</h2>
      <nav className="flex flex-col gap-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors",
              pathname === item.href
                ? "text-red-600 font-semibold"
                : "text-gray-700 hover:text-red-600"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
