import { useEffect, useState } from "react";
import type { Task, TaskPayload, TaskStatus } from "../types/task.types";

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: TaskPayload) => Promise<void>;
  initialData: Task | null;
  submitting: boolean;
  serverError?: string;
}

function getTodayString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

interface FormState {
  title: string;
  description: string;
  status: TaskStatus;
  deadline: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  status: "pending",
  deadline: "",
};

export default function TaskModal({ open, onClose, onSubmit, initialData, submitting, serverError }: TaskModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState("");

  const isEdit = Boolean(initialData?.id);
  const todayStr = getTodayString();

  useEffect(() => {
    if (open) {
      setForm(
        initialData
          ? {
              title: initialData.title || "",
              description: initialData.description || "",
              status: initialData.status || "pending",
              deadline: initialData.deadline
                ? String(initialData.deadline).slice(0, 10)
                : "",
            }
          : EMPTY_FORM
      );
      setError("");
    }
  }, [open, initialData]);

  useEffect(() => {
    if (serverError) setError(serverError);
  }, [serverError]);

  if (!open) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Judul tugas wajib diisi");
      return;
    }
    if (!form.deadline) {
      setError("Deadline wajib diisi");
      return;
    }
    setError("");
    await onSubmit({
      title: form.title,
      description: form.description || null,
      status: form.status,
      deadline: form.deadline,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-sm px-4 pb-0 sm:pb-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-xl max-h-[90svh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* drag handle on mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-ink/15" />
        </div>

        <div className="overflow-y-auto flex-1 px-6 pt-3 pb-6 sm:pt-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <h2 className="font-display text-lg font-semibold text-ink">
            {isEdit ? "Edit Tugas" : "Tugas Baru"}
          </h2>
          <p className="mt-1 text-sm text-ink/50">
            {isEdit ? "Perbarui detail tugas ini." : "Tambahkan tugas yang perlu kamu kerjakan."}
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink/80">Judul</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="mis. Rapikan laporan mingguan"
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink/80">Deskripsi</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Detail tambahan (opsional)"
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-ink/80">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  min={isEdit ? undefined : todayStr}
                  required
                  className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
                {!isEdit && (
                  <p className="mt-1 text-xs text-ink/40">Minimal hari ini</p>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-600/20">
                <span className="mt-px shrink-0">⚠</span>
                <span className="flex-1">{error}</span>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="shrink-0 text-red-400 hover:text-red-600"
                  aria-label="Tutup pesan error"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-ink/60 hover:bg-ink/5"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Tugas"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
