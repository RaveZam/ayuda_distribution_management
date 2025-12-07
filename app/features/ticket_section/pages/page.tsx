"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import {
  Bell,
  Menu,
  PhoneCall,
  CheckCircle2,
  SkipForward,
  PauseCircle,
  Droplet,
  Soup,
  PackageOpen,
  Plus,
  ClipboardList,
  Circle,
  CircleCheckBig,
  Users,
  Timer,
  Box,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { parseCsvFile } from "@/app/core/utils/parseCsv";
import {
  FileImportModal,
  FileImportSummary,
} from "@/app/features/inventory/components/file_modal";
import { useLocalStorageState } from "@/app/core/hooks/useLocalStorageState";

type QueueTicket = {
  id: string;
  status: "current" | "completed" | "skipped";
  timeAgo: string;
  note: string;
  timestamp?: number; // Unix timestamp for calculation
};

type TicketItem = {
  id: string;
  name: string;
  icon: "rice" | "water" | "canned" | "custom";
  quantity: number;
  unit: string;
};

type FamilyMasterRow = Record<string, unknown>;

const PRESET_ITEMS: Array<{
  id: string;
  name: string;
  label: string;
  icon: TicketItem["icon"];
}> = [
  { id: "rice_5kg", name: "Rice", label: "Rice (5kg)", icon: "rice" },
  { id: "water_1l", name: "Water", label: "Water (1L)", icon: "water" },
  {
    id: "canned_goods",
    name: "Canned Goods",
    label: "Canned Goods",
    icon: "canned",
  },
];

function formatTicketLabel(id: string) {
  return id;
}

// Extract last name from full name (e.g., "Juan Dela Cruz" -> "Dela Cruz")
function extractLastName(fullName: string | undefined): string {
  if (!fullName || !fullName.trim()) return "";
  const parts = fullName.trim().split(/\s+/);
  // Return the last part as the last name
  return parts[parts.length - 1] || "";
}

// Format time ago (e.g., "2 min ago")
function formatTimeAgo(minutes: number): string {
  if (minutes < 1) return "Just now";
  if (minutes === 1) return "1 min ago";
  return `${minutes} min ago`;
}

