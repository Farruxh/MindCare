import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
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
import { ThemeProvider } from "./components/ThemeProvider.tsx";

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
                    {
                        element:
                            <ThemeProvider>
                                <ProtectedRoute>
                                    <Outlet />
                                </ProtectedRoute>
                            </ThemeProvider>,
                        children: [
                            { path: "dashboard", element: <Dashboard /> },
                            { path: "assistant/:chat_id?", element: <ChatInterface /> },
                            { path: "assessment", element: <SelfAssessment /> },
                            { path: "daily-journal", element: <DailyJournal /> },
                            { path: "meditation", element: <MeditationPage /> },
                            { path: "clinics", element: <ClinicLocator /> },
                            { path: "profile", element: <ProfilePage /> }
                        ]
                    },
                ]
            }
        ])} />
    )
}