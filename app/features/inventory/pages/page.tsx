"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Bell,
  Download,
  Upload,
  Plus,
  PackageSearch,
  Boxes,
  AlertTriangle,
  CalendarClock,
  DollarSign,
  Search,
  Filter,
  ListFilter,
  SquarePen,
  Trash2,
  Menu,
} from "lucide-react";
import { parseCsvFile } from "@/app/core/utils/parseCsv";
import {
  FileImportModal,
  FileImportSummary,
} from "@/app/features/inventory/components/file_modal";
import { useLocalStorageState } from "@/app/core/hooks/useLocalStorageState";

type InventoryCsvRow = {
  item_name?: string;
  total_quantity?: number | string;
  unit?: string;
};

type InventoryBasicItem = {
  item_name: string;
  total_quantity: number;
  unit: string;
};

type InventoryTableItem = {
  name: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  status: string;
  statusVariant: "default" | "warning";
  lastUpdated: string;
};

function computeItemValuePeso(item: InventoryBasicItem): number {
  const name = item.item_name.toLowerCase();

  if (name.includes("rice")) {
    // 55 pesos per kilogram of rice
    return item.total_quantity * 55;
  }

  if (name.includes("instant") || name.includes("noodle")) {
    // 8 pesos per instant noodle pack
    return item.total_quantity * 8;
  }

  if (name.includes("tuna")) {
    // 30 pesos per canned tuna
    return item.total_quantity * 30;
  }

  if (name.includes("bottled water") || name.includes("bottle")) {
    // 20 pesos per bottled water
    return item.total_quantity * 20;
  }

  if (name.includes("infant")) {
    // Leave infant kit value as null/zero for now
    return 0;
  }

  // Unknown item types are treated as zero value for now
  return 0;
}

