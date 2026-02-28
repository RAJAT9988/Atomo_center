import { Wifi, Menu, Thermometer, Cpu, Activity } from "lucide-react";

interface Props {
  onToggleSidebar: () => void;
}

const StatusPill = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
    <Icon className={`w-3.5 h-3.5 ${color}`} />
    <span className="text-xs text-muted-foreground hidden md:inline">{label}</span>
    <span className="text-xs font-mono font-medium text-foreground">{value}</span>
  </div>
);

const DashboardTopBar = ({ onToggleSidebar }: Props) => {
  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium">Online</span>
          <span className="text-xs text-muted-foreground font-mono">APU-2026-E7K3</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StatusPill icon={Cpu} label="CPU" value="23%" color="text-primary" />
        <StatusPill icon={Activity} label="NPU" value="67%" color="text-accent" />
        <StatusPill icon={Thermometer} label="Temp" value="42°C" color="text-success" />
        <StatusPill icon={Wifi} label="Network" value="1Gbps" color="text-primary" />
      </div>
    </header>
  );
};

export default DashboardTopBar;
