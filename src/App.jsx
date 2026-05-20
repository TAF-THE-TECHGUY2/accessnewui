import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppRouter from "./router/AppRouter";

function App() {
  const location = useLocation();

  useEffect(() => {
    const isAdminRoute = location.pathname.startsWith("/admin");
    document.body.classList.toggle("theme-admin", isAdminRoute);

    return () => {
      document.body.classList.remove("theme-admin");
    };
  }, [location.pathname]);

  return <AppRouter />;
}

export default App;
