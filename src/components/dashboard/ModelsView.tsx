import { Brain, Zap, Download } from "lucide-react";
import ModelSelector from "./ModelSelector";

const ModelsView = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-1">AI Models</h1>
        <p className="text-muted-foreground">Manage and deploy edge AI models</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">6</p>
            <p className="text-xs text-muted-foreground">Available Models</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold">4</p>
            <p className="text-xs text-muted-foreground">NPU Optimized</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <Download className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">2</p>
            <p className="text-xs text-muted-foreground">Active Deployments</p>
          </div>
        </div>
      </div>

      <ModelSelector selected={null} onSelect={() => {}} />
    </div>
  );
};

export default ModelsView;