export default function TicketManagementPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Family master list CSV
  const [familyMasterList, setFamilyMasterList] = useLocalStorageState<
    FamilyMasterRow[] | null
  >("family_master_list", null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<FileImportSummary | null>(
    null
  );

  // Track current family index and given families
  const [currentFamilyIndex, setCurrentFamilyIndex] = useState(0);
  const [previousFamilyIndex, setPreviousFamilyIndex] = useState<number | null>(
    null
  );
  const [givenFamiliesArray, setGivenFamiliesArray] = useLocalStorageState<
    string[]
  >("family_given_status", []);

  // Get current family from masterlist
  const currentFamily =
    familyMasterList && familyMasterList.length > 0
      ? familyMasterList[currentFamilyIndex]
      : null;
  const currentTicket = currentFamily
    ? String(currentFamily.household_id || "")
    : "";

  // Get next family (not given yet)
  const nextFamily = familyMasterList?.find(
    (family, index) =>
      index > currentFamilyIndex &&
      !givenFamiliesArray.includes(String(family.household_id || ""))
  );
  const nextTicket = nextFamily ? String(nextFamily.household_id || "") : "";

  // Get previous family (not given yet)
  const previousFamily = familyMasterList?.find(
    (family, index) =>
      index < currentFamilyIndex &&
      !givenFamiliesArray.includes(String(family.household_id || ""))
  );

  // Get all families that haven't been given (for dropdown)
  const availableFamilies =
    familyMasterList?.filter(
      (family) =>
        !givenFamiliesArray.includes(String(family.household_id || ""))
    ) || [];

  // Calculate counts
  const givenFamiliesSet = new Set(givenFamiliesArray);
  const waitingCount =
    familyMasterList?.filter(
      (family) => !givenFamiliesSet.has(String(family.household_id || ""))
    ).length || 0;
  const completedCount = givenFamiliesArray.length;

  // Start with empty items list
  const [items, setItems] = useState<TicketItem[]>([]);

  // Track recent activity (completed families) - stored in localStorage
  const [recentActivity, setRecentActivity] = useLocalStorageState<
    QueueTicket[]
  >("ticket_recent_activity", []);

  // Track items given to each family - stored in localStorage
  const [familyItemsGiven, setFamilyItemsGiven] = useLocalStorageState<
    Record<string, TicketItem[]>
  >("family_items_given", {});

  // Track when each family was served (household_id -> timestamp)
  const [familyServedTimestamps, setFamilyServedTimestamps] =
    useLocalStorageState<Record<string, number>>(
      "family_served_timestamps",
      {}
    );

  // Load inventory items
  const [inventoryItems, setInventoryItems] = useLocalStorageState<Array<{
    item_name: string;
    total_quantity: number;
    unit: string;
  }> | null>("inventoryBasicItems", null);

  const totalItemTypes = items.length;

  // Log family masterlist data when it exists and set initial family index
  useEffect(() => {
    if (
      familyMasterList &&
      Array.isArray(familyMasterList) &&
      familyMasterList.length > 0
    ) {
      // family_master_list already exists in localStorage: log summary and proceed
      console.info(
        "[TicketManager] Loaded family_master_list from localStorage",
        {
          totalRows: familyMasterList.length,
          sample: familyMasterList.slice(0, 10),
        }
      );
      setIsImportModalOpen(false);

      // Set current family to first family that hasn't been given (only on initial load)
      // Read from localStorage directly to avoid dependency issues
      try {
        const stored = window.localStorage.getItem("family_given_status");
        const storedGivenFamilies = stored ? JSON.parse(stored) : [];
        const firstNotGivenIndex = familyMasterList.findIndex(
          (family) =>
            !storedGivenFamilies.includes(String(family.household_id || ""))
        );
        if (firstNotGivenIndex !== -1) {
          setCurrentFamilyIndex(firstNotGivenIndex);
          setPreviousFamilyIndex(null);
        } else {
          setCurrentFamilyIndex(0);
          setPreviousFamilyIndex(null);
        }
      } catch (error) {
        setCurrentFamilyIndex(0);
        setPreviousFamilyIndex(null);
      }
    }
  }, [familyMasterList]);

  const handleFamilyFile = async (file?: File) => {
    if (!file) return;

    setImporting(true);
    setImportError(null);
    try {
      const parsedRows = await parseCsvFile<FamilyMasterRow>(file);

      // Log full parsed data first before saving to localStorage
      console.info("[TicketManager] Parsed family master list from CSV", {
        filename: file.name,
        totalRows: parsedRows.length,
        sample: parsedRows.slice(0, 10),
      });

      setFamilyMasterList(parsedRows);
      setImportSummary({ filename: file.name, rows: parsedRows.length });
    } catch (error) {
      console.error(
        "[TicketManager] Failed to parse family master list CSV",
        error
      );
      setImportSummary(null);
      setImportError(
        "Failed to parse file. Ensure it is a valid CSV with a header row."
      );
    } finally {
      setImporting(false);
    }
  };

  const handleImportModalClose = () => {
    // If no data is stored yet, keep requiring import by leaving modal open
    if (
      !familyMasterList ||
      !Array.isArray(familyMasterList) ||
      familyMasterList.length === 0
    ) {
      setIsImportModalOpen(true);
      return;
    }

    setIsImportModalOpen(false);
    setImportError(null);
  };

  const handleAddPreset = (presetId: string) => {
    const preset = PRESET_ITEMS.find((p) => p.id === presetId);
    if (!preset) return;

    setItems((prev) => {
      const existing = prev.find((item) => item.name === preset.label);
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          id: `${Date.now()}-${preset.id}`,
          name: preset.label,
          icon: preset.icon,
          quantity: 1,
          unit: preset.id === "water_1l" ? "bottle" : "unit",
        },
      ];
    });
  };

  const handleConfirmDistribution = () => {
    if (!currentFamily || !currentTicket) return;

    // Mark current family as given
    const householdId = String(currentFamily.household_id || "");
    const familyRepresentative = String(
      currentFamily.family_representative || ""
    );
    const lastName = extractLastName(familyRepresentative);

    const updatedGivenFamilies = givenFamiliesArray.includes(householdId)
      ? givenFamiliesArray
      : [...givenFamiliesArray, householdId];

    setGivenFamiliesArray(updatedGivenFamilies);

    // Store timestamp when family was served
    const servedTimestamp = Date.now();
    setFamilyServedTimestamps((prev) => ({
      ...prev,
      [householdId]: servedTimestamp,
    }));

    // Store items given to this family
    if (items.length > 0) {
      setFamilyItemsGiven((prev) => ({
        ...prev,
        [householdId]: items,
      }));
    }

    // Subtract items from inventory
    if (inventoryItems && items.length > 0) {
      const updatedInventory = inventoryItems.map((invItem) => {
        const invNameLower = invItem.item_name.toLowerCase();

        // Find matching distributed item
        const distributedItem = items.find((item) => {
          const itemNameLower = item.name.toLowerCase();

          // Match rice - check if both contain "rice"
          if (item.icon === "rice" || itemNameLower.includes("rice")) {
            return invNameLower.includes("rice");
          }
          // Match water - check if both contain "water"
          if (item.icon === "water" || itemNameLower.includes("water")) {
            return invNameLower.includes("water");
          }
          // Match canned goods - check if both contain "canned" or "sardine" or "tuna"
          if (
            item.icon === "canned" ||
            itemNameLower.includes("canned") ||
            itemNameLower.includes("sardine")
          ) {
            return (
              invNameLower.includes("canned") ||
              invNameLower.includes("sardine") ||
              invNameLower.includes("tuna")
            );
          }
          return false;
        });

        if (distributedItem) {
          // Calculate quantity to subtract with unit conversions
          let quantityToSubtract = distributedItem.quantity;

          // Rice: 1 unit = 5 kg (Rice (5kg) means each unit is 5kg)
          if (
            distributedItem.icon === "rice" ||
            distributedItem.name.toLowerCase().includes("rice")
          ) {
            quantityToSubtract = distributedItem.quantity * 5; // 5 kg per unit
          }
          // Water: 1 unit = 1 L (or 1 bottle) - 1:1 ratio
          // Canned goods: 1 unit = 1 can - 1:1 ratio
          // For water and canned goods, keep 1:1 ratio

          const newQuantity = Math.max(
            0,
            invItem.total_quantity - quantityToSubtract
          );
          return {
            ...invItem,
            total_quantity: newQuantity,
          };
        }
        return invItem;
      });
      setInventoryItems(updatedInventory);
    }

    // Add to recent activity with timestamp
    const newActivity: QueueTicket = {
      id: householdId,
      status: "completed",
      timeAgo: formatTimeAgo(0),
      note: lastName ? `Family ${lastName} - Completed` : "Completed",
      timestamp: servedTimestamp,
    };
    setRecentActivity((prev) => [newActivity, ...prev.slice(0, 9)]); // Keep last 10

    // Clear items for next family
    setItems([]);

    // Move to next family that hasn't been given (using updated array)
    const nextIndex = familyMasterList?.findIndex(
      (family, index) =>
        index > currentFamilyIndex &&
        !updatedGivenFamilies.includes(String(family.household_id || ""))
    );

    if (nextIndex !== undefined && nextIndex !== -1) {
      setCurrentFamilyIndex(nextIndex);
    } else {
      // Find first family that hasn't been given
      const firstNotGivenIndex = familyMasterList?.findIndex(
        (family) =>
          !updatedGivenFamilies.includes(String(family.household_id || ""))
      );
      if (firstNotGivenIndex !== undefined && firstNotGivenIndex !== -1) {
        setCurrentFamilyIndex(firstNotGivenIndex);
      }
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

  // Check if family masterlist is empty
  const isFamilyMasterlistEmpty =
    !familyMasterList ||
    !Array.isArray(familyMasterList) ||
    familyMasterList.length === 0;

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
                TM
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900">
                  Ticket Management
                </span>
                <span className="text-xs text-slate-500">
                  Handle queue and relief item distribution.
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
          {isFamilyMasterlistEmpty ? (
            <div className="flex h-full items-center justify-center">
              <div className="mx-auto flex max-w-md flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                  <Users className="h-10 w-10 text-slate-400" />
                </div>
                <h2 className="mt-6 text-lg font-semibold text-slate-900">
                  Family Masterlist Required
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Please head to Family Masterlist to access Ticket Manager.
                </p>
                <Link
                  href="/features/ticket_section/family_masterlist"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                >
                  <span>Go to Family Masterlist</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:px-10 lg:flex-row">
              <div className="flex-1 space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
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

                  {/* Family Selection Dropdown */}
                  <div className="mb-4">
                    <label className="mb-2 block text-xs font-medium text-slate-500">
                      Select Family to Serve
                    </label>
                    <div className="relative">
                      <select
                        value={currentTicket}
                        onChange={(e) => {
                          const selectedHouseholdId = e.target.value;
                          const selectedIndex = familyMasterList?.findIndex(
                            (family) =>
                              String(family.household_id || "") ===
                              selectedHouseholdId
                          );
                          if (
                            selectedIndex !== undefined &&
                            selectedIndex !== -1
                          ) {
                            setPreviousFamilyIndex(currentFamilyIndex);
                            setCurrentFamilyIndex(selectedIndex);
                            setItems([]);
                          }
                        }}
                        className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                      >
                        <option value="" disabled>
                          Select Family
                        </option>
                        {availableFamilies.map((family) => {
                          const householdId = String(family.household_id || "");
                          const representative = String(
                            family.family_representative || "Unknown"
                          );
                          return (
                            <option key={householdId} value={householdId}>
                              {householdId} - {representative}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    </div>
                  </div>

                  <div className="mb-5 rounded-2xl bg-slate-900 px-8 py-10 text-center text-white shadow-inner">
                    <div className="text-sm uppercase tracking-[0.25em] text-slate-300">
                      Ticket
                    </div>
                    <div className="mt-4 text-5xl font-semibold tracking-[0.2em]">
                      {formatTicketLabel(currentTicket)}
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

                  <div className="flex flex-wrap items-center justify-center gap-3 md:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          // Find previous family that hasn't been given (working backwards)
                          let prevIndex = -1;
                          for (let i = currentFamilyIndex - 1; i >= 0; i--) {
                            const family = familyMasterList?.[i];
                            if (
                              family &&
                              !givenFamiliesArray.includes(
                                String(family.household_id || "")
                              )
                            ) {
                              prevIndex = i;
                              break;
                            }
                          }
                          if (prevIndex !== -1) {
                            setPreviousFamilyIndex(currentFamilyIndex);
                            setCurrentFamilyIndex(prevIndex);
                            setItems([]);
                          }
                        }}
                        disabled={
                          !familyMasterList?.some(
                            (family, index) =>
                              index < currentFamilyIndex &&
                              !givenFamiliesArray.includes(
                                String(family.household_id || "")
                              )
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // Find next family that hasn't been given
                          const nextIndex = familyMasterList?.findIndex(
                            (family, index) =>
                              index > currentFamilyIndex &&
                              !givenFamiliesArray.includes(
                                String(family.household_id || "")
                              )
                          );
                          if (nextIndex !== undefined && nextIndex !== -1) {
                            setPreviousFamilyIndex(currentFamilyIndex);
                            setCurrentFamilyIndex(nextIndex);
                            setItems([]);
                          } else {
                            // If no next family found, find first family that hasn't been given
                            const firstNotGivenIndex =
                              familyMasterList?.findIndex(
                                (family) =>
                                  !givenFamiliesArray.includes(
                                    String(family.household_id || "")
                                  )
                              );
                            if (
                              firstNotGivenIndex !== undefined &&
                              firstNotGivenIndex !== -1
                            ) {
                              setPreviousFamilyIndex(currentFamilyIndex);
                              setCurrentFamilyIndex(firstNotGivenIndex);
                              setItems([]);
                            }
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                      >
                        <PhoneCall className="h-4 w-4" />
                        <span>Call Next</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmDistribution}
                        className="inline-flex items-center gap-2 rounded-full border border-emerald-600 bg-emerald-50 px-5 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Complete</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const nextIndex = familyMasterList?.findIndex(
                            (family, index) =>
                              index > currentFamilyIndex &&
                              !givenFamiliesArray.includes(
                                String(family.household_id || "")
                              )
                          );
                          if (nextIndex !== undefined && nextIndex !== -1) {
                            setPreviousFamilyIndex(currentFamilyIndex);
                            setCurrentFamilyIndex(nextIndex);
                            setItems([]);
                          } else {
                            const firstNotGivenIndex =
                              familyMasterList?.findIndex(
                                (family) =>
                                  !givenFamiliesArray.includes(
                                    String(family.household_id || "")
                                  )
                              );
                            if (
                              firstNotGivenIndex !== undefined &&
                              firstNotGivenIndex !== -1
                            ) {
                              setPreviousFamilyIndex(currentFamilyIndex);
                              setCurrentFamilyIndex(firstNotGivenIndex);
                              setItems([]);
                            }
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <PauseCircle className="h-4 w-4" />
                        <span>Skip</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
                    >
                      <SkipForward className="h-3 w-3" />
                      <span>Auto-call enabled</span>
                    </button>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        Relief Items Distribution
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Select standard packs for this ticket.
                      </p>
                    </div>
                    <div className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                      <ClipboardList className="mr-1 h-3 w-3" />
                      Configured kit
                    </div>
                  </div>

                  <div className="mb-5 grid gap-3 md:grid-cols-3">
                    {PRESET_ITEMS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleAddPreset(preset.id)}
                        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-800 hover:border-slate-300 hover:bg-white"
                      >
                        {preset.icon === "rice" && (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white">
                            <Box className="h-4 w-4" />
                          </span>
                        )}
                        {preset.icon === "water" && (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                            <Droplet className="h-4 w-4" />
                          </span>
                        )}
                        {preset.icon === "canned" && (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                            <Soup className="h-4 w-4" />
                          </span>
                        )}
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-slate-800">
                        Items for Ticket {currentTicket}
                      </h3>
                      <span className="text-[11px] text-slate-500">
                        Total Items: {totalItemTypes} types
                      </span>
                    </div>

                    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
                      {items.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <PackageOpen className="mx-auto h-8 w-8 text-slate-300" />
                          <p className="mt-2 text-xs text-slate-500">
                            No items added yet. Click on Rice, Water, or Canned
                            Goods to add items.
                          </p>
                        </div>
                      ) : (
                        items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-3">
                              {renderItemIcon(item)}
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-slate-900">
                                  {item.name}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  Distribution item
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-medium text-slate-900">
                                Qty: {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setItems((prev) =>
                                    prev.filter((i) => i.id !== item.id)
                                  );
                                }}
                                className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-500 hover:bg-slate-50"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={handleConfirmDistribution}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
                      >
                        <CircleCheckBig className="h-4 w-4" />
                        <span>Confirm Distribution</span>
                      </button>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="w-full space-y-4 lg:w-72">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-sm font-semibold text-slate-900">
                    Queue Status
                  </h2>
                  <dl className="space-y-3 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                          C
                        </span>
                        <span>Current:</span>
                      </dt>
                      <dd className="font-semibold text-slate-900">
                        {currentTicket}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700">
                          N
                        </span>
                        <span>Next:</span>
                      </dt>
                      <dd className="font-semibold text-slate-900">
                        {nextTicket}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-500" />
                        <span>Waiting:</span>
                      </dt>
                      <dd className="font-semibold text-slate-900">
                        {waitingCount}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2">
                        <CircleCheckBig className="h-4 w-4 text-emerald-600" />
                        <span>Completed:</span>
                      </dt>
                      <dd className="font-semibold text-slate-900">
                        {completedCount}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-900">
                      Recent Activity
                    </h2>
                    <button
                      type="button"
                      className="text-xs font-medium text-slate-500 hover:text-slate-700"
                    >
                      View all
                    </button>
                  </div>
                  <div className="space-y-3">
                    {recentActivity.length === 0 ? (
                      <div className="px-2 py-4 text-center">
                        <p className="text-xs text-slate-500">
                          No recent activity
                        </p>
                      </div>
                    ) : (
                      recentActivity.map((ticket) => (
                        <div
                          key={`${ticket.id}-${ticket.timeAgo}`}
                          className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-slate-50"
                        >
                          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                            {ticket.status === "completed" ? (
                              <CircleCheckBig className="h-3 w-3" />
                            ) : (
                              <Circle className="h-3 w-3" />
                            )}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-900">
                              {ticket.id} - {ticket.note}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {ticket.timeAgo}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-sm font-semibold text-slate-900">
                    Today&apos;s Statistics
                  </h2>
                  <dl className="space-y-3 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-500" />
                        <span>Total Served:</span>
                      </dt>
                      <dd className="font-semibold text-slate-900">
                        {completedCount}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-slate-500" />
                        <span>Average Time:</span>
                      </dt>
                      <dd className="font-semibold text-slate-900">3.2 min</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2">
                        <PackageOpen className="h-4 w-4 text-slate-500" />
                        <span>Items Distributed:</span>
                      </dt>
                      <dd className="font-semibold text-slate-900">184</dd>
                    </div>
                  </dl>
                </section>
              </aside>
            </div>
          )}
        </div>
      </main>

      {!isFamilyMasterlistEmpty && (
        <FileImportModal
          isOpen={isImportModalOpen}
          title="Import family master list CSV"
          description="Drop a `.csv` file here or browse to upload. Each row should represent one family record from your masterlist."
          importing={importing}
          summary={importSummary}
          error={importError}
          onClose={handleImportModalClose}
          onFileSelected={(file) => void handleFamilyFile(file)}
        />
      )}
    </div>
  );
}
