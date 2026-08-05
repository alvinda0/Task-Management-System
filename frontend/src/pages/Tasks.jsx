import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import TaskModal from "../components/TaskModal.jsx";

const FILTERS = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function Tasks() {
  const { user, logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTasks = useCallback(async (status) => {
    setLoading(true);
    setError("");
    try {
      const params = status && status !== "all" ? { status } : {};
      const res = await api.get("/tasks", { params });
      setTasks(res.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal memuat daftar tugas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(filter);
  }, [filter, fetchTasks]);

  const visibleTasks = useMemo(() => {
    if (!search.trim()) return tasks;
    const q = search.toLowerCase();
    return tasks.filter((t) => t.title?.toLowerCase().includes(q));
  }, [tasks, search]);

  function openCreateModal() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEditModal(task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  async function handleSubmitTask(form) {
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        status: form.status,
        deadline: form.deadline || null,
      };

      if (editingTask?.id) {
        const res = await api.put(`/tasks/${editingTask.id}`, payload);
        const updated = res.data?.data;
        setTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? { ...t, ...(updated || payload) } : t))
        );
      } else {
        const res = await api.post("/tasks", payload);
        const created = res.data?.data;
        if (created) {
          setTasks((prev) => [created, ...prev]);
        } else {
          fetchTasks(filter);
        }
      }
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/tasks/${deleteTarget.id}`);
      setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal menghapus tugas");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
              T
            </div>
            <span className="font-display text-lg font-semibold text-ink">Tugasin</span>
          </div>
          <div className="flex items-center gap-3">
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

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-ink">Daftar Tugas</h1>
            <p className="mt-0.5 text-sm text-ink/50">
              {visibleTasks.length} tugas {filter !== "all" ? `· ${FILTERS.find((f) => f.value === filter)?.label}` : ""}
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            + Tugas Baru
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  filter === f.value
                    ? "bg-ink text-white"
                    : "bg-white text-ink/60 ring-1 ring-inset ring-ink/10 hover:bg-ink/5"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul tugas..."
            className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 sm:w-64"
          />
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-600/20">
            {error}
          </div>
        )}

        <div className="mt-5">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-ink/5" />
              ))}
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink/15 bg-white/60 py-14 text-center">
              <p className="font-medium text-ink/70">Belum ada tugas di sini.</p>
              <p className="mt-1 text-sm text-ink/40">
                Klik "Tugas Baru" untuk mulai menambahkan.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {visibleTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-start justify-between gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-ink/5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-medium text-ink">{task.title}</h3>
                      <StatusBadge status={task.status} />
                    </div>
                    {task.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-ink/55">{task.description}</p>
                    )}
                    {formatDate(task.deadline) && (
                      <p className="mt-1.5 text-xs text-ink/40">
                        Deadline: {formatDate(task.deadline)}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      onClick={() => openEditModal(task)}
                      className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink/60 hover:bg-ink/5"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(task)}
                      className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitTask}
        initialData={editingTask}
        submitting={submitting}
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
