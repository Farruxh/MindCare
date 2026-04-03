import { createRoot } from "react-dom/client";
import { AlertProvider } from "./app/context/AlertContext.tsx";
import { AuthProvider } from "./app/context/AuthContext.tsx"
import App from "./app/App.tsx";
import AppRoutes from "./app/AppRoutes.tsx"
import "./styles/index.css";
import { Global } from "recharts";
import GlobalAlert from "./app/components/Alert/GlobalAlert.tsx";

createRoot(document.getElementById("root")!).render(
        <AlertProvider>
            <AuthProvider>
                <AppRoutes />
                <GlobalAlert />
            </AuthProvider>
        </AlertProvider>
);
