"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarCheck,
  User,
  Ticket,
  Star,
  Store,
  Bike,
  Clock,
  ScanBarcode,
  ShoppingBag,
  LogOut,
  TrafficCone,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="w-5 h-5 mr-2" />,
  },
  {
    label: "Agendamentos",
    href: "/admin/agendamentos",
    icon: <CalendarCheck className="w-5 h-5 mr-2" />,
  },
  {
    label: "Mobilidade",
    href: "/admin/mobilidade",
    icon: <TrafficCone className="w-5 h-5 mr-2" />,
  },
  {
    label: "Clientes",
    href: "/admin/clientes",
    icon: <User className="w-5 h-5 mr-2" />,
  },
  {
    label: "Ingressos",
    href: "/admin/ingressos",
    icon: <Ticket className="w-5 h-5 mr-2" />,
  },
  {
    label: "Eventos",
    href: "/admin/eventos",
    icon: <Star className="w-5 h-5 mr-2" />,
  },
  {
    label: "Marcas",
    href: "/admin/marcas",
    icon: <Store className="w-5 h-5 mr-2" />,
  },
  {
    label: "Motos",
    href: "/admin/motos",
    icon: <Bike className="w-5 h-5 mr-2" />,
  },
  {
    label: "Horários",
    href: "/admin/horarios",
    icon: <Clock className="w-5 h-5 mr-2" />,
  },
  {
    label: "Cortesias",
    href: "/admin/cortesias",
    icon: <ScanBarcode className="w-5 h-5 mr-2" />,
  },
  {
    label: "Pedidos",
    href: "/admin/pedidos",
    icon: <ShoppingBag className="w-5 h-5 mr-2" />,
  },
  {
    label: "Sair",
    href: "/admin/logout",
    icon: <LogOut className="w-5 h-5 mr-2" />,
  },
];

export default function Sidebar({ onLinkClick }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white p-6">
      <h2 className="text-2xl font-bold text-red-600 mb-8">Moto Fest</h2>
      <nav className="flex flex-col gap-3 mt-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-150",
              pathname === item.href
                ? "text-red-600 bg-gray-100 shadow-sm"
                : "text-gray-700 hover:bg-gray-100 hover:text-red-600"
            )}
            onClick={onLinkClick}
          >
            <span className="flex items-center">
              {item.icon}
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
