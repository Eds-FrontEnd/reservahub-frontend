const API_URL = "http://localhost:8080/api";

export interface User {
  name: string;
  email: string;
  password: string;
  perfil: "USER" | "ADMIN";
}

interface LoginResponse {
  token: string;
  nome: string;
  perfil: "USER" | "ADMIN";
}

export const registerUser = async (user: User): Promise<boolean> => {
  const response = await fetch(`${API_URL}/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nome: user.name,
      email: user.email,
      senha: user.password,
    }),
  });

  if (!response.ok) {
    return false;
  }

  return true;
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<User | null> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      senha: password,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data: LoginResponse = await response.json();

  localStorage.setItem("token", data.token);

  return {
    name: data.nome,
    email,
    password: "",
    perfil: data.perfil,
  };
};

export const logoutUser = async (): Promise<boolean> => {
  const token = localStorage.getItem("token");

  if (!token) {
    return true;
  }

  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("authenticatedUser");

    return response.ok;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("authenticatedUser");

    return false;
  }
};

export const resetPassword = (email: string, password: string): boolean => {
  const users = JSON.parse(localStorage.getItem("users") ?? "[]") as User[];

  const userExists = users.some((user) => user.email === email);

  if (!userExists) {
    return false;
  }

  const updatedUsers = users.map((user) =>
    user.email === email
      ? {
          ...user,
          password,
        }
      : user,
  );

  localStorage.setItem("users", JSON.stringify(updatedUsers));

  return true;
};
