import { Flame, User, Users, HardHat, Car, Upload, Zap, PlusCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type UniversalModel = {
  name: string;
  classes?: string[];
  num_cls?: number;
};

interface Props {
  selected: string | null;
  onSelect: (id: string) => void;
}

const ModelSelector = ({ selected, onSelect }: Props) => {
  const apiBase = import.meta.env.VITE_UMD_API_BASE || "/umd";

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["umd", "models"],
    queryFn: async (): Promise<UniversalModel[]> => {
      const r = await fetch(`${apiBase}/api/models`);
      if (!r.ok) throw new Error("Failed to load models");
      const j = (await r.json()) as { models: UniversalModel[] };
      return j.models || [];
    },
    staleTime: 10000,
  });

  const models =
    data && data.length > 0
      ? data.map((m, index) => {
          // Map backend models to cards, keeping existing visual style.
          const icons = [Flame, User, Users, HardHat, Car];
          const icon = icons[index % icons.length] || Flame;
          const classesLabel = m.classes && m.classes.length > 0 ? m.classes.join(", ") : "Generic model";
          return {
            id: m.name,
            name: m.name,
            icon,
            version: `cls: ${m.num_cls ?? (m.classes?.length ?? "—")}`,
            accuracy: 0,
            fps: 0,
            compute: 0,
            npuOptimized: true,
            subtitle: classesLabel,
          };
        })
      : [];

  return (
    <div className="bg-surface rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Select AI Model</h3>
      {isLoading && <p className="text-xs text-muted-foreground mb-2">Loading models from device…</p>}
      {isError && <p className="text-xs text-destructive mb-2">Failed to load models from device.</p>}
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
                  {model.subtitle ?? "Edge model"}{/* backend doesn’t expose accuracy/FPS directly */}
                </p>
              </div>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-4 rounded-xl border border-dashed border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40 transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-[100px]"
        >
          <PlusCircle className="w-6 h-6 text-muted-foreground" />
          <span className="font-medium text-sm text-muted-foreground">
            {isFetching ? "Loading…" : "Load more models"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ModelSelector;
