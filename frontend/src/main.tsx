import { createRoot } from "react-dom/client";
import { AlertProvider } from "./app/context/AlertContext.tsx";
import { AuthProvider } from "./app/context/AuthContext.tsx"
import AppRoutes from "./app/AppRoutes.tsx"
import "./styles/index.css";
import GlobalAlert from "./app/components/Global/GlobalAlert.tsx";
import { ThemeProvider } from "./app/context/ThemeContext.tsx";

createRoot(document.getElementById("root")!).render(
    <ThemeProvider>
        <AlertProvider>
            <AuthProvider>
                <AppRoutes />
                <GlobalAlert />
            </AuthProvider>
        </AlertProvider>
    </ThemeProvider>
);
