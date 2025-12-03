"use client";

import { useRef, ChangeEvent, DragEvent } from "react";
import { FileUp, Loader2, X } from "lucide-react";

export type FileImportSummary = {
  filename: string;
  rows: number;
};

type FileImportModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  importing: boolean;
  summary: FileImportSummary | null;
  error: string | null;
  onClose: () => void;
  onFileSelected: (file: File) => void;
};

export function FileImportModal({
  isOpen,
  title,
  description,
  importing,
  summary,
  error,
  onClose,
  onFileSelected,
}: FileImportModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  const handleBrowseClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-8">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
            onClick={onClose}
            aria-label="Close import modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label
          htmlFor="file-import-input"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-10 text-center transition hover:border-slate-400 hover:bg-slate-50"
        >
          <input
            ref={inputRef}
            id="file-import-input"
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={handleFileInput}
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900/5 text-slate-900">
            {importing ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <FileUp className="h-8 w-8" />
            )}
          </div>
          <div className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">Drop file here</span>{" "}
            or click to browse
          </div>
          <p className="text-xs text-slate-500">
            Supports .csv files powered by PapaParse for reliable parsing.
          </p>
          <button
            type="button"
            className="mt-2 rounded-full border border-slate-900 px-4 py-1 text-xs font-semibold text-slate-900 hover:bg-slate-900 hover:text-white"
            onClick={handleBrowseClick}
          >
            Choose file
          </button>
        </label>

        {summary && (
          <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Successfully parsed{" "}
            <span className="font-semibold">{summary.rows}</span> rows from{" "}
            <span className="font-semibold">{summary.filename}</span>.
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={!summary}
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
