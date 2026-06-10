// src/pages/login/Login.tsx

import "./login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, getPrimaryLandingPath } from "../../services/auth";
import API from "../../services/api";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Verifying credentials...");

    try {
      const { data } = await API.post("/auth/login", form);

      if (!data?.user) {
        throw new Error("Invalid response from server.");
      }

      loginUser(data.user, data.token);
      toast.success("Access granted!", { id: loadingToast });
      navigate(getPrimaryLandingPath(data.user.role));
    } catch (err: any) {
      const message = err.response?.data?.message || "Login failed. Please try again.";
      toast.error(message, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <Toaster position="top-right" />

      {/* Background decorative orbs */}
      <div className="bg-orb bg-orb--primary" />
      <div className="bg-orb bg-orb--secondary" />

      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3L20 8.5V15.5L12 21L4 15.5V8.5L12 3Z"
                fill="white"
                fillOpacity="0.9"
              />
            </svg>
          </div>
          <h1 className="login-brand__name">GowMithra</h1>
          <p className="login-brand__tagline">Veterinary Operations ERP</p>
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h2>Welcome back</h2>
          <p>Sign in to access your workspace.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="field">
            <label htmlFor="email">Work Email</label>
            <div className="field__input-wrapper">
              <FaEnvelope className="field__icon" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@gowmithra.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="field__input-wrapper">
              <FaLock className="field__icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="field__eye-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}