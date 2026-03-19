"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import CartDrawer from "@/components/cart/CartDrawer";

const SHELL_HIDDEN_PATHS = ["/admin", "/dashboard", "/login"];

export default function ConditionalShell() {
  const pathname = usePathname();
  const hide = SHELL_HIDDEN_PATHS.some((p) => pathname.startsWith(p));
  if (hide) return null;
  return (
    <>
      <Navbar />
      <CartDrawer />
    </>
  );
}
