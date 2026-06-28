import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { setupDB } from "./api/api";

function App() {
  // Initialize DB tables on first load (idempotent — safe to run every time)
  useEffect(() => {
    setupDB().catch(() => {});
  }, []);

  return <AppRoutes />;
}

export default App;