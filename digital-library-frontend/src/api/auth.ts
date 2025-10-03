import api from "./client";

export type User = {
  id: number | string;
  email: string;
  role?: string; // 'ADMIN' | 'STUDENT' | etc.
};

export type LoginResponse = {
  accessToken: string;   // normalized
  user: User | null;
};

// Calls POST http://localhost:3000/auth/login
export async function login(dto: { email: string; password: string }): Promise<LoginResponse> {
  const { data } = await api.post("/auth/login", {
    email: dto.email.trim().toLowerCase(),
    password: dto.password,
  });

  // Your backend returns { user, ...token } — extract token variants safely
  const accessToken: string | undefined =
    data?.accessToken || data?.access_token || data?.token || data?.jwt;

  if (!accessToken) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "Login response missing accessToken"
    );
  }

  return {
    accessToken,
    user: (data?.user as User) ?? null,
  };
}

  export async function registerUser(dto: { email: string; name: string; password: string }) {
  const { data } = await api.post("/users/register", dto);
  return data; // user object (no token)
}
