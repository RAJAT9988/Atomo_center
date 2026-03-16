import { useState } from "react";
import { LogIn } from "lucide-react";

// MeshCentral URL for account creation only (signup). Set via VITE_MESH_CENTRAL_URL env.
const MESH_CENTRAL_URL = (import.meta.env.VITE_MESH_CENTRAL_URL || "https://192.168.1.111:444").replace(/\/$/, "");
// API base for the detection dashboard backend (same as RegistrationScreen).
const API_BASE = (import.meta.env.VITE_UMD_API_BASE || "/umd").replace(/\/$/, "");

interface LoginScreenProps {
  onSuccess: () => void;
}

const LoginScreen = ({ onSuccess }: LoginScreenProps) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const emailOrUsername = formData.get("emailOrUsername") as string | null;
    const password = formData.get("password") as string | null;

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        onSuccess(); // move to device registration step, then dashboard
      } else {
        window.alert(data.message || "Login failed. Please check your username/email and password.");
      }
    } catch (err) {
      window.alert("Unable to reach authentication server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 py-12">
      <div className="w-full max-w-md opacity-0 animate-scale-in">
        <div className="glass rounded-2xl p-8 md:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-atomic flex items-center justify-center">
              <LogIn className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Login</h2>
              <p className="text-sm text-muted-foreground">Sign in to continue to Atomo</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">
                Email or username
              </label>
              <input
                name="emailOrUsername"
                type="text"
                placeholder="you@company.com or your username"
                required
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3.5 rounded-lg bg-gradient-atomic font-semibold text-primary-foreground glow-primary-sm transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <span>Don&apos;t have an account yet? </span>
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={() => {
                // Open MeshCentral account creation page; after creating an account,
                // the user should return here and log in via Atomo.
                window.location.href = `${MESH_CENTRAL_URL}/login?signup=1`;
              }}
            >
              Create one
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
