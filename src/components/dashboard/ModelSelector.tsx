import { Flame, User, Users, HardHat, Car, Upload, Zap } from "lucide-react";

const models = [
  { id: "fire", name: "Fire Detection", icon: Flame, version: "v3.2", accuracy: 97.8, fps: 45, compute: 23, npuOptimized: true },
  { id: "face", name: "Face Detection", icon: User, version: "v4.1", accuracy: 99.1, fps: 60, compute: 18, npuOptimized: true },
  { id: "crowd", name: "Crowd Analytics", icon: Users, version: "v2.0", accuracy: 94.5, fps: 30, compute: 35, npuOptimized: true },
  { id: "ppe", name: "PPE Detection", icon: HardHat, version: "v3.0", accuracy: 96.3, fps: 40, compute: 28, npuOptimized: true },
  { id: "vehicle", name: "Vehicle Detection", icon: Car, version: "v2.5", accuracy: 95.7, fps: 35, compute: 31, npuOptimized: false },
  { id: "custom", name: "Custom Model", icon: Upload, version: "—", accuracy: 0, fps: 0, compute: 0, npuOptimized: false },
];

interface Props {
  selected: string | null;
  onSelect: (id: string) => void;
}

const ModelSelector = ({ selected, onSelect }: Props) => {
  return (
    <div className="bg-surface rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Select AI Model</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {models.map((model) => {
          const isSelected = selected === model.id;
          return (
            <button
              key={model.id}
              onClick={() => onSelect(model.id)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/10 glow-primary-sm"
                  : "border-border bg-muted/30 hover:border-primary/30 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <model.icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                <span className="font-semibold text-sm">{model.name}</span>
              </div>
              {model.id !== "custom" && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{model.version}</span>
                    {model.npuOptimized && (
                      <span className="flex items-center gap-1 text-accent text-[10px] font-medium">
                        <Zap className="w-3 h-3" /> NPU
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {model.accuracy}% acc • {model.fps} FPS • {model.compute}% compute
                  </p>
                </div>
              )}
              {model.id === "custom" && (
                <p className="text-xs text-muted-foreground">Upload ONNX / TensorRT model</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ModelSelector;
