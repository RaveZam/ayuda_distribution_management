"use client";

import { useState } from "react";
import {
  Package,
  Ticket,
  ClipboardList,
  CheckCircle2,
  Settings2,
  Clock,
  Activity,
  Menu,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      {/* Sidebar */}
      {isSidebarOpen && <Sidebar />}

      {/* Main content */}
      <main className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((open) => !open)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-slate-900">
                Dashboard
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <span>Last updated: January 15, 2025 - 2:30 PM</span>
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">
              <Settings2 className="h-3 w-3" />
              <span>Settings</span>
            </button>
          </div>
        </header>

        {/* Content area */}
        <section className="flex-1 space-y-6 px-8 py-6">
          {/* Stats cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-medium text-slate-500">
                    Total Items in Stock
                  </div>
                </div>
              </div>
              <div className="text-3xl font-semibold tracking-tight text-slate-900">
                1,247
              </div>
            </div>

            <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900/5 text-slate-700">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-medium text-slate-500">
                    Tickets Issued Today
                  </div>
                </div>
              </div>
              <div className="text-3xl font-semibold tracking-tight text-slate-900">
                84
              </div>
            </div>

            <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-medium text-slate-500">
                    Tickets Served Today
                  </div>
                </div>
              </div>
              <div className="text-3xl font-semibold tracking-tight text-slate-900">
                67
              </div>
            </div>
          </div>

          {/* Lower section */}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
            {/* Recent Activity */}
            <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-slate-800">
                Recent Activity
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4 rounded-lg px-1 py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-slate-50">
                      <Ticket className="h-4 w-4 text-slate-700" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">
                        Ticket #084 served
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">2:28 PM</span>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-lg px-1 py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-slate-50">
                      <Package className="h-4 w-4 text-slate-700" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">
                        New item added: Office Supplies
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">1:45 PM</span>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-lg px-1 py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-slate-50">
                      <Ticket className="h-4 w-4 text-slate-700" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">
                        Ticket #083 served
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">1:32 PM</span>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">
                  Current Status
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  <Activity className="h-3 w-3" />
                  Live
                </span>
              </div>
              <div className="flex flex-col gap-4 text-sm">
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-500">Now Serving</span>
                  <span className="text-3xl font-semibold tracking-tight text-slate-900">
                    #067
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-slate-500">Queue Length</span>
                  <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                    <ClipboardList className="h-3 w-3 text-slate-500" />
                    17 waiting
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-slate-500">Average Wait Time</span>
                  <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                    <Clock className="h-3 w-3 text-slate-500" />
                    12 minutes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
