import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App";
import { SignUpPage } from "./components/pages/SignUpPage.tsx";
import { LoginPage } from "./components/pages/LoginPage.tsx";
import { LandingPage } from "./components/pages/LandingPage.tsx";
import { Dashboard } from "./components/pages/Dashboard.tsx";
import { ProfilePage } from "./components/pages/ProfilePage.tsx";
import { ForgotPassword } from "./components/pages/ForgotPassword.tsx";
import { VerifyPasswordToken } from "./components/pages/VerifyPasswordToken.tsx";
import { ResetPassword } from "./components/pages/ResetPassword.tsx"
import { ChatInterface } from "./components/pages/ChatInterface.tsx";
import { SelfAssessment } from "./components/pages/SelfAssessment.tsx";
import { DailyJournal } from "./components/pages/DailyJournal.tsx"
import { MeditationPage } from "./components/pages/MeditationPage.tsx";
import { ClinicLocator } from "./components/pages/ClinicLocator.tsx"
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";

export default function AppRoutes() {
    return (
        <RouterProvider router={createBrowserRouter([
            {
                path: "/",
                element: <App />,
                children: [
                    { index: true, element: <LandingPage /> },
                    { path: "signup", element: <SignUpPage /> },
                    { path: "login", element: <LoginPage /> },
                    { path: "forgot-password", element: <ForgotPassword /> },
                    { path: "verify-token", element: <VerifyPasswordToken /> },
                    { path: "reset-password", element: <ResetPassword /> },
                    { path: "dashboard", element: <ProtectedRoute> <Dashboard /> </ProtectedRoute> },
                    { path: "assistant/:chat_id", element: <ProtectedRoute> <ChatInterface /> </ProtectedRoute> },
                    { path: "assessment", element: <ProtectedRoute> <SelfAssessment /> </ProtectedRoute> },
                    { path: "daily-journal", element: <ProtectedRoute> <DailyJournal /> </ProtectedRoute> },
                    { path: "meditation", element: <ProtectedRoute> <MeditationPage /> </ProtectedRoute> },
                    { path: "clinics", element: <ProtectedRoute> <ClinicLocator /> </ProtectedRoute> },
                    { path: "profile", element: <ProtectedRoute> <ProfilePage /> </ProtectedRoute> }
                ]
            }
        ])} />
    )
}