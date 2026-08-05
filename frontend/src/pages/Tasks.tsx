import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { taskService } from "../services/task.service";
import StatusBadge from "../components/StatusBadge";
import TaskModal from "../components/TaskModal";
import type { Task, TaskPayload, TaskStatus, PaginationMeta } from "../types/task.types";
import type { AxiosError } from "axios";

type FilterValue = TaskStatus | "all";

interface ApiErrorResponse {
  message?: string;
}

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function getDeadlineUrgency(value: string | null | undefined, status: string): "overdue" | "soon" | "ok" | null {
  if (!value || status === "done") return null;
  const deadline = new Date(value);
  deadline.setHours(0, 0, 0, 0);
  if (Number.isNaN(deadline.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "overdue";
  if (diffDays <= 3) return "soon";
  return "ok";
}

const DEADLINE_STYLES: Record<"overdue" | "soon" | "ok", string> = {
  overdue: "text-red-600 font-medium",
  soon: "text-amber-600 font-medium",
  ok: "text-ink/40",
};

export default function Tasks() {
  const { user, logout } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, total_pages: 1 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTasks = useCallback(async (status: FilterValue, currentPage: number, searchQuery: string) => {
    setLoading(true);
    setError("");
    try {
      const result = await taskService.getTasks({ status, page: currentPage, limit: 10, search: searchQuery });
      setTasks(result.tasks);
      setMeta(result.meta);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      setError(axiosErr?.response?.data?.message || "Gagal memuat daftar tugas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(filter, page, search);
  }, [filter, page, search, fetchTasks]);

  // Reset ke page 1 saat filter atau search berubah
  useEffect(() => {
    setPage(1);
  }, [filter, search]);


  function openCreateModal() {
    setEditingTask(null);
    setModalError("");
    setModalOpen(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setModalError("");
    setModalOpen(true);
  }

  async function handleSubmitTask(form: TaskPayload) {
    setSubmitting(true);
    setModalError("");
    try {
      const payload: TaskPayload = {
        title: form.title,
        description: form.description || null,
        status: form.status,
        deadline: form.deadline,
      };

      if (editingTask?.id) {
        const updated = await taskService.updateTask(editingTask.id, payload);
        setTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? { ...t, ...(updated || payload) } : t))
        );
      } else {
        await taskService.createTask(payload);
        await fetchTasks(filter, page, search);
      }
      setModalOpen(false);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      const status = axiosErr?.response?.status;
      const message = axiosErr?.response?.data?.message;

      if (status === 422 || status === 400) {
        setModalError(message || "Data tugas tidak valid. Periksa kembali isian kamu.");
      } else if (status === 403) {
        setModalError("Kamu tidak punya izin untuk mengubah tugas ini.");
      } else if (status === 500) {
        setModalError("Terjadi kesalahan server. Coba beberapa saat lagi.");
      } else if (!axiosErr?.response) {
        setModalError("Tidak dapat terhubung ke server. Periksa koneksi internetmu.");
      } else {
        setModalError(message || (err as Error)?.message || "Gagal menyimpan tugas");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await taskService.deleteTask(deleteTarget.id);
      setDeleteTarget(null);
      // Kalau task yang dihapus adalah satu-satunya di halaman ini,
      // mundur ke halaman sebelumnya supaya tidak landing di halaman kosong
      const isLastItemOnPage = tasks.length === 1 && page > 1;
      const targetPage = isLastItemOnPage ? page - 1 : page;
      if (isLastItemOnPage) setPage(targetPage);
      await fetchTasks(filter, targetPage, search);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      const status = axiosErr?.response?.status;
      const message = axiosErr?.response?.data?.message;

      if (status === 403) {
        setError("Kamu tidak punya izin untuk menghapus tugas ini.");
      } else if (status === 404) {
        setError("Tugas tidak ditemukan. Mungkin sudah dihapus sebelumnya.");
        setDeleteTarget(null);
        await fetchTasks(filter, page, search);
      } else if (!axiosErr?.response) {
        setError("Tidak dapat terhubung ke server. Periksa koneksi internetmu.");
      } else {
        setError(message || "Gagal menghapus tugas");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-paper">
      <header className="shrink-0 border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
              T
            </div>
            <span className="font-display text-lg font-semibold text-ink">Tugasin</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden text-sm text-ink/60 sm:inline">
              {user?.name || user?.email}
            </span>
            <button
              onClick={logout}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink/70 ring-1 ring-inset ring-ink/15 hover:bg-ink/5"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-4 py-5 sm:px-6 sm:py-8 overflow-hidden">
        {/* Title + CTA */}
        <div className="shrink-0 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-ink">Daftar Tugas</h1>
            <p className="mt-0.5 text-sm text-ink/50">
              {meta.total} tugas{filter !== "all" ? ` · ${FILTERS.find((f) => f.value === filter)?.label}` : ""}
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            + Tugas Baru
          </button>
        </div>

        {/* Filter pills */}
        <div className="mt-4 shrink-0 flex gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                filter === f.value
                  ? "bg-ink text-white"
                  : "bg-white text-ink/60 ring-1 ring-inset ring-ink/10 hover:bg-ink/5"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mt-3 shrink-0">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul tugas..."
            className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        {error && (
          <div className="mt-3 shrink-0 flex items-start justify-between gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-600/20">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="shrink-0 text-red-400 hover:text-red-600"
              aria-label="Tutup pesan error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Task list */}
        <div className="mt-4 flex-1 overflow-y-auto min-h-0 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-ink/5" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink/15 bg-white/60 py-14 text-center">
              <p className="font-medium text-ink/70">Belum ada tugas di sini.</p>
              <p className="mt-1 text-sm text-ink/40">
                Klik "+ Tugas Baru" untuk mulai menambahkan.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-ink/5"
                >
                  {/* Row 1: title + badge */}
                  <div className="flex items-start gap-2">
                    <h3 className="flex-1 font-medium text-ink leading-snug break-words min-w-0">
                      {task.title}
                    </h3>
                    <div className="shrink-0 mt-0.5">
                      <StatusBadge status={task.status} />
                    </div>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-ink/55">{task.description}</p>
                  )}

                  {/* Deadline */}
                  {formatDate(task.deadline) && (
                    <p className={`mt-1.5 text-xs ${DEADLINE_STYLES[getDeadlineUrgency(task.deadline, task.status) ?? "ok"]}`}>
                      {getDeadlineUrgency(task.deadline, task.status) === "overdue" && "⚠ "}
                      {getDeadlineUrgency(task.deadline, task.status) === "soon" && "⏰ "}
                      Deadline: {formatDate(task.deadline)}
                    </p>
                  )}

                  {/* Row 3: actions */}
                  <div className="mt-3 flex items-center justify-end gap-2 border-t border-ink/5 pt-3">
                    <button
                      onClick={() => openEditModal(task)}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink/60 ring-1 ring-inset ring-ink/10 hover:bg-ink/5 active:bg-ink/10"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(task)}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 ring-1 ring-inset ring-red-600/15 hover:bg-red-50 active:bg-red-100"
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {meta.total_pages > 1 && (
          <div className="mt-3 shrink-0 flex items-center justify-between gap-2">
            <p className="text-xs text-ink/50 whitespace-nowrap">
              Hal. {meta.page}/{meta.total_pages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink/60 ring-1 ring-inset ring-ink/10 hover:bg-ink/5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>

              {Array.from({ length: meta.total_pages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === meta.total_pages || Math.abs(p - page) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-xs text-ink/40">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      disabled={loading}
                      className={`min-w-[2rem] rounded-lg px-2 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed ${
                        page === item
                          ? "bg-ink text-white"
                          : "text-ink/60 ring-1 ring-inset ring-ink/10 hover:bg-ink/5"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
                disabled={page >= meta.total_pages || loading}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink/60 ring-1 ring-inset ring-ink/10 hover:bg-ink/5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </main>

      <TaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setModalError(""); }}
        onSubmit={handleSubmitTask}
        initialData={editingTask}
        submitting={submitting}
        serverError={modalError}
      />

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm px-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-lg font-semibold text-ink">Hapus tugas ini?</h2>
            <p className="mt-1.5 text-sm text-ink/55">
              "{deleteTarget.title}" akan dihapus permanen. Aksi ini tidak bisa dibatalkan.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-ink/60 hover:bg-ink/5"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
