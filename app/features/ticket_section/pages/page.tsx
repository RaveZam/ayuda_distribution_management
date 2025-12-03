"use client";

import { useEffect, useState } from "react";
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

  const [currentTicket] = useState("A-047");
  const [nextTicket] = useState("A-048");
  const [waitingCount] = useState(23);
  const [completedCount] = useState(46);

  const [items, setItems] = useState<TicketItem[]>([
    {
      id: "1",
      name: "Rice (5kg)",
      icon: "rice",
      quantity: 2,
      unit: "sack",
    },
    {
      id: "2",
      name: "Water (1L)",
      icon: "water",
      quantity: 6,
      unit: "bottle",
    },
    {
      id: "3",
      name: "Canned Sardines",
      icon: "canned",
      quantity: 4,
      unit: "can",
    },
  ]);

  const [recentActivity] = useState<QueueTicket[]>([
    {
      id: "A-046",
      status: "completed",
      timeAgo: "2 min ago",
      note: "Completed",
    },
    {
      id: "A-045",
      status: "completed",
      timeAgo: "5 min ago",
      note: "Completed",
    },
    {
      id: "A-044",
      status: "skipped",
      timeAgo: "8 min ago",
      note: "Skipped",
    },
  ]);

  const [customName, setCustomName] = useState("");
  const [customQty, setCustomQty] = useState(0);

  const totalItemTypes = items.length;

  // Decide when to show the family masterlist import modal and log any existing data
  useEffect(() => {
    if (
      !familyMasterList ||
      !Array.isArray(familyMasterList) ||
      familyMasterList.length === 0
    ) {
      setIsImportModalOpen(true);
      return;
    }

    // family_master_list already exists in localStorage: log summary and proceed
    console.info(
      "[TicketManager] Loaded family_master_list from localStorage",
      {
        totalRows: familyMasterList.length,
        sample: familyMasterList.slice(0, 10),
      }
    );
    setIsImportModalOpen(false);
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

  const handleAddCustom = () => {
    if (!customName.trim() || customQty <= 0) return;

    setItems((prev) => [
      ...prev,
      {
        id: `${Date.now()}-custom`,
        name: customName.trim(),
        icon: "custom",
        quantity: customQty,
        unit: "unit",
      },
    ]);

    setCustomName("");
    setCustomQty(0);
  };

  const incrementQty = () => setCustomQty((q) => q + 1);
  const decrementQty = () =>
    setCustomQty((q) => {
      if (q <= 0) return 0;
      return q - 1;
    });

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

                <div className="mb-5 rounded-2xl bg-slate-900 px-8 py-10 text-center text-white shadow-inner">
                  <div className="text-sm uppercase tracking-[0.25em] text-slate-300">
                    Ticket
                  </div>
                  <div className="mt-4 text-5xl font-semibold tracking-[0.2em]">
                    {formatTicketLabel(currentTicket)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 md:justify-between">
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                    >
                      <PhoneCall className="h-4 w-4" />
                      <span>Call Next</span>
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-600 bg-emerald-50 px-5 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Complete</span>
                    </button>
                    <button
                      type="button"
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
                      Select standard packs or add custom items for this ticket.
                    </p>
                  </div>
                  <div className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                    <ClipboardList className="mr-1 h-3 w-3" />
                    Configured kit
                  </div>
                </div>

                <div className="mb-5 grid gap-3 md:grid-cols-4">
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

                  <button
                    type="button"
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-xs font-medium text-slate-500 hover:border-slate-400 hover:text-slate-700"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600">
                      <Plus className="h-4 w-4" />
                    </span>
                    <span>Add Custom</span>
                  </button>
                </div>

                <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="mb-3 text-xs font-semibold text-slate-800">
                    Add Custom Item
                  </h3>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="flex-1">
                      <label className="mb-1 block text-[11px] font-medium text-slate-500">
                        Item Name
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Enter item name"
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                      />
                    </div>
                    <div className="w-full md:w-40">
                      <label className="mb-1 block text-[11px] font-medium text-slate-500">
                        Quantity
                      </label>
                      <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                        <button
                          type="button"
                          onClick={decrementQty}
                          className="flex h-9 w-9 items-center justify-center border-r border-slate-200 text-slate-600 hover:bg-slate-50"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={customQty}
                          onChange={(e) =>
                            setCustomQty(Math.max(0, Number(e.target.value)))
                          }
                          className="h-9 w-full border-0 bg-transparent text-center text-xs text-slate-900 focus:outline-none focus:ring-0"
                        />
                        <button
                          type="button"
                          onClick={incrementQty}
                          className="flex h-9 w-9 items-center justify-center border-l border-slate-200 text-slate-600 hover:bg-slate-50"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex w-full justify-end md:w-auto">
                      <button
                        type="button"
                        onClick={handleAddCustom}
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Item</span>
                      </button>
                    </div>
                  </div>
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
                    {items.map((item) => (
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
                            className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-500 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-end">
                    <button
                      type="button"
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
                  {recentActivity.map((ticket) => (
                    <div
                      key={ticket.id}
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
                          {ticket.id} {ticket.note}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {ticket.timeAgo}
                        </span>
                      </div>
                    </div>
                  ))}
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
        </div>
      </main>

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
    </div>
  );
}
