import { useState } from "react";
import { ArrowLeft, Camera, Square, ImageIcon, Circle, Play, Pause, Zap } from "lucide-react";
import type { CameraConfig } from "@/pages/Dashboard";
import ModelSelector from "./ModelSelector";
import LiveStats from "./LiveStats";

interface Props {
  camera: CameraConfig | null;
  onBack: () => void;
}

const LiveViewScreen = ({ camera, onBack }: Props) => {
  const [processing, setProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(camera?.model || null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{camera?.name || "Live View"}</h1>
          <p className="text-sm text-muted-foreground">
            {camera?.type.toUpperCase()} • {camera?.resolution} @ {camera?.fps}fps
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm text-success font-medium">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface rounded-xl overflow-hidden">
            <div className="aspect-video bg-background relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-accent/3" />
              <Camera className="w-16 h-16 text-muted-foreground/20" />
              {processing && (
                <>
                  {/* Simulated bounding boxes */}
                  <div className="absolute top-[20%] left-[15%] w-[25%] h-[40%] border-2 border-success rounded-md">
                    <span className="absolute -top-5 left-0 text-[10px] font-mono bg-success text-success-foreground px-1.5 py-0.5 rounded">
                      Person 98.2%
                    </span>
                  </div>
                  <div className="absolute top-[30%] right-[20%] w-[18%] h-[35%] border-2 border-warning rounded-md">
                    <span className="absolute -top-5 left-0 text-[10px] font-mono bg-warning text-warning-foreground px-1.5 py-0.5 rounded">
                      No Helmet 94.5%
                    </span>
                  </div>
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-destructive/90 backdrop-blur-sm">
                    <Circle className="w-2 h-2 fill-destructive-foreground text-destructive-foreground animate-pulse" />
                    <span className="text-[10px] font-mono text-destructive-foreground font-bold">REC</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {!processing ? (
              <button
                onClick={() => setProcessing(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-atomic text-primary-foreground font-medium glow-primary-sm hover:scale-[1.02] transition-all"
              >
                <Zap className="w-4 h-4" /> Start AI Processing
              </button>
            ) : (
              <button
                onClick={() => setProcessing(false)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-destructive text-destructive-foreground font-medium hover:scale-[1.02] transition-all"
              >
                <Pause className="w-4 h-4" /> Stop Processing
              </button>
            )}
            <button className="p-2.5 rounded-lg border border-border hover:bg-muted transition-colors">
              <Square className="w-4 h-4" />
            </button>
            <button className="p-2.5 rounded-lg border border-border hover:bg-muted transition-colors">
              <ImageIcon className="w-4 h-4" />
            </button>
            <button className="p-2.5 rounded-lg border border-border hover:bg-muted transition-colors">
              <Circle className="w-4 h-4 text-destructive" />
            </button>
          </div>

          {/* Model Selection */}
          <ModelSelector selected={selectedModel} onSelect={setSelectedModel} />
        </div>

        {/* Right side info */}
        <div className="space-y-4">
          <div className="bg-surface rounded-xl p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Camera Info</h3>
            <div className="space-y-3">
              {[
                ["Stream", camera?.resolution || "—"],
                ["FPS", `${camera?.fps || 0}`],
                ["Latency", "12ms"],
                ["Bitrate", "4.2 Mbps"],
                ["Codec", "H.264"],
                ["Connection", camera?.type.toUpperCase() || "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-mono font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {processing && <LiveStats />}
        </div>
      </div>
    </div>
  );
};

export default LiveViewScreen;
