import { Download } from "lucide-react";

const stats = [
  { label: "Total Detections", value: "1,247", color: "text-foreground" },
  { label: "Active Objects", value: "14", color: "text-primary" },
  { label: "Avg Confidence", value: "96.3%", color: "text-accent" },
  { label: "Inference Time", value: "8.2ms", color: "text-success" },
  { label: "NPU Utilization", value: "67%", color: "text-primary" },
  { label: "Alerts Triggered", value: "3", color: "text-warning" },
];

const LiveStats = () => {
  return (
    <div className="bg-surface rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Live Statistics</h3>
        <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
          <Download className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <span className={`text-sm font-mono font-bold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Mini chart placeholder */}
      <div className="mt-5 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Detections (Last 1hr)</p>
        <div className="flex items-end gap-[3px] h-16">
          {Array.from({ length: 30 }, (_, i) => {
            const h = 20 + Math.random() * 80;
            return (
              <div
                key={i}
                className="flex-1 rounded-sm bg-gradient-to-t from-primary/60 to-accent/40 transition-all"
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LiveStats;
