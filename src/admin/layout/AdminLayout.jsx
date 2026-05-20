import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.innerWidth < 1024;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleViewportChange = (event) => {
      setSidebarCollapsed(!event.matches);
      setSidebarOpen(false);
    };

    handleViewportChange(mediaQuery);
    mediaQuery.addEventListener("change", handleViewportChange);

    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);

  return (
    <div
      className={`min-h-screen md:grid ${
        sidebarCollapsed
          ? "md:grid-cols-[72px_minmax(0,1fr)]"
          : "md:grid-cols-[240px_minmax(0,1fr)]"
      }`}
    >
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
      />

      <div className="relative min-w-0">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white/35 to-transparent" />
        <TopNav onMenuToggle={() => setSidebarOpen(true)} />
        <main className="relative px-4 py-6 md:px-6 md:py-6 xl:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
