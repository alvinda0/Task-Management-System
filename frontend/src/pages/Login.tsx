import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import type { AxiosError } from "axios";

interface ApiError {
  message: string;
}

export default function Login() {
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const expired = new URLSearchParams(location.search).get("expired");
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/tasks";

  // Redirect to tasks if already authenticated
  useEffect(() => {
    if (isAuthenticated && !expired) {
      navigate("/tasks", { replace: true });
    }
  }, [isAuthenticated, expired, navigate]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      const status = axiosErr?.response?.status;
      const message = axiosErr?.response?.data?.message;

      if (status === 401 || status === 400) {
        setError("Email atau password salah. Periksa kembali.");
      } else if (status === 404) {
        setError("Akun tidak ditemukan. Sudah daftar?");
      } else if (status === 429) {
        setError("Terlalu banyak percobaan login. Coba lagi beberapa saat.");
      } else if (status === 500) {
        setError("Terjadi kesalahan server. Coba beberapa saat lagi.");
      } else if (!axiosErr?.response) {
        setError("Tidak dapat terhubung ke server. Periksa koneksi internetmu.");
      } else {
        setError(message || "Email atau password salah");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f4ff] to-[#faf5ff] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">

        {/* Logo */}
        <div className="w-11 h-11 rounded-xl bg-violet-700 text-white text-xl font-bold flex items-center justify-center mx-auto mb-3">
          T
        </div>

        <h1 className="text-center text-2xl font-bold text-[#1a1a2e] mb-1">Masuk ke Tugasin</h1>
        <p className="text-center text-sm text-gray-500 mb-6">Kelola tugasmu, satu tempat.</p>

        {expired && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            Sesi kamu berakhir. Silakan login kembali.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="kamu@email.com"
              className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/10 transition w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm text-gray-500 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/10 transition w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7a9.77 9.77 0 012.168-3.568M6.343 6.343A9.956 9.956 0 0112 5c5 0 9 4 9 7a9.956 9.956 0 01-1.343 2.657M6.343 6.343L3 3m3.343 3.343L12 12m0 0l3.657 3.657M12 12l5.657 5.657" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 px-3.5 py-2.5 bg-red-50 rounded-xl border border-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 py-3 rounded-xl bg-violet-700 text-white font-semibold text-sm hover:bg-violet-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Belum punya akun?{" "}
          <Link to="/register" className="text-violet-700 font-semibold hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
