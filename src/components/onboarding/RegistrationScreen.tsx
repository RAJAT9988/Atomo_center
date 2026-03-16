import { useState } from "react";
import { MapPin, Cpu } from "lucide-react";

interface RegistrationScreenProps {
  onSuccess: () => void;
}

const RegistrationScreen = ({ onSuccess }: RegistrationScreenProps) => {
  const apiBase = import.meta.env.VITE_UMD_API_BASE || "/umd";
  const [cloudSync, setCloudSync] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      const payload = {
        serial: String(fd.get("serial") || "").trim(),
        deviceName: String(fd.get("deviceName") || "").trim(),
        orgName: String(fd.get("orgName") || "").trim(),
        email: String(fd.get("email") || "").trim(),
        phone: String(fd.get("phone") || "").trim(),
        location: String(fd.get("location") || "").trim(),
        cloudSync,
      };

      const r = await fetch(`${apiBase}/api/device/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = (await r.json()) as { ok?: boolean; id?: number; error?: string };
      if (!r.ok) throw new Error(j.error || "Failed to register device");

      setLoading(false);
      onSuccess();
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Failed to register device");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 py-12">
      <div className="w-full max-w-lg opacity-0 animate-scale-in">
        <div className="glass rounded-2xl p-8 md:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-atomic flex items-center justify-center">
              <Cpu className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Register Your Device</h2>
              <p className="text-sm text-muted-foreground">Connect your Atomo Processing Unit</p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">Device Serial Number</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="serial"
                  placeholder="APU-XXXX-XXXX-XXXX"
                  defaultValue="APU-2026-E7K3-9F1A"
                  className="flex-1 px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-sm"
                />
                <button type="button" className="px-4 py-3 rounded-lg border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors">
                  Auto-detect
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">Device Name</label>
              <input
                type="text"
                name="deviceName"
                placeholder="e.g., Factory Floor Unit 1"
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">Organization Name</label>
              <input
                type="text"
                name="orgName"
                placeholder="Your company or team name"
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-foreground mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="admin@company.com"
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-foreground mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">
                <MapPin className="w-3.5 h-3.5 inline mr-1" />Location <span className="text-muted-foreground">(Optional)</span>
              </label>
              <input
                type="text"
                name="location"
                placeholder="City, State"
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <label className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border cursor-pointer hover:bg-muted transition-colors">
              <input
                type="checkbox"
                checked={cloudSync}
                onChange={(e) => setCloudSync(e.target.checked)}
                className="w-4 h-4 rounded accent-primary"
              />
              <div>
                <span className="text-sm font-medium">Activate Cloud Sync</span>
                <p className="text-xs text-muted-foreground">Enable remote monitoring and analytics</p>
              </div>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3.5 rounded-lg bg-gradient-atomic font-semibold text-primary-foreground glow-primary-sm transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Registering...
                  </span>
                ) : (
                  "Register Device"
                )}
              </button>
              <button
                type="button"
                className="px-6 py-3.5 rounded-lg border border-border font-medium text-muted-foreground hover:bg-secondary transition-colors"
              >
                Skip
              </button>
            </div>
          </form>

          {error && <p className="mt-4 text-xs text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default RegistrationScreen;
