"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Bell,
  Menu,
  CheckCircle2,
  XCircle,
  Users,
  Search,
  Box,
  Droplet,
  Soup,
  PackageOpen,
  X,
} from "lucide-react";
import { useLocalStorageState } from "@/app/core/hooks/useLocalStorageState";

type FamilyMasterRow = {
  household_id?: string;
  family_representative?: string;
  address?: string;
  [key: string]: unknown;
};

type TicketItem = {
  id: string;
  name: string;
  icon: "rice" | "water" | "canned" | "custom";
  quantity: number;
  unit: string;
};

export default function FamilyMasterlistPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(
    null
  );
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);

  // Load family master list from localStorage
  const [familyMasterList] = useLocalStorageState<FamilyMasterRow[] | null>(
    "family_master_list",
    null
  );

  // Track which families have been given items (stored as array in localStorage)
  const [givenFamiliesArray, setGivenFamiliesArray] = useLocalStorageState<
    string[]
  >("family_given_status", []);

  // Load items given to families
  const [familyItemsGiven] = useLocalStorageState<
    Record<string, TicketItem[]>
  >("family_items_given", {});

  // Convert array to Set for efficient lookups
  const givenFamilies = new Set(givenFamiliesArray);

  const handleFamilyNameClick = (householdId: string) => {
    const items = familyItemsGiven[householdId];
    if (items && items.length > 0) {
      setSelectedFamilyId(householdId);
      setIsItemsModalOpen(true);
    }
  };

  const renderItemIcon = (item: TicketItem) => {
    const baseClass =
      "flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700";

    switch (item.icon) {
      case "rice":
        return (
          <span className={baseClass}>
            <Box className="h-4 w-4" />
          </span>
        );
      case "water":
        return (
          <span className={baseClass}>
            <Droplet className="h-4 w-4" />
          </span>
        );
      case "canned":
        return (
          <span className={baseClass}>
            <Soup className="h-4 w-4" />
          </span>
        );
      case "custom":
      default:
        return (
          <span className={baseClass}>
            <PackageOpen className="h-4 w-4" />
          </span>
        );
    }
  };

  const selectedFamily = familyMasterList?.find(
    (family) => String(family.household_id || "") === selectedFamilyId
  );
  const selectedFamilyItems = selectedFamilyId
    ? familyItemsGiven[selectedFamilyId] || []
    : [];

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
                            <button
                              type="button"
                              onClick={() => handleFamilyNameClick(householdId)}
                              className={`text-left text-sm font-medium transition-colors ${
                                isGiven && familyItemsGiven[householdId]?.length > 0
                                  ? "cursor-pointer text-slate-900 hover:text-slate-700 hover:underline"
                                  : "text-slate-900"
                              }`}
                              disabled={
                                !isGiven || !familyItemsGiven[householdId]?.length
                              }
                            >
                              {representative || "Unknown"}
                            </button>
                            <span className="text-xs text-slate-500">
                              {address || "No address"}
                            </span>
                            {isGiven &&
                              familyItemsGiven[householdId]?.length > 0 && (
                                <span className="mt-1 text-[10px] text-slate-400">
                                  Click name to view items
                                </span>
                              )}
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

      {/* Items Modal */}
      {isItemsModalOpen && selectedFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Items Given to Family
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedFamily.family_representative || "Unknown"} (
                  {selectedFamily.household_id || "N/A"})
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsItemsModalOpen(false);
                  setSelectedFamilyId(null);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto px-6 py-4">
              {selectedFamilyItems.length === 0 ? (
                <div className="py-8 text-center">
                  <PackageOpen className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-4 text-sm font-medium text-slate-900">
                    No items recorded
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    No items were recorded for this family.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedFamilyItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        {renderItemIcon(item)}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">
                            {item.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            Distribution item
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-slate-900">
                          {item.quantity}
                        </span>
                        <span className="ml-1 text-xs text-slate-500">
                          {item.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setIsItemsModalOpen(false);
                  setSelectedFamilyId(null);
                }}
                className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
