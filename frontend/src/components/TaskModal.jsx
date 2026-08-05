import { useEffect, useState } from "react";

const EMPTY_FORM = {
  title: "",
  description: "",
  status: "pending",
  deadline: "",
};

export default function TaskModal({ open, onClose, onSubmit, initialData, submitting }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  const isEdit = Boolean(initialData?.id);

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

  if (!open) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Judul tugas wajib diisi");
      return;
    }
    setError("");
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal menyimpan tugas");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
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
              <label className="block text-sm font-medium text-ink/80">Deadline</label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

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
  );
}
