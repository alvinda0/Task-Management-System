import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal mendaftar, coba lagi");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-lg font-bold text-white">
            T
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">Buat akun Tugasin</h1>
          <p className="mt-1 text-sm text-ink/50">Gratis, cuma butuh satu menit.</p>
        </div>

        {success ? (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-ink/5">
            <p className="text-sm font-medium text-emerald-700">
              Akun berhasil dibuat. Mengarahkan ke halaman login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
            <div>
              <label className="block text-sm font-medium text-ink/80">Nama</label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Nama lengkap"
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80">Email</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="kamu@email.com"
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={form.password}
                onChange={handleChange}
                placeholder="Minimal 6 karakter"
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-ink/60">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
