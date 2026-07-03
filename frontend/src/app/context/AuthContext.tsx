import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import axiosInstance from "../../api/axiosInstance.js"
import { useAlert } from "./AlertContext"

interface userType {
    user_id: number
    name: string
    email: string
    dark_mode: "light" | "dark"
    latitude: number
    longitude: number
    is_email_notification: boolean
    created_at: string
}

interface userContextType {
    user: userType | null
    setUser: (user: userType | null) => void
    isLoading: boolean
    isLoggingOut: boolean
    setIsLoggingOut: (isLoggingOut: boolean) => void
}

const AuthContext = createContext<userContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<userType | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const { setAlert } = useAlert()
    let isRefreshing = false

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axiosInstance.get("/api/v1/users/me");
                setUser(res.data.data);
            } catch (error: any) {
                if (error.response?.status === 401 && !isRefreshing) {
                    isRefreshing = true
                    try {
                        await axiosInstance.post("/api/v1/users/refresh-token", {});

                        const retryRes = await axiosInstance.get("/api/v1/users/me");
                        setUser(retryRes.data.data);
                        return;
                    } catch (refreshError) {
                        setAlert({ message: "Session expired. Please log in again.", severity: "error" });
                        setUser(null);
                        localStorage.clear();
                    } finally {
                        isRefreshing = false
                    }
                } else {
                    setUser(null);
                }
            } finally {
                setIsLoading(false)
            }
        }
        if (localStorage.getItem("isLoggedIn")) {
            fetchUser()
        }
        else {
            setIsLoading(false)
        }

        const interceptor = axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401 && !error.config._retry && !isRefreshing) {
                    error.config._retry = true;
                    isRefreshing = true
                    try {
                        await axiosInstance.post("/api/v1/users/refresh-token", {});
                        return axiosInstance(error.config);
                    } catch (e) {
                        setAlert({ message: "Session expired. Please log in again.", severity: "error" });
                        setUser(null);
                        localStorage.clear();
                        return Promise.reject(e);
                    } finally {
                        isRefreshing = false
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => axiosInstance.interceptors.response.eject(interceptor);
    }, [])

    return (
        <AuthContext.Provider value={{ user, setUser, isLoading, isLoggingOut, setIsLoggingOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)!