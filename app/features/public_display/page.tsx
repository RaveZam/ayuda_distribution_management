"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Menu, Eye, EyeOff } from "lucide-react";
import { useLocalStorageState } from "@/app/core/hooks/useLocalStorageState";

type FamilyMasterRow = Record<string, unknown>;

// Extract last name from full name (e.g., "Juan Dela Cruz" -> "Dela Cruz")
function extractLastName(fullName: string | undefined): string {
  if (!fullName || !fullName.trim()) return "";
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1] || "";
}

export default function PublicDisplayPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hideUI, setHideUI] = useState(false);

  // Family master list CSV
  const [familyMasterList] = useLocalStorageState<FamilyMasterRow[] | null>(
    "family_master_list",
    null
  );
  const [givenFamiliesArray] = useLocalStorageState<string[]>(
    "family_given_status",
    []
  );

  // Track current family index
  const [currentFamilyIndex, setCurrentFamilyIndex] = useState(0);

  // Get current family from masterlist
  const currentFamily =
    familyMasterList && familyMasterList.length > 0
      ? familyMasterList[currentFamilyIndex]
      : null;
  const currentTicket = currentFamily
    ? String(currentFamily.household_id || "")
    : "";

  // Update current family to first family that hasn't been given
  useEffect(() => {
    if (
      familyMasterList &&
      Array.isArray(familyMasterList) &&
      familyMasterList.length > 0
    ) {
      const givenSet = new Set(givenFamiliesArray);
      const firstNotGivenIndex = familyMasterList.findIndex(
        (family) => !givenSet.has(String(family.household_id || ""))
      );
      if (firstNotGivenIndex !== -1) {
        setCurrentFamilyIndex(firstNotGivenIndex);
      } else {
        // All families have been given, show the last one
        setCurrentFamilyIndex(familyMasterList.length - 1);
      }
    }
  }, [familyMasterList, givenFamiliesArray]);

  // Handle Escape key to show UI when hidden
  useEffect(() => {
    if (!hideUI) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHideUI(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [hideUI]);

  if (hideUI) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="text-center text-white">
          <div className="mb-4 text-sm uppercase tracking-[0.25em] text-slate-300">
            Ticket
          </div>
          <div className="text-7xl font-semibold tracking-[0.2em]">
            {currentTicket || "---"}
          </div>
          {currentFamily && (
            <div className="mt-4 text-xl font-medium text-slate-300">
              Family{" "}
              {extractLastName(
                String(currentFamily.family_representative || "")
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => setHideUI(false)}
            className="absolute bottom-4 right-4 rounded-lg bg-slate-800 px-4 py-2 text-sm text-white opacity-20 hover:opacity-40"
            title="Show UI"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

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
                PD
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900">
                  Public Display
                </span>
                <span className="text-xs text-slate-500">
                  Display current ticket for public viewing.
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setHideUI(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              title="Hide UI for TV display"
            >
              <EyeOff className="h-4 w-4" />
              <span>Hide UI</span>
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-medium text-white">
              AD
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="flex h-full items-center justify-center">
            <div className="w-full max-w-4xl px-6 py-8">
              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-500">
                      Current Ticket Number
                    </span>
                  </div>
                  <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                    <span className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white">
                      ●
                    </span>
                    Serving
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900 px-8 py-16 text-center text-white shadow-inner">
                  <div className="text-sm uppercase tracking-[0.25em] text-slate-300">
                    Ticket
                  </div>
                  <div className="mt-4 text-6xl font-semibold tracking-[0.2em]">
                    {currentTicket || "---"}
                  </div>
                  {currentFamily && (
                    <div className="mt-3 text-lg font-medium text-slate-300">
                      Family{" "}
                      {extractLastName(
                        String(currentFamily.family_representative || "")
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
