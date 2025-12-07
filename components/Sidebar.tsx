"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  Ticket,
  Tv,
  FileText,
  Users,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const isDashboard = pathname === "/";
  const isInventory = pathname.startsWith("/features/inventory");
  const isTicketManager = pathname.startsWith("/features/ticket_section/pages");
  const isFamilyMasterlist = pathname.startsWith(
    "/features/ticket_section/family_masterlist"
  );

  return (
    <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white text-xl font-semibold">
          IT
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900">
            Inventory &amp; Ticket System
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4 text-sm">
        <Link
          href="/"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
            isDashboard
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${
              isDashboard
                ? "bg-slate-800 text-white"
                : "border border-slate-300"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
          </span>
          <span className="font-medium">Dashboard</span>
        </Link>

        <Link
          href="/features/inventory/pages"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
            isInventory
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${
              isInventory
                ? "bg-slate-800 text-white"
                : "border border-slate-300"
            }`}
          >
            <Boxes className="h-4 w-4" />
          </span>
          <span className="font-medium">Inventory</span>
        </Link>

        <Link
          href="/features/ticket_section/pages"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
            isTicketManager
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${
              isTicketManager
                ? "bg-slate-800 text-white"
                : "border border-slate-300"
            }`}
          >
            <Ticket className="h-4 w-4" />
          </span>
          <span className="font-medium">Ticket Manager</span>
        </Link>

        <Link
          href="/features/ticket_section/family_masterlist"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
            isFamilyMasterlist
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${
              isFamilyMasterlist
                ? "bg-slate-800 text-white"
                : "border border-slate-300"
            }`}
          >
            <Users className="h-4 w-4" />
          </span>
          <span className="font-medium">Family Masterlist</span>
        </Link>

        <Link
          href="/features/public_display"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
            pathname.startsWith("/features/public_display")
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${
              pathname.startsWith("/features/public_display")
                ? "bg-slate-800 text-white"
                : "border border-slate-300"
            }`}
          >
            <Tv className="h-4 w-4" />
          </span>
          <span className="font-medium">Public Display</span>
        </Link>

        <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300">
            <FileText className="h-4 w-4" />
          </span>
          <span className="font-medium">Logs &amp; Reports</span>
        </button>
      </nav>

      <div className="border-t border-slate-200 px-6 py-4 text-xs text-slate-400">
        © 2025
      </div>
    </aside>
  );
}
