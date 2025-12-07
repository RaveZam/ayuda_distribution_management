"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Bell,
  Menu,
  CheckCircle2,
  XCircle,
  Users,
  Search,
} from "lucide-react";
import { useLocalStorageState } from "@/app/core/hooks/useLocalStorageState";

type FamilyMasterRow = {
  household_id?: string;
  family_representative?: string;
  address?: string;
  [key: string]: unknown;
};

export default function FamilyMasterlistPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Load family master list from localStorage
  const [familyMasterList] = useLocalStorageState<FamilyMasterRow[] | null>(
    "family_master_list",
    null
  );

  // Track which families have been given items (stored as array in localStorage)
  const [givenFamiliesArray, setGivenFamiliesArray] = useLocalStorageState<
    string[]
  >("family_given_status", []);

  // Convert array to Set for efficient lookups
  const givenFamilies = new Set(givenFamiliesArray);

  const toggleGivenStatus = (householdId: string) => {
    setGivenFamiliesArray((prev) => {
      if (prev.includes(householdId)) {
        return prev.filter((id) => id !== householdId);
      } else {
        return [...prev, householdId];
      }
    });
  };

  // Filter families based on search query
  const filteredFamilies = familyMasterList?.filter((family) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const householdId = String(family.household_id || "").toLowerCase();
    const representative = String(family.family_representative || "").toLowerCase();
    const address = String(family.address || "").toLowerCase();

    return (
      householdId.includes(query) ||
      representative.includes(query) ||
      address.includes(query)
    );
  }) || [];

  const givenCount = familyMasterList?.filter((family) =>
    givenFamilies.has(String(family.household_id || ""))
  ).length || 0;

  const totalCount = familyMasterList?.length || 0;
  const notGivenCount = totalCount - givenCount;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-900">
      {isSidebarOpen && <Sidebar />}

      <main className="flex flex-1 flex-col">
        <header className="flex flex-none items-center justify-between border-b border-slate-200 bg-white px-6 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((open) => !open)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white text-sm font-semibold">
                FM
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900">
                  Family Masterlist
                </span>
                <span className="text-xs text-slate-500">
                  View and manage family distribution status.
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              aria-label="Notifications"
            >
              <span className="relative flex h-4 w-4 items-center justify-center">
                <Bell className="h-4 w-4" />
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-rose-500" />
              </span>
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-medium text-white">
              AD
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:px-10">
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Total Families
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                      {totalCount}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <Users className="h-6 w-6 text-slate-600" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-emerald-700">
                      Given
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-emerald-900">
                      {givenCount}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-amber-700">
                      Not Given
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-amber-900">
                      {notGivenCount}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                    <XCircle className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by household ID, family representative, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                />
              </div>
            </div>

            {/* Family List */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-sm font-semibold text-slate-900">
                  Family List
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Click on the status badge to toggle given/not given status.
                </p>
              </div>

              {!familyMasterList || familyMasterList.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-4 text-sm font-medium text-slate-900">
                    No family data available
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Please import the family master list CSV in the Ticket Manager
                    page.
                  </p>
                </div>
              ) : filteredFamilies.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Search className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-4 text-sm font-medium text-slate-900">
                    No families found
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Try adjusting your search query.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredFamilies.map((family, index) => {
                    const householdId = String(family.household_id || "");
                    const representative = String(family.family_representative || "");
                    const address = String(family.address || "");
                    const isGiven = givenFamilies.has(householdId);

                    return (
                      <div
                        key={householdId || index}
                        className="flex items-center justify-between px-6 py-4 hover:bg-slate-50"
                      >
                        <div className="flex flex-1 items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                            {householdId || "N/A"}
                          </div>
                          <div className="flex flex-1 flex-col">
                            <span className="text-sm font-medium text-slate-900">
                              {representative || "Unknown"}
                            </span>
                            <span className="text-xs text-slate-500">
                              {address || "No address"}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleGivenStatus(householdId)}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                            isGiven
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          {isGiven ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Given</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4" />
                              <span>Not Given</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

