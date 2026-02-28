import { Bell, Shield, Webhook, FileDown, Users } from "lucide-react";

const SettingsView = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-1">Settings</h1>
        <p className="text-muted-foreground">Device configuration and integrations</p>
      </div>

      <div className="space-y-4">
        {[
          { icon: Bell, title: "Alert Configuration", desc: "Set up alert triggers, thresholds, and notification channels" },
          { icon: Webhook, title: "Webhook Integration", desc: "Configure HTTP webhooks for real-time event forwarding" },
          { icon: Shield, title: "MQTT Output", desc: "Send detection events to an MQTT broker" },
          { icon: FileDown, title: "CSV Export", desc: "Export detection data and analytics reports" },
          { icon: Users, title: "Role-Based Access", desc: "Manage user accounts and permission levels" },
        ].map((item) => (
          <button
            key={item.title}
            className="w-full bg-surface rounded-xl p-5 flex items-center gap-4 text-left hover:border-primary/30 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
            <span className="text-muted-foreground">→</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SettingsView;