export default function InventoryPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<FileImportSummary | null>(
    null
  );
  const [storedItems, setStoredItems] = useLocalStorageState<
    InventoryBasicItem[] | null
  >("inventoryBasicItems", null);

  const totalQuantity =
    storedItems?.reduce((sum, item) => sum + item.total_quantity, 0) ?? 0;

  const lowStockCount =
    storedItems?.filter(
      (item) => item.total_quantity > 0 && item.total_quantity < 10
    ).length ?? 0;

  const itemTypes = storedItems?.length ?? 0;

  const totalValuePeso =
    storedItems?.reduce((sum, item) => sum + computeItemValuePeso(item), 0) ??
    0;

  const formattedTotalValue =
    totalValuePeso > 0 ? `₱${totalValuePeso.toLocaleString("en-PH")}` : "₱0";

  const handleFile = async (file?: File) => {
    if (!file) return;
    setImporting(true);
    setImportError(null);
    try {
      const parsedRows = await parseCsvFile<InventoryCsvRow>(file);
      const newItems: InventoryBasicItem[] = parsedRows
        .filter((row) => row.item_name)
        .map((row) => ({
          item_name: row.item_name ?? "",
          total_quantity:
            typeof row.total_quantity === "string"
              ? Number(row.total_quantity) || 0
              : row.total_quantity ?? 0,
          unit: row.unit ?? "",
        }));

      setStoredItems((prev) => {
        const existing = prev ?? [];
        const merged: InventoryBasicItem[] = [...existing];

        for (const incoming of newItems) {
          const index = merged.findIndex(
            (item) => item.item_name === incoming.item_name
          );

          if (index === -1) {
            merged.push(incoming);
          } else {
            merged[index] = {
              ...merged[index],
              total_quantity:
                merged[index].total_quantity + incoming.total_quantity,
            };
          }
        }

        return merged;
      });
      setImportSummary({ filename: file.name, rows: parsedRows.length });
      console.info("Parsed inventory items (merged):", newItems);
    } catch (error) {
      console.error(error);
      setImportSummary(null);
      setImportError("Failed to parse file. Ensure it is a valid CSV.");
    } finally {
      setImporting(false);
    }
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setImportError(null);
    setImportSummary(null);
  };

  const items: InventoryTableItem[] =
    storedItems?.map((item) => ({
      name: item.item_name,
      description: "",
      category: "",
      quantity: item.total_quantity,
      unit: item.unit,
      status: "In Stock",
      statusVariant: "default",
      lastUpdated: "",
    })) ?? [];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-900">
      {/* Sidebar */}
      {isSidebarOpen && <Sidebar />}

      {/* Page content */}
      <main className="flex flex-1 flex-col">
        {/* Top navigation */}
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
                RM
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900">
                  Relief Inventory Management
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
          <div className="mx-auto w-full max-w-6xl px-6 py-8 md:px-10">
            {/* Header row */}
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Inventory Management
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Manage relief goods and food supplies inventory.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-3 w-3" />
                  <span>Export</span>
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setIsImportModalOpen(true)}
                >
                  <Upload className="h-3 w-3" />
                  <span>Import CSV/XLSX</span>
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            <section className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                      <Boxes className="h-5 w-5" />
                    </div>
                    <div className="text-xs font-medium text-slate-500">
                      Total Quantity
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-semibold tracking-tight text-slate-900">
                  {totalQuantity}
                </div>
              </div>

              <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="text-xs font-medium text-slate-500">
                      Low Stock Items
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-semibold tracking-tight text-slate-900">
                  {lowStockCount}
                </div>
              </div>

              <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                      <CalendarClock className="h-5 w-5" />
                    </div>
                    <div className="text-xs font-medium text-slate-500">
                      Item Types
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-semibold tracking-tight text-slate-900">
                  {itemTypes}
                </div>
              </div>

              <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div className="text-xs font-medium text-slate-500">
                      Total Value (₱)
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-semibold tracking-tight text-slate-900">
                  {formattedTotalValue}
                </div>
              </div>
            </section>

            {/* Filters */}
            <section className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <Search className="h-3 w-3" />
                  </span>
                  <input
                    type="search"
                    placeholder="Search items..."
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-300"
                  />
                </div>
                <div className="flex gap-3">
                  <select className="h-9 min-w-[140px] rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300">
                    <option>All Categories</option>
                  </select>
                  <select className="h-9 min-w-[120px] rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300">
                    <option>All Status</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  aria-label="Toggle view"
                >
                  <ListFilter className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  aria-label="Filters"
                >
                  <Filter className="h-4 w-4" />
                </button>
              </div>
            </section>

            <section className="mb-8 flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-left text-xs text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                      <th className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          className="size-3 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                          aria-label="Select all items"
                        />
                      </th>
                      <th className="px-4 py-3">ITEM NAME</th>
                      <th className="px-4 py-3">CATEGORY</th>
                      <th className="px-4 py-3 text-right">QUANTITY</th>
                      <th className="px-4 py-3">UNIT</th>
                      <th className="px-4 py-3">STATUS</th>
                      <th className="px-4 py-3">LAST UPDATED</th>
                      <th className="px-4 py-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.name}
                        className="border-t border-slate-100 text-xs text-slate-800 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 align-top">
                          <input
                            type="checkbox"
                            className="size-3 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                            aria-label={`Select ${item.name}`}
                          />
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                              <PackageSearch className="h-4 w-4 text-slate-700" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-slate-900">
                                {item.name}
                              </span>
                              <span className="mt-0.5 text-[11px] text-slate-500">
                                {item.description}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top text-xs text-slate-600">
                          {item.category}
                        </td>
                        <td className="px-4 py-3 align-top text-right text-xs font-medium">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 align-top text-xs text-slate-600">
                          {item.unit}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              item.statusVariant === "warning"
                                ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                : "bg-slate-50 text-slate-700 ring-1 ring-slate-200"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top text-xs text-slate-600">
                          {item.lastUpdated}
                        </td>
                        <td className="px-4 py-3 align-top text-right">
                          <div className="inline-flex items-center gap-2 text-slate-400">
                            <button
                              type="button"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50"
                              aria-label={`Edit ${item.name}`}
                            >
                              <SquarePen className="h-3 w-3 text-slate-600" />
                            </button>
                            <button
                              type="button"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-rose-50"
                              aria-label={`Delete ${item.name}`}
                            >
                              <Trash2 className="h-3 w-3 text-slate-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>

      <FileImportModal
        isOpen={isImportModalOpen}
        title="Import inventory CSV"
        description="Drop a `.csv` file here or browse to upload. PapaParse will handle quoting, delimiters, and newlines."
        importing={importing}
        summary={importSummary}
        error={importError}
        onClose={closeImportModal}
        onFileSelected={(file) => void handleFile(file)}
      />
    </div>
  );
}
