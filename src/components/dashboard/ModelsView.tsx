import { useEffect, useRef, useState } from "react";
import { Brain, Zap, Download } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import ModelSelector from "./ModelSelector";

type UniversalModel = {
  name: string;
};

type InferenceSession = {
  id: string;
  status: string;
  model?: string;
  inputType?: string;
};

type InputType = "rtsp" | "video" | "webcam";

type InferenceDetection = {
  class_id: number;
  class_name: string;
  score: number;
  box: [number, number, number, number];
};

type WsMsg =
  | { type: "status"; status: "starting" | "running" | "stopped"; message?: string; pid?: number; simulated?: boolean; exitCode?: number }
  | { type: "inference"; frame?: number; fps?: number; inference_ms?: number; detections?: InferenceDetection[]; jpeg?: string; simulated?: boolean }
  | { type: "log"; level?: "info" | "warn" | "stderr"; message: string }
  | { type: "error"; message: string }
  | { type: "pong" };

const ModelsView = () => {
  const apiBase = import.meta.env.VITE_UMD_API_BASE || "/umd";
  const wsUrl = import.meta.env.VITE_UMD_WS_URL || "ws://localhost:8081";

  const { data: modelsData } = useQuery({
    queryKey: ["umd", "models-summary"],
    queryFn: async (): Promise<UniversalModel[]> => {
      const r = await fetch(`${apiBase}/api/models`);
      if (!r.ok) throw new Error("Failed to load models");
      const j = (await r.json()) as { models: UniversalModel[] };
      return j.models || [];
    },
    staleTime: 10_000,
  });

  const { data: sessionsData } = useQuery({
    queryKey: ["umd", "sessions"],
    queryFn: async (): Promise<InferenceSession[]> => {
      const r = await fetch(`${apiBase}/api/inference/sessions`);
      if (!r.ok) throw new Error("Failed to load sessions");
      const j = (await r.json()) as { sessions: InferenceSession[] };
      return j.sessions || [];
    },
    staleTime: 5_000,
  });

  const availableModels = modelsData?.length ?? 0;
  const activeDeployments = (sessionsData || []).filter((s) => s.status === "running").length;
  const npuOptimized = availableModels;

  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [inputType, setInputType] = useState<InputType | null>(null);
  const [rtspUrl, setRtspUrl] = useState("");
  const [uploadedVideo, setUploadedVideo] = useState<{ filename: string; path: string; originalname: string } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const [stats, setStats] = useState<{ fps?: number; detections?: number; frames?: number; inferenceMs?: number }>({});
  const [logLines, setLogLines] = useState<Array<{ ts: string; level: string; msg: string }>>([]);

  const [wsState, setWsState] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameImgRef = useRef<HTMLImageElement | null>(null);

  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamRafRef = useRef<number | null>(null);

  async function requestWebcam(): Promise<MediaStream | null> {
    if (!navigator.mediaDevices?.getUserMedia) return null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setWebcamStream(stream);
      return stream;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    if (inputType !== "webcam") {
      webcamStream?.getTracks().forEach((t) => t.stop());
      setWebcamStream(null);
    }
  }, [inputType, webcamStream]);

  useEffect(() => {
    const v = webcamVideoRef.current;
    if (v && webcamStream) {
      v.srcObject = webcamStream;
      v.play().catch(() => {});
    }
    return () => {
      if (v) v.srcObject = null;
    };
  }, [webcamStream]);

  // Draw local webcam preview into the main Live Output canvas (when not running inference)
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = webcamVideoRef.current;

    const stop = () => {
      if (webcamRafRef.current) {
        cancelAnimationFrame(webcamRafRef.current);
        webcamRafRef.current = null;
      }
    };

    if (!canvas || !video || inputType !== "webcam" || !webcamStream || running) {
      stop();
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      stop();
      return;
    }

    const loop = () => {
      // Wait until we have actual video frames
      if (video.readyState >= 2) {
        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      webcamRafRef.current = requestAnimationFrame(loop);
    };

    webcamRafRef.current = requestAnimationFrame(loop);
    return stop;
  }, [inputType, webcamStream, running]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`${apiBase}/api/upload`, { method: "POST", body: fd });
      const j = (await r.json()) as { filename: string; originalname: string; path: string };
      if (!r.ok) throw new Error((j as any)?.error || "Upload failed");
      return j;
    },
    onSuccess: (v) => setUploadedVideo(v),
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      if (!selectedModelId) throw new Error("Select a model first");
      if (!inputType) throw new Error("Select an input type");

      let inputValue = "";
      if (inputType === "rtsp") {
        if (!rtspUrl.trim()) throw new Error("Enter RTSP URL");
        inputValue = rtspUrl.trim();
      } else if (inputType === "video") {
        if (!uploadedVideo) throw new Error("Upload a video file first");
        inputValue = uploadedVideo.path;
      } else if (inputType === "webcam") {
        if (!webcamStream) {
          const s = await requestWebcam();
          if (!s) throw new Error("Camera permission denied");
        }
        inputValue = "usb:0";
      }

      const r = await fetch(`${apiBase}/api/inference/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelName: selectedModelId,
          inputType,
          inputValue,
          objThresh: 0.4,
          nmsThresh: 0.5,
          platform: "ONNX",
          logLevel: 0,
          sessionId: sessionId || undefined,
        }),
      });
      const j = (await r.json()) as { sessionId: string; error?: string };
      if (!r.ok) throw new Error(j.error || "Failed to start inference");
      return j.sessionId;
    },
    onSuccess: (sid) => {
      setSessionId(sid);
      setRunning(true);
      setStats({});
      setLogLines([]);
      safeWsSend({ type: "start", sessionId: sid });
    },
  });

  const stopMutation = useMutation({
    mutationFn: async (sid: string | null) => {
      if (!sid) throw new Error("No session to stop");
      const r = await fetch(`${apiBase}/api/inference/stop/${sid}`, { method: "POST" });
      if (!r.ok) throw new Error("Failed to stop inference");
      safeWsSend({ type: "stop", sessionId: sid });
    },
    onMutate: () => {
      setRunning(false);
    },
    onSuccess: () => {
      setSessionId(null);
      setStats({});
    },
    onError: (err) => {
      setRunning(true);
      addLog("error", err instanceof Error ? err.message : "Failed to stop");
    },
  });

  // When switching models, stop any running session and reset per-model state
  const prevModelRef = useRef<string | null>(null);
  useEffect(() => {
    const prev = prevModelRef.current;
    if (prev !== null && prev !== selectedModelId) {
      if (sessionId) {
        // Fire and forget; onSuccess will clear running/sessionId
        stopMutation.mutate(sessionId);
      }
      setRunning(false);
      setSessionId(null);
      setInputType(null);
      setRtspUrl("");
      setUploadedVideo(null);
      setStats({});
      setLogLines([]);

      // Clear live output canvas when switching models
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
    prevModelRef.current = selectedModelId;
  }, [selectedModelId, sessionId, stopMutation]);

  function addLog(level: string, msg: string) {
    const ts = new Date().toTimeString().split(" ")[0];
    setLogLines((prev) => [{ ts, level, msg }, ...prev].slice(0, 150));
  }

  function safeWsSend(data: any) {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
  }

  function drawBoxes(dets: InferenceDetection[]) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    dets.forEach((d) => {
      const [x1n, y1n, x2n, y2n] = d.box;
      const x1 = x1n * W;
      const y1 = y1n * H;
      const x2 = x2n * W;
      const y2 = y2n * H;
      const bw = x2 - x1;
      const bh = y2 - y1;

      ctx.save();
      ctx.shadowColor = "#00d4ff";
      ctx.shadowBlur = 12;
      ctx.strokeStyle = "#00d4ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, bw, bh);
      ctx.restore();

      ctx.fillStyle = "rgba(0,212,255,0.06)";
      ctx.fillRect(x1, y1, bw, bh);
    });
  }

  function handleInference(msg: Extract<WsMsg, { type: "inference" }>) {
    const dets = msg.detections || [];
    setStats((prev) => ({
      fps: msg.fps ?? prev.fps,
      inferenceMs: msg.inference_ms ?? prev.inferenceMs,
      detections: dets.length,
      frames: msg.frame ?? (prev.frames || 0) + 1,
    }));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (msg.jpeg) {
      if (!frameImgRef.current) frameImgRef.current = new Image();
      const img = frameImgRef.current;
      img.onload = () => {
        if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
        }
        ctx.drawImage(img, 0, 0);
        drawBoxes(dets);
      };
      img.src = `data:image/jpeg;base64,${msg.jpeg}`;
      return;
    }

    if (canvas.width !== 640 || canvas.height !== 480) {
      canvas.width = 640;
      canvas.height = 480;
    }
    ctx.fillStyle = "#070b10";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBoxes(dets);
  }

  useEffect(() => {
    let retry: number | undefined;

    const connect = () => {
      setWsState("connecting");
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsState("connected");
        addLog("info", "Connected to inference stream");
        if (sessionId) safeWsSend({ type: "attach", sessionId });
      };

      ws.onmessage = (e) => {
        let msg: WsMsg | null = null;
        try {
          msg = JSON.parse(e.data) as WsMsg;
        } catch {
          return;
        }

        if (!msg) return;
        if (msg.type === "log") addLog(msg.level || "info", msg.message);
        if (msg.type === "error") addLog("error", msg.message);
        if (msg.type === "status") {
          if (msg.status === "running") setRunning(true);
          if (msg.status === "stopped") setRunning(false);
          if (msg.message) addLog("info", msg.message);
        }
        if (msg.type === "inference") handleInference(msg);
      };

      ws.onclose = () => {
        setWsState("disconnected");
        retry = window.setTimeout(connect, 2000);
      };
    };

    connect();
    const ping = window.setInterval(() => safeWsSend({ type: "ping" }), 15000);

    return () => {
      if (retry) window.clearTimeout(retry);
      window.clearInterval(ping);
      wsRef.current?.close();
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsUrl]);

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
            <p className="text-2xl font-bold">{availableModels}</p>
            <p className="text-xs text-muted-foreground">Available Models</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold">{npuOptimized}</p>
            <p className="text-xs text-muted-foreground">NPU Optimized (assumed)</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <Download className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">{activeDeployments}</p>
            <p className="text-xs text-muted-foreground">Active Deployments</p>
          </div>
        </div>
      </div>

      <ModelSelector selected={selectedModelId} onSelect={setSelectedModelId} />

      {selectedModelId && (
        <div className="grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-6">
          <div className="space-y-4">
            <div className="bg-surface rounded-xl p-5 border border-border space-y-3">
              <div className="text-xs font-semibold text-muted-foreground mb-1">
                Run model: <span className="font-mono text-foreground">{selectedModelId}</span>
              </div>
              <div className="flex gap-2 text-xs">
                <Button
                  variant={inputType === "rtsp" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInputType("rtsp")}
                >
                  RTSP
                </Button>
                <Button
                  variant={inputType === "video" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInputType("video")}
                >
                  Video
                </Button>
                <Button
                  variant={inputType === "webcam" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInputType("webcam")}
                >
                  Webcam
                </Button>
              </div>

              {inputType === "rtsp" && (
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">RTSP URL</label>
                  <input
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    placeholder="rtsp://user:pass@ip:554/stream"
                    value={rtspUrl}
                    onChange={(e) => setRtspUrl(e.target.value)}
                  />
                </div>
              )}

              {inputType === "video" && (
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Video file</label>
                  <input
                    type="file"
                    accept="video/*"
                    className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium hover:file:bg-muted/80"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadMutation.mutate(f);
                    }}
                  />
                  <div className="text-[11px] text-muted-foreground">
                    {uploadedVideo ? (
                      <span>
                        Uploaded: <span className="font-mono">{uploadedVideo.originalname}</span>
                      </span>
                    ) : (
                      "Choose a video file to upload to the device."
                    )}
                  </div>
                </div>
              )}

              {inputType === "webcam" && (
                // Hidden element used as the capture source for Live Output canvas preview.
                <video ref={webcamVideoRef} autoPlay muted playsInline className="hidden" />
              )}

              <div className="flex gap-2 pt-2">
                <Button className="flex-1" disabled={startMutation.isPending || stopMutation.isPending} onClick={() => startMutation.mutate()}>
                  {running ? "Restart" : "Start"}
                </Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  disabled={!running || stopMutation.isPending}
                  onClick={() => stopMutation.mutate(sessionId)}
                >
                  Stop
                </Button>
              </div>
              {(startMutation.error || uploadMutation.error) && (
                <p className="text-xs text-destructive">
                  {String((startMutation.error as Error | null)?.message || (uploadMutation.error as Error | null)?.message || "Error")}
                </p>
              )}
              <div className="text-[11px] text-muted-foreground">
                WS:{" "}
                <span className={wsState === "connected" ? "text-success" : wsState === "connecting" ? "text-accent" : "text-destructive"}>
                  {wsState}
                </span>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2 border-b border-border text-xs text-muted-foreground flex items-center justify-between">
                <span>Detection Log</span>
                <button className="text-primary hover:underline" onClick={() => setLogLines([])}>
                  Clear
                </button>
              </div>
              <div className="max-h-44 overflow-auto font-mono text-[11px]">
                {logLines.length === 0 ? (
                  <div className="p-3 text-muted-foreground">// Waiting for inference…</div>
                ) : (
                  logLines.map((l, idx) => (
                    <div key={idx} className="px-3 py-1 border-b border-border/40 flex gap-2">
                      <span className="text-muted-foreground w-[64px] shrink-0">{l.ts}</span>
                      <span
                        className={
                          l.level === "stderr" || l.level === "error"
                            ? "text-destructive"
                            : l.level === "warn"
                              ? "text-accent"
                              : "text-foreground"
                        }
                      >
                        {l.msg}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-surface rounded-xl p-4 border border-border">
                <div className="text-[10px] tracking-wider text-muted-foreground">FPS</div>
                <div className="text-2xl font-bold">{stats.fps?.toFixed?.(1) ?? "—"}</div>
              </div>
              <div className="bg-surface rounded-xl p-4 border border-border">
                <div className="text-[10px] tracking-wider text-muted-foreground">INFERENCE</div>
                <div className="text-2xl font-bold">{stats.inferenceMs?.toFixed?.(1) ?? "—"}</div>
                <div className="text-[10px] text-muted-foreground">ms</div>
              </div>
              <div className="bg-surface rounded-xl p-4 border border-border">
                <div className="text-[10px] tracking-wider text-muted-foreground">DETECTIONS</div>
                <div className="text-2xl font-bold">{stats.detections ?? 0}</div>
              </div>
              <div className="bg-surface rounded-xl p-4 border border-border">
                <div className="text-[10px] tracking-wider text-muted-foreground">FRAMES</div>
                <div className="text-2xl font-bold">{stats.frames ?? 0}</div>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2 border-b border-border text-xs text-muted-foreground">Live Output</div>
              <div className="p-4 flex items-center justify-center bg-background/30">
                <canvas ref={canvasRef} className="max-w-full rounded-md border border-border" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelsView;
