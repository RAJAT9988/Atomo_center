import { useState } from "react";
import { Plus, Usb, Wifi, CircuitBoard, X, Play } from "lucide-react";
import type { CameraConfig } from "@/pages/Dashboard";

const mockCameras: CameraConfig[] = [
  { id: "1", name: "Main Entrance", type: "rtsp", status: "online", resolution: "1920x1080", fps: 30, model: "Fire Detection", cpuUsage: 12, npuUsage: 45 },
  { id: "2", name: "Factory Floor A", type: "usb", status: "online", resolution: "1280x720", fps: 25, model: "PPE Detection", cpuUsage: 8, npuUsage: 38 },
  { id: "3", name: "Parking Lot B", type: "rtsp", status: "offline", resolution: "1920x1080", fps: 15, cpuUsage: 0, npuUsage: 0 },
];

interface Props {
  onOpenLiveView: (camera: CameraConfig) => void;
}

type ModalStep = "closed" | "type" | "config";
type CameraType = "usb" | "rtsp" | "csi";

const CamerasView = ({ onOpenLiveView }: Props) => {
  const [modalStep, setModalStep] = useState<ModalStep>("closed");
  const [selectedType, setSelectedType] = useState<CameraType | null>(null);

  const cameraTypes = [
    { id: "usb" as CameraType, icon: Usb, title: "USB Camera", desc: "Plug & Play local camera" },
    { id: "rtsp" as CameraType, icon: Wifi, title: "RTSP Camera", desc: "IP Camera over LAN / WAN" },
    { id: "csi" as CameraType, icon: CircuitBoard, title: "CSI Camera", desc: "Direct board-level camera" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Cameras</h1>
          <p className="text-muted-foreground">Manage connected camera devices</p>
        </div>
        <button
          onClick={() => setModalStep("type")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-atomic text-primary-foreground text-sm font-medium glow-primary-sm hover:scale-[1.02] transition-all"
        >
          <Plus className="w-4 h-4" /> Add Camera
        </button>
      </div>

      {/* Camera list */}
      <div className="space-y-3">
        {mockCameras.map((cam) => (
          <div key={cam.id} className="bg-surface rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-colors">
            <div className="w-32 h-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <div className="w-8 h-8 text-muted-foreground/30">📷</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{cam.name}</h3>
                <div className={`w-2 h-2 rounded-full ${cam.status === "online" ? "bg-success" : "bg-muted-foreground"}`} />
                <span className="text-xs text-muted-foreground uppercase">{cam.status}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {cam.type.toUpperCase()} • {cam.resolution} @ {cam.fps}fps
                {cam.model && <> • <span className="text-primary">{cam.model}</span></>}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-mono text-primary">NPU {cam.npuUsage}%</p>
              <p className="text-xs font-mono text-muted-foreground">CPU {cam.cpuUsage}%</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => onOpenLiveView(cam)}
                disabled={cam.status === "offline"}
                className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-40"
              >
                <Play className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Camera Modal */}
      {modalStep !== "closed" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg glass rounded-2xl p-8 animate-scale-in relative">
            <button onClick={() => { setModalStep("closed"); setSelectedType(null); }} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {modalStep === "type" && (
              <>
                <h2 className="text-2xl font-bold mb-2">Add New Camera</h2>
                <p className="text-muted-foreground mb-6">Select camera connection type</p>
                <div className="space-y-3">
                  {cameraTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => { setSelectedType(type.id); setModalStep("config"); }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/50 hover:bg-muted transition-all text-left group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <type.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{type.title}</h3>
                        <p className="text-sm text-muted-foreground">{type.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {modalStep === "config" && selectedType === "usb" && (
              <>
                <h2 className="text-2xl font-bold mb-6">USB Camera Setup</h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                    <p className="text-sm text-success font-medium">✓ Device detected: USB Camera 0</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-foreground mb-2">Camera Name</label>
                    <input type="text" placeholder="e.g., Lobby Camera" className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-foreground mb-2">Resolution</label>
                      <select className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                        <option>1920x1080</option>
                        <option>1280x720</option>
                        <option>640x480</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-foreground mb-2">FPS</label>
                      <select className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                        <option>30</option>
                        <option>25</option>
                        <option>15</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => setModalStep("closed")}
                    className="w-full py-3 rounded-lg bg-gradient-atomic text-primary-foreground font-semibold glow-primary-sm hover:scale-[1.01] transition-all"
                  >
                    Start Live View
                  </button>
                </div>
              </>
            )}

            {modalStep === "config" && selectedType === "rtsp" && (
              <>
                <h2 className="text-2xl font-bold mb-6">RTSP Camera Setup</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-foreground mb-2">Camera Name</label>
                    <input type="text" placeholder="e.g., Parking Camera" className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-foreground mb-2">RTSP URL</label>
                    <input type="text" placeholder="rtsp://192.168.1.100:554/stream" className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-foreground mb-2">Username</label>
                      <input type="text" placeholder="admin" className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-foreground mb-2">Password</label>
                      <input type="password" placeholder="••••••" className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                  </div>
                  <button className="w-full py-3 rounded-lg border border-border text-sm font-medium text-secondary-foreground hover:bg-muted transition-colors">
                    Test Stream Connection
                  </button>
                  <button
                    onClick={() => setModalStep("closed")}
                    className="w-full py-3 rounded-lg bg-gradient-atomic text-primary-foreground font-semibold glow-primary-sm hover:scale-[1.01] transition-all"
                  >
                    Start Live View
                  </button>
                </div>
              </>
            )}

            {modalStep === "config" && selectedType === "csi" && (
              <>
                <h2 className="text-2xl font-bold mb-6">CSI Camera Setup</h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-sm text-primary font-medium">🔍 Scanning CSI bus...</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-foreground mb-2">Camera Name</label>
                    <input type="text" placeholder="e.g., Board Camera" className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <button
                    onClick={() => setModalStep("closed")}
                    className="w-full py-3 rounded-lg bg-gradient-atomic text-primary-foreground font-semibold glow-primary-sm hover:scale-[1.01] transition-all"
                  >
                    Start Live View
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CamerasView;
