import api from "@/api/axios";
import type {
  LoginPayload,
  RegisterPayload,
  LoginResult,
  RegisterResult,
  AuthUser,
  AuthResponse,
} from "@/types/auth.types";

class AuthService {
  async login({ email, password }: LoginPayload): Promise<LoginResult> {
    const { data } = await api.post<AuthResponse<AuthUser>>("/auth/login", {
      email,
      password,
    });

    // Token lives under metadata.token per backend implementation
    const token = data?.metadata?.token ?? null;
    if (!token) {
      throw new Error("Token tidak ditemukan pada response login");
    }

    const user: AuthUser = data.data ?? { id: 0, name: "", email };
    return { success: true, user, token };
  }

  async register({ name, email, password }: RegisterPayload): Promise<RegisterResult> {
    const { data } = await api.post<AuthResponse<AuthUser>>("/auth/register", {
      name,
      email,
      password,
    });

    if (!data.success || !data.data) {
      throw new Error(data.message || "Gagal mendaftar");
    }

    return { success: true, data: data.data };
  }
}

export const authService = new AuthService();
