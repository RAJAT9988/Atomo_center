import { Plus, Camera, Activity, Brain, AlertTriangle } from "lucide-react";
import type { CameraConfig } from "@/pages/Dashboard";

const mockCameras: CameraConfig[] = [
  { id: "1", name: "Main Entrance", type: "rtsp", status: "online", resolution: "1920x1080", fps: 30, model: "Fire Detection", cpuUsage: 12, npuUsage: 45 },
  { id: "2", name: "Factory Floor A", type: "usb", status: "online", resolution: "1280x720", fps: 25, model: "PPE Detection", cpuUsage: 8, npuUsage: 38 },
];

interface Props {
  onAddCamera: () => void;
  onViewCamera: (camera: CameraConfig) => void;
}

const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) => (
  <div className="bg-surface rounded-xl p-5 flex items-center gap-4">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

const DashboardHome = ({ onAddCamera, onViewCamera }: Props) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Atomo Processing Unit — Electron Series</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Camera} label="Active Cameras" value="2" color="bg-primary/10 text-primary" />
        <StatCard icon={Brain} label="Models Running" value="2" color="bg-accent/10 text-accent" />
        <StatCard icon={Activity} label="Detections Today" value="1,247" color="bg-success/10 text-success" />
        <StatCard icon={AlertTriangle} label="Alerts" value="3" color="bg-warning/10 text-warning" />
      </div>

      {/* Camera overview */}
      <div className="bg-surface rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Active Cameras</h2>
          <button
            onClick={onAddCamera}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-atomic text-primary-foreground text-sm font-medium glow-primary-sm hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4 h-4" /> Add Camera
          </button>
        </div>

        {mockCameras.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Camera className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">No cameras connected</h3>
            <p className="text-muted-foreground text-sm mb-6">Add your first camera to start processing</p>
            <button
              onClick={onAddCamera}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-atomic text-primary-foreground font-medium glow-primary hover:scale-105 transition-all"
            >
              <Plus className="w-5 h-5" /> Add Camera
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockCameras.map((cam) => (
              <button
                key={cam.id}
                onClick={() => onViewCamera(cam)}
                className="bg-muted/50 rounded-xl p-4 text-left hover:bg-muted transition-all group"
              >
                <div className="aspect-video bg-background rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                  <Camera className="w-8 h-8 text-muted-foreground/30" />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    <span className="text-[10px] font-medium">LIVE</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{cam.name}</h3>
                    <p className="text-xs text-muted-foreground">{cam.model} • {cam.resolution} @ {cam.fps}fps</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-primary">NPU {cam.npuUsage}%</p>
                    <p className="text-xs font-mono text-muted-foreground">CPU {cam.cpuUsage}%</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
