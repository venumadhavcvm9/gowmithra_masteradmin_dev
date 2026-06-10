// src/services/auth.ts

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "STOCK" | "SALES" | "MARKETING";
}

// Map paths to roles authorized to access them
const rolePermissions: Record<string, string[]> = {
  "/dashboard": ["ADMIN"],
  "/team": ["ADMIN"],
  "/sales": ["ADMIN", "SALES"],
  "/users": ["ADMIN", "MARKETING"],
  "/area-doctors": ["ADMIN", "MARKETING"],
  "/medicines": ["ADMIN", "STOCK"],
  "/orders": ["ADMIN", "SALES"],
  "/vendors": ["ADMIN", "STOCK"]
};

// 🔹 Login Operation: Cache details
export const loginUser = (user: AuthUser, token?: string) => {
  localStorage.setItem("user", JSON.stringify(user));
  if (token) {
    localStorage.setItem("token", token);
  }
};

// 🔹 Logout Operation: Clear cache
export const logoutUser = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

// 🔹 Check Authentication State
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("user");
};

// 🔹 Get Authenticated User Profile
export const getCurrentUser = (): AuthUser | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as AuthUser;
  } catch (e) {
    return null;
  }
};

// 🔹 Evaluate Path Access Authorization
export const hasAccess = (path: string): boolean => {
  const user = getCurrentUser();
  if (!user) return false;

  // Master Admin has absolute access to every page
  if (user.role === "ADMIN") return true;

  // Resolve matching route permissions
  const allowedRoles = rolePermissions[path];
  if (!allowedRoles) return true; // Standard public path

  return allowedRoles.includes(user.role);
};

// 🔹 Resolve Primary Landing Screen depending on role
export const getPrimaryLandingPath = (role: string): string => {
  switch (role) {
    case "ADMIN":
      return "/dashboard";
    case "STOCK":
      return "/medicines";
    case "SALES":
      return "/sales";
    case "MARKETING":
      return "/area-doctors";
    default:
      return "/dashboard";
  }
};
