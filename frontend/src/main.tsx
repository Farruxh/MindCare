import { createRoot } from "react-dom/client";
import { AlertProvider } from "./app/context/AlertContext.tsx";
import { AuthProvider } from "./app/context/AuthContext.tsx"
import AppRoutes from "./app/AppRoutes.tsx"
import "./styles/index.css";
import GlobalAlert from "./app/components/Global/GlobalAlert.tsx";

createRoot(document.getElementById("root")!).render(
    <AlertProvider>
        <AuthProvider>
                <AppRoutes />
                <GlobalAlert />
        </AuthProvider>
    </AlertProvider>
);
