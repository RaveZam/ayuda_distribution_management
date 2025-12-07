"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Package,
  Ticket,
  ClipboardList,
  CheckCircle2,
  Settings2,
  Clock,
  Activity,
  Menu,
  Users,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useLocalStorageState } from "@/app/core/hooks/useLocalStorageState";

type QueueTicket = {
  id: string;
  status: "current" | "completed" | "skipped";
  timeAgo: string;
  note: string;
  timestamp?: number;
};

type FamilyMasterRow = {
  household_id?: string;
  family_representative?: string;
  address?: string;
  [key: string]: unknown;
};

// Helper function to calculate average waiting time
// This calculates the average time between ticket completions (service pace)
function calculateAverageWaitingTime(
  recentActivity: QueueTicket[]
): number {
  // Filter completed tickets with timestamps, sorted by timestamp (newest first)
  const completedTickets = recentActivity
    .filter(
      (activity) =>
        activity.status === "completed" && activity.timestamp !== undefined
    )
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  if (completedTickets.length < 2) return 0;

  // Calculate time differences between consecutive completions
  const timeDifferences: number[] = [];
  for (let i = 0; i < completedTickets.length - 1; i++) {
    const current = completedTickets[i].timestamp || 0;
    const previous = completedTickets[i + 1].timestamp || 0;
    const diff = (current - previous) / (1000 * 60); // Convert to minutes
    if (diff > 0) {
      timeDifferences.push(diff);
    }
  }

  if (timeDifferences.length === 0) return 0;

  // Calculate average time between completions
  const sum = timeDifferences.reduce((acc, time) => acc + time, 0);
  return Math.round(sum / timeDifferences.length);
}

// Helper function to get today's date string (YYYY-MM-DD)
function getTodayDateString(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

// Helper function to check if timestamp is today
function isToday(timestamp: number): boolean {
  const date = new Date(timestamp);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load data from localStorage
  const [inventoryItems] = useLocalStorageState<
    Array<{ item_name: string; total_quantity: number; unit: string }> | null
  >("inventoryBasicItems", null);

  const [familyMasterList] = useLocalStorageState<FamilyMasterRow[] | null>(
    "family_master_list",
    null
  );

  const [givenFamiliesArray] = useLocalStorageState<string[]>(
    "family_given_status",
    []
  );

  const [recentActivity] = useLocalStorageState<QueueTicket[]>(
    "ticket_recent_activity",
    []
  );

  const [familyServedTimestamps] = useLocalStorageState<
    Record<string, number>
  >("family_served_timestamps", {});

  // Calculate total items in stock
  const totalItemsInStock = useMemo(() => {
    if (!inventoryItems) return 0;
    return inventoryItems.reduce(
      (sum, item) => sum + item.total_quantity,
      0
    );
  }, [inventoryItems]);

  // Count total item types
  const totalItemTypes = inventoryItems?.length || 0;

  // Tickets issued today = total families in master list
  const ticketsIssuedToday = familyMasterList?.length || 0;

  // Tickets served today = families given today (with timestamp check)
  const ticketsServedToday = useMemo(() => {
    // Count families served today from timestamps
    return Object.values(familyServedTimestamps).filter((timestamp) =>
      isToday(timestamp)
    ).length;
  }, [familyServedTimestamps]);

  // Get current serving family
  const currentServingFamily = useMemo(() => {
    if (!familyMasterList || familyMasterList.length === 0) return null;
    const givenSet = new Set(givenFamiliesArray);
    const currentFamily = familyMasterList.find(
      (family) => !givenSet.has(String(family.household_id || ""))
    );
    return currentFamily
      ? String(currentFamily.household_id || "")
      : null;
  }, [familyMasterList, givenFamiliesArray]);

  // Queue length = families waiting (not given yet)
  const queueLength = useMemo(() => {
    if (!familyMasterList) return 0;
    const givenSet = new Set(givenFamiliesArray);
    return familyMasterList.filter(
      (family) => !givenSet.has(String(family.household_id || ""))
    ).length;
  }, [familyMasterList, givenFamiliesArray]);

  // Average waiting time
  const averageWaitingTime = useMemo(() => {
    return calculateAverageWaitingTime(recentActivity);
  }, [recentActivity]);

  // Get current time for "Last updated"
  const [lastUpdated, setLastUpdated] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
      setLastUpdated(timeString);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

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
            <span>Last updated: {lastUpdated || "Loading..."}</span>
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">
              <Settings2 className="h-3 w-3" />
              <span>Settings</span>
            </button>
          </div>
        </header>

        {/* Content area */}
        <section className="flex-1 space-y-6 px-8 py-6">
          {/* Stats cards */}
          <div className="grid gap-4 md:grid-cols-4">
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
                {totalItemsInStock.toLocaleString()}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {totalItemTypes} item type{totalItemTypes !== 1 ? "s" : ""}
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
                {ticketsIssuedToday}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Total families in master list
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
                {ticketsServedToday}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Families served today
              </div>
            </div>

            <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-white">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-medium text-slate-500">
                    Queue Length
                  </div>
                </div>
              </div>
              <div className="text-3xl font-semibold tracking-tight text-slate-900">
                {queueLength}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Families waiting
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
                {recentActivity.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-slate-500">
                      No recent activity
                    </p>
                  </div>
                ) : (
                  recentActivity.slice(0, 5).map((activity, index) => {
                    const timeString = activity.timestamp
                      ? new Date(activity.timestamp).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                          }
                        )
                      : activity.timeAgo;
                    return (
                      <div
                        key={`${activity.id}-${index}`}
                        className="flex items-center justify-between gap-4 rounded-lg px-1 py-2 hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-slate-50">
                            <Ticket className="h-4 w-4 text-slate-700" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800">
                              Ticket #{activity.id} - {activity.note}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">
                          {timeString}
                        </span>
                      </div>
                    );
                  })
                )}
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
                    {currentServingFamily ? `#${currentServingFamily}` : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-slate-500">Queue Length</span>
                  <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                    <ClipboardList className="h-3 w-3 text-slate-500" />
                    {queueLength} waiting
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-slate-500">Average Wait Time</span>
                  <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                    <Clock className="h-3 w-3 text-slate-500" />
                    {averageWaitingTime > 0
                      ? `${averageWaitingTime} minute${
                          averageWaitingTime !== 1 ? "s" : ""
                        }`
                      : "N/A"}
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
