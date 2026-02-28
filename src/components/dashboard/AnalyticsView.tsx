import { BarChart3, TrendingUp, Clock, Target } from "lucide-react";

const AnalyticsView = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-1">Analytics</h1>
        <p className="text-muted-foreground">Real-time detection metrics and trends</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Target, label: "Total Detections", value: "24,891", sub: "+12% today", color: "text-primary" },
          { icon: TrendingUp, label: "Avg Confidence", value: "96.4%", sub: "+0.3% vs yesterday", color: "text-accent" },
          { icon: Clock, label: "Avg Inference", value: "8.1ms", sub: "Within target", color: "text-success" },
          { icon: BarChart3, label: "Alerts Today", value: "17", sub: "3 critical", color: "text-warning" },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="bg-surface rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Detection Timeline</h3>
        <div className="h-64 flex items-end gap-1">
          {Array.from({ length: 48 }, (_, i) => {
            const h = 15 + Math.sin(i * 0.3) * 30 + Math.random() * 40;
            return (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-primary/70 to-accent/50 hover:from-primary hover:to-accent transition-all cursor-pointer"
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground font-mono">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </div>

      {/* Recent alerts */}
      <div className="bg-surface rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
        <div className="space-y-3">
          {[
            { time: "14:32", msg: "Fire detected — Main Entrance", level: "critical" },
            { time: "13:15", msg: "PPE violation — Factory Floor A", level: "warning" },
            { time: "11:47", msg: "Unauthorized access — Parking Lot", level: "warning" },
          ].map((alert, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className={`w-2 h-2 rounded-full ${alert.level === "critical" ? "bg-destructive" : "bg-warning"}`} />
              <span className="text-xs font-mono text-muted-foreground">{alert.time}</span>
              <span className="text-sm">{alert.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
