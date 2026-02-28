import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import DashboardHome from "@/components/dashboard/DashboardHome";
import CamerasView from "@/components/dashboard/CamerasView";
import LiveViewScreen from "@/components/dashboard/LiveViewScreen";
import ModelsView from "@/components/dashboard/ModelsView";
import AnalyticsView from "@/components/dashboard/AnalyticsView";
import SystemView from "@/components/dashboard/SystemView";
import SettingsView from "@/components/dashboard/SettingsView";

export type DashboardView = "home" | "cameras" | "liveview" | "models" | "analytics" | "system" | "settings";

export interface CameraConfig {
  id: string;
  name: string;
  type: "usb" | "rtsp" | "csi";
  status: "online" | "offline";
  resolution: string;
  fps: number;
  model?: string;
  cpuUsage: number;
  npuUsage: number;
}

const Dashboard = () => {
  const [view, setView] = useState<DashboardView>("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<CameraConfig | null>(null);

  const handleOpenLiveView = (camera: CameraConfig) => {
    setSelectedCamera(camera);
    setView("liveview");
  };

  const renderView = () => {
    switch (view) {
      case "home":
        return <DashboardHome onAddCamera={() => setView("cameras")} onViewCamera={handleOpenLiveView} />;
      case "cameras":
        return <CamerasView onOpenLiveView={handleOpenLiveView} />;
      case "liveview":
        return <LiveViewScreen camera={selectedCamera} onBack={() => setView("cameras")} />;
      case "models":
        return <ModelsView />;
      case "analytics":
        return <AnalyticsView />;
      case "system":
        return <SystemView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardHome onAddCamera={() => setView("cameras")} onViewCamera={handleOpenLiveView} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        currentView={view}
        onNavigate={setView}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardTopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-6 overflow-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
