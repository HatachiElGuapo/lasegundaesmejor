"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

const links = [
  { href: "/dashboard", label: "Mi cuenta", exact: true },
  { href: "/dashboard/mis-prendas", label: "Mis prendas" },
  { href: "/dashboard/mis-pedidos", label: "Mis pedidos" },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <aside className="w-52 shrink-0 bg-surface border-r border-border min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-border">
        <p className="font-display text-lg text-ink tracking-widest uppercase">Mi cuenta</p>
        <p className="text-xs text-muted mt-0.5">La Segunda Es Mejor</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`block px-4 py-2.5 rounded text-sm transition-colors ${
                isActive
                  ? "bg-ink text-bg font-medium"
                  : "text-ink/70 hover:bg-border hover:text-ink"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <form action={logout}>
          <button
            type="submit"
            className="w-full px-4 py-2.5 rounded text-sm text-ink/60 hover:bg-border hover:text-ink transition-colors text-left"
          >
            Cerrar sesión
          </button>
        </form>
        <Link
          href="/"
          className="block mt-1 px-4 py-2 rounded text-xs text-muted hover:text-ink transition-colors"
        >
          ← Ver tienda
        </Link>
      </div>
    </aside>
  );
}
